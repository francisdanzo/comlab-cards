export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@400;600&display=swap');

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        @keyframes logo-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(34,197,94,0.4), 0 0 80px rgba(34,197,94,0.15); }
          50%       { box-shadow: 0 0 70px rgba(34,197,94,0.65), 0 0 120px rgba(34,197,94,0.25); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .home-bg {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at 30% 30%, #0d2010 0%, #000 60%, #0a1a0d 100%);
          background-size: 200% 200%;
          animation: gradient-shift 18s ease infinite;
          position: relative;
          overflow: hidden;
        }
        .home-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(34,197,94,0.10) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none;
        }
        .home-center {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 40px 24px;
          animation: fade-up 0.8s ease both;
        }
        .home-logo {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          animation: logo-glow 3.5s ease-in-out infinite;
          filter: drop-shadow(0 0 18px rgba(34,197,94,0.55));
          margin-bottom: 36px;
        }
        .home-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(32px, 8vw, 72px);
          font-weight: 900;
          color: #22C55E;
          letter-spacing: 0.07em;
          text-shadow: 0 0 50px rgba(34,197,94,0.5);
          margin: 0 0 12px;
          line-height: 1;
        }
        .home-sub {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(11px, 2vw, 15px);
          letter-spacing: 0.28em;
          color: #3a6644;
          text-transform: uppercase;
          margin: 0 0 48px;
        }
        .home-divider {
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #22C55E, transparent);
          margin: 0 auto;
        }
      `}</style>

      <div className="home-bg">
        <div className="home-grid" />
        <div className="home-center">
          <img
            src="/logo/junetech_logo.png"
            alt="JuneTech"
            className="home-logo"
          />
          <h1 className="home-title">JUNETECH 2026</h1>
          <p className="home-sub">Le Digital Est Abordable</p>
          <div className="home-divider" />
        </div>
      </div>
    </>
  )
}
