import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SLIDER_IMAGES, useDashboardLogic } from './dashboardLogic';
import './App.css';
import DoctorPortal from './DoctorPortal';

// Top Navigation Bar
const TopNavbar = ({ currentTime, doctorOnline, counterOnline }) => (
  <header className="top-navbar">
    <Link to="/" className="nav-brand">
      <div className="brand-cross">+</div>
      <span className="brand-name">Wellspring Health Care</span>
    </Link>

    <nav className="nav-links">
      <a href="#hero" className="nav-item">Home</a>
      <a href="#modules" className="nav-item">Terminals</a>
      <Link to="/queue" className="nav-item">Queue</Link>
      <a href="#about" className="nav-item">About</a>
      <a href="#contact" className="nav-item">Contact Us</a>
      <span className="nav-portal-btn">Online Booking (Soon)</span>
    </nav>

    <div className="nav-telemetry">
      <div className="staff-status-group">
        <div className="staff-badge">
          <span className={`status-dot ${doctorOnline ? 'online' : 'offline'}`}></span>
          <span>Doctor</span>
        </div>
        <div className="staff-badge">
          <span className={`status-dot ${counterOnline ? 'online' : 'offline'}`}></span>
          <span>Counter</span>
        </div>
      </div>
      <div className="clock-display">
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
    </div>
  </header>
);

// Main Front Page
const HomePage = () => {
  const {
    canvasRef,
    currentSlide,
    setCurrentSlide,
    currentTime,
    doctorOnline,
    counterOnline,
    telemetry,
    heroStyle,
    tilesVisible
  } = useDashboardLogic();

  return (
    <div>
      <TopNavbar currentTime={currentTime} doctorOnline={doctorOnline} counterOnline={counterOnline} />

      {/* HERO SECTION WITH SLIDER, MOLECULAR PARTICLES & TELEMETRY */}
      <section id="hero" className="hero-section">
        {SLIDER_IMAGES.map((imgUrl, index) => (
          <div
            key={index}
            className={`slider-bg ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${imgUrl})` }}
          />
        ))}
        <div className="hero-overlay"></div>

        <canvas ref={canvasRef} className="particle-canvas" />

        <div className="hero-content" style={heroStyle}>
          <span className="medical-pill-tag">Patient Care &amp; Dispensary Management</span>
          <h1 className="wellspring-title">Wellspring</h1>
          <p className="healthcare-subtitle">Health Care Center</p>

          {/* Live Clinic Telemetry ("Pulse" Board - Privacy Safe) */}
          <div className="telemetry-hud-bar">
            <div className="telemetry-metric">
              <span className="metric-indicator emerald"></span>
              <div className="metric-text">
                <span className="metric-label">Current Queue</span>
                <span className="metric-value">{telemetry.activeQueue} Waiting</span>
              </div>
            </div>

            <div className="telemetry-divider"></div>

            <div className="telemetry-metric">
              <span className="metric-indicator"></span>
              <div className="metric-text">
                <span className="metric-label">Daily Traffic</span>
                <span className="metric-value">{telemetry.servedToday} Served Today</span>
              </div>
            </div>

            <div className="telemetry-divider"></div>

            <div className="telemetry-metric">
              <span className="metric-indicator emerald"></span>
              <div className="metric-text">
                <span className="metric-label">Consultation Status</span>
                <span className="metric-value">{telemetry.roomStatus}</span>
              </div>
            </div>
          </div>

          <div className="slider-indicators">
            {SLIDER_IMAGES.map((_, index) => (
              <button
                key={index}
                className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <a href="#modules" className="scroll-prompt">
          <span>Scroll to Clinical Modules</span>
          <span>↓</span>
        </a>
      </section>

      {/* 4 MODULE TILES SECTION */}
      <section id="modules" className="modules-section">
        <div className={`section-header ${tilesVisible ? 'visible' : ''}`}>
          <h2>Clinical Management Portal</h2>
          <p>Select a department module to begin managing patient care and dispensary operations</p>
        </div>

        <div className="tiles-grid">
          {/* 1. ADMIN TILE */}
          <Link to="/admin" className={`module-tile ${tilesVisible ? 'slide-in' : ''}`}>
            <div className="tile-accent-line"></div>
            <div className="tile-top-row">
              <div className="tile-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="m9 16 3-3 3 3" />
                </svg>
              </div>
              <span className="tile-badge">Management</span>
            </div>
            <h3 className="tile-title">Admin</h3>
            <p className="tile-desc">
              System administration, clinic financial analytics, revenue tracking, and staff account management.
            </p>
            <div className="tile-footer">
              <span>Open Admin Portal</span>
              <span>→</span>
            </div>
          </Link>

          {/* 2. DOCTOR TILE */}
          <Link to="/doctor" className={`module-tile ${tilesVisible ? 'slide-in' : ''}`}>
            <div className="tile-accent-line"></div>
            <div className="tile-top-row">
              <div className="tile-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                  <circle cx="20" cy="10" r="2" />
                </svg>
              </div>
              <span className="tile-badge">Consultation</span>
            </div>
            <h3 className="tile-title">Doctor</h3>
            <p className="tile-desc">
              Patient examinations, symptom and diagnosis records, medical history, and instant prescriptions.
            </p>
            <div className="tile-footer">
              <span>Open Consultation</span>
              <span>→</span>
            </div>
          </Link>

          {/* 3. COUNTER TILE */}
          <Link to="/counter" className={`module-tile ${tilesVisible ? 'slide-in' : ''}`}>
            <div className="tile-accent-line"></div>
            <div className="tile-top-row">
              <div className="tile-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="tile-badge">Front Desk</span>
            </div>
            <h3 className="tile-title">Counter</h3>
            <p className="tile-desc">
              Patient registration, appointment ticketing, multi-tab medicine dispensing, and live billing.
            </p>
            <div className="tile-footer">
              <span>Open Counter</span>
              <span>→</span>
            </div>
          </Link>

          {/* 4. STOCK / GRN TILE */}
          <Link to="/grn" className={`module-tile ${tilesVisible ? 'slide-in' : ''}`}>
            <div className="tile-accent-line"></div>
            <div className="tile-top-row">
              <div className="tile-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              <span className="tile-badge">Inventory</span>
            </div>
            <h3 className="tile-title">Stock &amp; GRN</h3>
            <p className="tile-desc">
              Goods Received Notes, medicine batch intake, expiry tracking, and supplier inventory logs.
            </p>
            <div className="tile-footer">
              <span>Open Inventory</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

// Temporary Placeholders for Inner Pages
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '120px 40px', textAlign: 'center' }}>
    <h1 style={{ color: '#38bdf8', marginBottom: '20px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h1>
    <Link to="/" style={{ color: '#f8fafc', textDecoration: 'underline' }}>← Return to Wellspring Home</Link>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<PlaceholderPage title="Admin Management Portal" />} />
        <Route path="/doctor" element={<DoctorPortal />} />
        <Route path="/counter" element={<PlaceholderPage title="Front Desk Counter Portal" />} />
        <Route path="/grn" element={<PlaceholderPage title="Stock & GRN Inventory Portal" />} />
        <Route path="/queue" element={<PlaceholderPage title="Live Clinic Queue" />} />
      </Routes>
    </Router>
  );
}