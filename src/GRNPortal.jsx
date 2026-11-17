import { Link } from 'react-router-dom';
import { useGRNLogic } from './grnLogic';
import './DoctorPortal.css'; // Reusing standard UI styles

export default function GRNPortal() {
  const {
    loggedInUser, loginUsername, setLoginUsername, loginPassword, setLoginPassword, loginError, loggingIn, handleLogin, handleLogout,
    medicines, loadingMeds, searchTerm, setSearchTerm,
    medForm, setMedForm, savingMed, handleSaveMedicine, handleDeleteMedicine, statusBanner
  } = useGRNLogic();

  if (!loggedInUser) {
    return (
      <div className="doctor-login-wrapper" style={{ background: '#f8fafc' }}>
        <div className="login-card">
          <div className="login-header">
            <div className="login-brand-script">Wellspring</div>
            <span className="login-badge" style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #16a34a' }}>Inventory & GRN</span>
            <h1>GRN Access</h1>
            <p>Log in with any active Admin, Doctor, or Cashier account.</p>
          </div>
          {loginError && <div className="login-error-msg">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="login-form-group">
              <label>Username</label>
              <input type="text" required className="login-input" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} autoFocus />
            </div>
            <div className="login-form-group">
              <label>Password</label>
              <input type="password" required className="login-input" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loggingIn} className="login-submit-btn" style={{ background: '#16a34a' }}>
              {loggingIn ? 'Authenticating...' : 'Access Inventory'}
            </button>
          </form>
          <Link to="/" className="login-back-link">← Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-portal-wrapper theme-teal">
      <header className="doc-topbar" style={{ padding: '0 28px' }}>
        <div className="doc-topbar-left">
          <Link to="/" className="doc-back-btn">← Home</Link>
          <div className="topbar-divider"></div>
          <div className="doc-identity-info">
            <h1 className="doc-name-heading">Inventory & Goods Receiving</h1>
            <span className="doc-specialty-tag">Authorized User: {loggedInUser.name}</span>
          </div>
        </div>
        <div className="doc-topbar-right">
          <button type="button" onClick={handleLogout} className="doc-logout-btn">Sign Out</button>
        </div>
      </header>

      {statusBanner && (
        <div className={`doc-toast-banner ${statusBanner.type}`}>{statusBanner.message}</div>
      )}

      <div style={{ padding: '24px 28px', maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* ADD/EDIT FORM */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1.5px solid #dbe4f0', boxShadow: '0 10px 28px rgba(15,23,42,0.06)' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '16px', color: '#0f172a' }}>
            {medForm.id ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
          <form onSubmit={handleSaveMedicine}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>Medicine Name</label>
              <input type="text" required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '1rem' }} value={medForm.name} onChange={e => setMedForm({ ...medForm, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>Selling Price (Rs)</label>
              <input type="number" step="0.01" required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '1rem' }} value={medForm.unit_price} onChange={e => setMedForm({ ...medForm, unit_price: e.target.value })} />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={savingMed} style={{ flex: 1, background: '#0f766e', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
                {savingMed ? 'Saving...' : (medForm.id ? 'Update Item' : 'Add Item')}
              </button>
              {medForm.id && (
                <button type="button" onClick={() => setMedForm({ id: null, name: '', unit_price: '' })} style={{ background: '#f1f5f9', color: '#475569', border: '1.5px solid #cbd5e1', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* INVENTORY LIST */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1.5px solid #dbe4f0', boxShadow: '0 10px 28px rgba(15,23,42,0.06)', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#0f172a' }}>Master Inventory Catalog</h2>
            <input type="text" placeholder="Search medicines..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', width: '250px' }} />
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loadingMeds ? <p>Loading catalog...</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#64748b', position: 'sticky', top: 0, background: '#fff' }}>Medicine Name</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#64748b', position: 'sticky', top: 0, background: '#fff' }}>Unit Price (Rs)</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#64748b', position: 'sticky', top: 0, background: '#fff', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{m.name}</td>
                      <td style={{ padding: '12px', color: '#0f766e', fontWeight: 800 }}>{Number(m.unit_price).toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button onClick={() => setMedForm({ id: m.id, name: m.name, unit_price: m.unit_price })} style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginRight: '8px' }}>Edit</button>
                        <button onClick={() => handleDeleteMedicine(m.id, m.name)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}