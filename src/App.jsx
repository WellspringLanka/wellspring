import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// The main layout wrapping every page
const Layout = ({ children }) => (
  <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
    <header style={{ backgroundColor: '#2563eb', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>Dispensary System</h1>
      </Link>
      <nav style={{ fontSize: '14px' }}>
        <span style={{ opacity: 0.8 }}>Patient Portal (Coming Soon)</span>
      </nav>
    </header>
    <main style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      {children}
    </main>
  </div>
);

// The Main Dashboard with 4 Tiles
const Dashboard = () => {
  const tileStyle = {
    backgroundColor: 'white',
    padding: '40px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '18px',
    border: '2px solid transparent',
    transition: '0.2s',
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Select Module</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        
        <Link to="/admin" className="custom-tile" style={{ ...tileStyle, borderTop: '4px solid #8b5cf6' }}>
          Admin & Reception
          <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#6b7280', marginTop: '8px' }}>Patient Registration, Tickets, Reports</div>
        </Link>

        <Link to="/doctor" className="custom-tile" style={{ ...tileStyle, borderTop: '4px solid #ef4444' }}>
          Doctor Consultation
          <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#6b7280', marginTop: '8px' }}>Symptoms, Diagnoses, Prescriptions</div>
        </Link>

        <Link to="/counter" className="custom-tile" style={{ ...tileStyle, borderTop: '4px solid #10b981' }}>
          Counter
          <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#6b7280', marginTop: '8px' }}>Medicine Issuing & Billing</div>
        </Link>

        <Link to="/grn" className="custom-tile" style={{ ...tileStyle, borderTop: '4px solid #f59e0b' }}>
          GRN (Inventory)
          <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#6b7280', marginTop: '8px' }}>Stock Intake, Suppliers, Adjustments</div>
        </Link>

      </div>
    </div>
  );
};

// Module Views
const AdminView = () => (
  <div>
    <h2>Admin & Reception</h2>
    <p>Search legacy patients and create new ticket_master records.</p>
    <Link to="/">← Back to Dashboard</Link>
  </div>
);

const DoctorView = () => (
  <div>
    <h2>Doctor Consultation</h2>
    <p>Record reason_for_encounter, findings, and general prescriptions.</p>
    <Link to="/">← Back to Dashboard</Link>
  </div>
);

const CounterView = () => (
  <div>
    <h2>Counter</h2>
    <p>Multi-tab supported billing and medicine issuing.</p>
    <Link to="/">← Back to Dashboard</Link>
  </div>
);

const GRNView = () => (
  <div>
    <h2>Goods Received Note (GRN)</h2>
    <p>Manage incoming pharmacy stock and update inventory levels.</p>
    <Link to="/">← Back to Dashboard</Link>
  </div>
);

// App Router
export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/doctor" element={<DoctorView />} />
          <Route path="/counter" element={<CounterView />} />
          <Route path="/grn" element={<GRNView />} />
        </Routes>
      </Layout>
    </Router>
  );
}