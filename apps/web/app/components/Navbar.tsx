import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        NYX
      </div>
      <div className="navbar-actions">
        <ConnectButton showBalance={false} />
      </div>
    </nav>
  );
}
