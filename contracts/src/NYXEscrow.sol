// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract NYXEscrow {
    enum RootState { DRAFT, FROZEN, FUNDED, EXECUTING, READY, RESOLVED }
    enum PathState { DORMANT, ACTIVE, PASSED, FAILED, EXPIRED }
    enum CreditState { NONE, AVAILABLE, CONSUMED, EXPIRED, RETURNED }

    struct Policy {
        uint256 capitalCap;
        uint256 primaryBudget;
        uint256 fallbackBudget;
        uint256 analysisBudget;
        
        address primaryWorker;
        address fallbackWorker;
        address analysisWorker;

        uint256 primaryDeadline;
        uint256 fallbackDeadline;

        bytes32 policyHash;
    }

    struct Credit {
        address sourceNode;
        address targetNode;
        uint256 amount;
        CreditState status;
    }

    RootState public rootState = RootState.DRAFT;
    PathState public primaryState = PathState.DORMANT;
    PathState public fallbackState = PathState.DORMANT;
    PathState public analysisState = PathState.DORMANT;

    Policy public policy;
    Credit public contingentCredit;
    IERC20 public usdc;
    address public client;
    
    // Predicate constraints for MVP
    uint256 public constant FRESHNESS_WINDOW = 20;

    constructor(address _usdc, address _client) {
        usdc = IERC20(_usdc);
        client = _client;
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    function createPolicy(
        uint256 _primaryBudget,
        uint256 _fallbackBudget,
        uint256 _analysisBudget,
        address _primaryWorker,
        address _fallbackWorker,
        address _analysisWorker,
        uint256 _primaryDeadline,
        uint256 _fallbackDeadline
    ) external {
        require(rootState == RootState.DRAFT, "Must be DRAFT");
        require(msg.sender == client, "Only client");
        
        uint256 cap = max(_primaryBudget + _analysisBudget, _fallbackBudget + _analysisBudget);
        
        bytes32 pHash = keccak256(abi.encode(
            cap, _primaryBudget, _fallbackBudget, _analysisBudget,
            _primaryWorker, _fallbackWorker, _analysisWorker,
            _primaryDeadline, _fallbackDeadline
        ));

        policy = Policy({
            capitalCap: cap,
            primaryBudget: _primaryBudget,
            fallbackBudget: _fallbackBudget,
            analysisBudget: _analysisBudget,
            primaryWorker: _primaryWorker,
            fallbackWorker: _fallbackWorker,
            analysisWorker: _analysisWorker,
            primaryDeadline: _primaryDeadline,
            fallbackDeadline: _fallbackDeadline,
            policyHash: pHash
        });

        rootState = RootState.FROZEN;
    }

    function fund() external {
        require(rootState == RootState.FROZEN, "Must be FROZEN");
        require(usdc.transferFrom(msg.sender, address(this), policy.capitalCap), "Transfer failed");
        
        rootState = RootState.FUNDED;
    }

    function startExecution() external {
        require(rootState == RootState.FUNDED, "Must be FUNDED");
        rootState = RootState.EXECUTING;
        primaryState = PathState.ACTIVE;
    }

    // Deterministic predicates logic (freshness)
    function verifyFreshness(uint256 sourceBlock) internal view returns (bool) {
        return (block.number - sourceBlock) <= FRESHNESS_WINDOW;
    }

    function submitPrimaryReport(uint256 sourceBlock) external {
        require(rootState == RootState.EXECUTING, "Must be EXECUTING");
        require(primaryState == PathState.ACTIVE, "Primary must be active");
        require(msg.sender == policy.primaryWorker, "Not primary worker");

        if (block.timestamp > policy.primaryDeadline) {
            primaryState = PathState.EXPIRED;
            _releasePrimaryCredit();
        } else if (verifyFreshness(sourceBlock)) {
            primaryState = PathState.PASSED;
            analysisState = PathState.ACTIVE; // Move to analysis
        } else {
            primaryState = PathState.FAILED;
            _releasePrimaryCredit();
        }
    }

    function _releasePrimaryCredit() internal {
        // Releases capital to fallback as NYX Credit
        contingentCredit = Credit({
            sourceNode: policy.primaryWorker,
            targetNode: policy.fallbackWorker,
            amount: policy.primaryBudget,
            status: CreditState.AVAILABLE
        });
        fallbackState = PathState.ACTIVE;
    }

    function consumeCreditAndSubmitFallback(uint256 sourceBlock) external {
        require(rootState == RootState.EXECUTING, "Must be EXECUTING");
        require(fallbackState == PathState.ACTIVE, "Fallback must be active");
        require(msg.sender == policy.fallbackWorker, "Not fallback worker");
        require(contingentCredit.status == CreditState.AVAILABLE, "No available credit");
        require(contingentCredit.targetNode == msg.sender, "Credit not for this target");

        // Consume credit
        contingentCredit.status = CreditState.CONSUMED;

        if (block.timestamp > policy.fallbackDeadline) {
            fallbackState = PathState.EXPIRED;
            rootState = RootState.READY; // nothing else to do
        } else if (verifyFreshness(sourceBlock)) {
            fallbackState = PathState.PASSED;
            analysisState = PathState.ACTIVE; // Move to analysis
        } else {
            fallbackState = PathState.FAILED;
            rootState = RootState.READY; // End of paths
        }
    }

    function submitAnalysisReport() external {
        require(rootState == RootState.EXECUTING, "Must be EXECUTING");
        require(analysisState == PathState.ACTIVE, "Analysis must be active");
        require(msg.sender == policy.analysisWorker, "Not analysis worker");
        
        analysisState = PathState.PASSED;
        rootState = RootState.READY;
    }

    function resolve() external {
        require(rootState == RootState.READY, "Must be READY");
        
        uint256 usedCapital = 0;
        
        if (primaryState == PathState.PASSED) {
            usdc.transfer(policy.primaryWorker, policy.primaryBudget);
            usedCapital += policy.primaryBudget;
        } else if (fallbackState == PathState.PASSED && contingentCredit.status == CreditState.CONSUMED) {
            usdc.transfer(policy.fallbackWorker, policy.fallbackBudget);
            usedCapital += policy.fallbackBudget;
        }
        
        if (analysisState == PathState.PASSED) {
            usdc.transfer(policy.analysisWorker, policy.analysisBudget);
            usedCapital += policy.analysisBudget;
        }

        // Return unused capital to client
        uint256 remaining = policy.capitalCap - usedCapital;
        if (remaining > 0) {
            usdc.transfer(client, remaining);
        }
        
        rootState = RootState.RESOLVED;
    }
}
