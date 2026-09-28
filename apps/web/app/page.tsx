import Galaxy from './components/Galaxy';

export default function Home() {
  return (
    <div className="page-root">
      {/* Full-screen WebGL background */}
      <div className="galaxy-bg">
        <Galaxy
          hueShift={220}
          saturation={1.8}
          glowIntensity={0.45}
          density={1.2}
          twinkleIntensity={0.5}
          rotationSpeed={0.04}
          speed={0.6}
          repulsionStrength={1.8}
          transparent={false}
        />
      </div>

      {/* Page layout */}
      <main className="page-main">
        {/* Left hero section */}
        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-eyebrow">Financial Intelligence</p>
            <h1 className="hero-headline">
              Your portal to<br />
              <span className="hero-headline-accent">tomorrow&apos;s</span><br />
              financial security.
            </h1>
            <p className="hero-sub">
              Navigate markets with clarity. Build wealth with confidence.
            </p>
            <div className="hero-cta-row">
              <button className="btn-primary" id="get-started-btn">Get Started</button>
              <button className="btn-ghost" id="learn-more-btn">Learn More →</button>
            </div>
          </div>
        </section>

        {/* Right section — empty, letting the galaxy breathe */}
        <section className="right-section" />
      </main>
    </div>
  );
}
