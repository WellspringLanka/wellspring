import { Link } from 'react-router-dom';
import { useAdminPortalLogic } from './adminLogic';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DoctorPortal.css'; 
import './AdminPortal.css';

export default function AdminPortal() {
  const {
    loggedInAdmin, loginUsername, setLoginUsername, loginPassword, setLoginPassword, loginError, loggingIn, handleAdminLogin, handleAdminLogout,
    activeTab, setActiveTab, statusBanner,
    dateFilter, setDateFilter, customStart, setCustomStart, customEnd, setCustomEnd,
    financeSummary, financeChart, topMedicinesChart, weeklyTrafficChart, loadingFinance,
    demographics, loadingDemographics,
    logDate, setLogDate, dailyLogList, loadingLog, handleDownloadCSV,
    systemUsers, loadingUsers, newUserForm, setNewUserForm, registeringUser, handleRegisterUser, handleDeleteUser
  } = useAdminPortalLogic();

  if (!loggedInAdmin) {
    return (
      <div className="doctor-login-wrapper" style={{ background: '#020617' }}>
        <div className="login-card" style={{ background: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}>
          <div className="login-header">
            <div className="login-brand-script" style={{ color: '#2dd4bf' }}>Wellspring</div>
            <span className="login-badge" style={{ background: '#134e4a', color: '#5eead4' }}>Admin Command Center</span>
            <h1 style={{ color: '#f8fafc' }}>System Login</h1>
          </div>
          {loginError && <div className="login-error-msg">{loginError}</div>}
          <form onSubmit={handleAdminLogin}>
            <div className="login-form-group">
              <label style={{ color: '#94a3b8' }}>Admin Username</label>
              <input type="text" required className="login-input" style={{ background: '#020617', color: '#fff', borderColor: '#334155' }} value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} autoFocus />
            </div>
            <div className="login-form-group">
              <label style={{ color: '#94a3b8' }}>Password</label>
              <input type="password" required className="login-input" style={{ background: '#020617', color: '#fff', borderColor: '#334155' }} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loggingIn} className="login-submit-btn" style={{ background: '#0f766e' }}>
              {loggingIn ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>
          <Link to="/" className="login-back-link" style={{ color: '#cbd5e1' }}>← Return to Home</Link>
        </div>
      </div>
    );
  }

  const FinanceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #334155', padding: '12px', borderRadius: '8px', color: '#fff' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#94a3b8' }}>{label}</p>
          <p style={{ margin: '4px 0', color: '#38bdf8', fontWeight: 600 }}>Revenue: Rs. {payload[0].value.toFixed(2)}</p>
          <p style={{ margin: '4px 0', color: '#f87171', fontWeight: 600 }}>Medicine Cost: Rs. {payload[1].value.toFixed(2)}</p>
          <p style={{ margin: '4px 0', color: '#10b981', fontWeight: 800 }}>Net Profit: Rs. {payload[2].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="admin-portal-wrapper">
      <header className="admin-topbar">
        <div className="admin-brand-group">
          <Link to="/" style={{ textDecoration: 'none' }}><span className="admin-logo-text">Wellspring</span></Link>
          <span className="admin-badge">Admin Analytics</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>Logged in as: <span style={{ color: '#fff' }}>{loggedInAdmin.name}</span></div>
          <button type="button" onClick={handleAdminLogout} className="doc-logout-btn" style={{ background: '#1e293b', borderColor: '#334155' }}>Secure Logout</button>
        </div>
      </header>

      {statusBanner && (
        <div className={`doc-toast-banner ${statusBanner.type}`} style={{ top: '80px' }}>{statusBanner.message}</div>
      )}

      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <button className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Financial Dashboard</button>
          <button className={`admin-nav-btn ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>👥 Patient Demographics</button>
          <button className={`admin-nav-btn ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}>📄 Daily Spreadsheet Log</button>
          <button className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>⚙️ System Users</button>
        </aside>

        <main className="admin-content-area">
          {/* TAB 1: FINANCIAL DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <div className="admin-filter-bar">
                <div className="filter-btn-group">
                  <button className={`filter-tab ${dateFilter === '7D' ? 'active' : ''}`} onClick={() => setDateFilter('7D')}>Last 7 Days</button>
                  <button className={`filter-tab ${dateFilter === '30D' ? 'active' : ''}`} onClick={() => setDateFilter('30D')}>Last 30 Days</button>
                  <button className={`filter-tab ${dateFilter === 'YTD' ? 'active' : ''}`} onClick={() => setDateFilter('YTD')}>Year to Date</button>
                  <button className={`filter-tab ${dateFilter === 'ALL' ? 'active' : ''}`} onClick={() => setDateFilter('ALL')}>All Time (2015-Now)</button>
                  <button className={`filter-tab ${dateFilter === 'CUSTOM' ? 'active' : ''}`} onClick={() => setDateFilter('CUSTOM')}>Custom Range</button>
                </div>
                {dateFilter === 'CUSTOM' && (
                  <div className="custom-date-inputs">
                    <input type="date" className="admin-date-input" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                    <span style={{ color: '#64748b' }}>to</span>
                    <input type="date" className="admin-date-input" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="kpi-grid">
                <div className="kpi-card"><div className="kpi-title">Gross Revenue (Cash Collected)</div><div className="kpi-value">Rs. {financeSummary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
                <div className="kpi-card"><div className="kpi-title">Raw Medicine Cost (Expenses)</div><div className="kpi-value" style={{ color: '#f87171' }}>Rs. {financeSummary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
                <div className="kpi-card profit"><div className="kpi-title">Net Clinic Profit</div><div className="kpi-value">Rs. {financeSummary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
                <div className="kpi-card"><div className="kpi-title">Dispensary Patients Served</div><div className="kpi-value" style={{ color: '#a78bfa' }}>{financeSummary.totalPatients.toLocaleString()}</div></div>
              </div>

              <div className="chart-card">
                <div className="chart-header">Revenue vs Profit Trajectory {loadingFinance && <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '10px' }}>Loading...</span>}</div>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={financeChart} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `Rs.${value/1000}k`} />
                    <Tooltip content={<FinanceTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="cost" name="Cost" stroke="#f87171" strokeWidth={2} fill="none" />
                    <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="advanced-charts-grid">
                <div className="secondary-chart-card">
                  <div className="chart-header">Top 7 Most Dispensed Medicines</div>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart layout="vertical" data={topMedicinesChart} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={90} />
                      <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                      <Bar dataKey="total_sold" name="Units Sold" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="secondary-chart-card">
                  <div className="chart-header">Clinic Busyness by Day of Week</div>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={weeklyTrafficChart} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" />
                      <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                      <Bar dataKey="visits" name="Total Patient Visits" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PATIENT ANALYTICS */}
          {activeTab === 'patients' && (
            <div className="demographics-grid">
              <div className="chart-card">
                <div className="chart-header">Patient Age Demographics (Bell Curve) {loadingDemographics && <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Loading...</span>}</div>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={demographics.bellCurveData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="ageGroup" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" />
                    <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey="patients" name="Total Patients" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <div className="chart-header">Gender Distribution</div>
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie data={demographics.genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {demographics.genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', marginTop: '10px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>■ Male</span> &nbsp;&nbsp; 
                  <span style={{ color: '#f472b6', fontWeight: 800 }}>■ Female</span> &nbsp;&nbsp;
                  <span style={{ color: '#64748b', fontWeight: 800 }}>■ Not Specified</span>
                </div>
                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9' }}>
                  Total Master Records: {demographics.totalRegistered.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPREADSHEET LOG */}
          {activeTab === 'log' && (
            <div className="spreadsheet-card">
              <div className="spreadsheet-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#5eead4' }}>Daily Business Log</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>View and export granular billing data as an Excel CSV</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <input type="date" className="admin-date-input" value={logDate} onChange={e => setLogDate(e.target.value)} />
                  <button className="csv-btn" onClick={handleDownloadCSV}>📥 Export CSV (Excel)</button>
                </div>
              </div>
              <div className="spreadsheet-table-wrap">
                {loadingLog ? (
                  <div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center' }}>Loading ledger...</div>
                ) : dailyLogList.length === 0 ? (
                  <div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center' }}>No transactions recorded on {logDate}.</div>
                ) : (
                  <table className="admin-sheet-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Bill #</th>
                        <th>Patient Name(s)</th>
                        <th>Phone</th>
                        <th>Doctor</th>
                        <th>Status</th>
                        <th>Med Cost (Rs)</th>
                        <th>Final Rev (Rs)</th>
                        <th style={{ color: '#10b981' }}>Profit (Rs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyLogList.map(row => {
                        const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(row.created_at));
                        const isOutdoor = row.bill_status === 'OUTDOOR_RX';
                        const revenue = isOutdoor ? 0 : (row.final_total || 0);
                        const cost = row.total_medicine_cost || 0;
                        const profit = revenue - cost;
                        return (
                          <tr key={row.id}>
                            <td style={{ color: '#94a3b8' }}>{time}</td>
                            <td style={{ fontWeight: 800 }}>#{row.daily_bill_no || row.id}</td>
                            <td>{row.patient_names || 'Walk-In'}</td>
                            <td>{row.patient_phone || '-'}</td>
                            <td>{row.doctor_name || '-'}</td>
                            <td>
                              <span className={`status-pill ${isOutdoor ? 'outdoor' : 'paid'}`}>
                                {isOutdoor ? 'Outdoor (No Meds)' : 'Paid Bill'}
                              </span>
                            </td>
                            <td style={{ color: '#f87171' }}>{cost.toFixed(2)}</td>
                            <td style={{ color: '#38bdf8' }}>{revenue.toFixed(2)}</td>
                            <td style={{ color: '#10b981', fontWeight: 800 }}>{profit.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM USERS */}
          {activeTab === 'users' && (
            <div className="users-grid">
              <div className="user-form-card">
                <h3 style={{ margin: '0 0 16px 0', color: '#38bdf8' }}>+ Register New User</h3>
                <form onSubmit={handleRegisterUser}>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Account Type</label>
                  <select className="user-form-select" value={newUserForm.role_type} onChange={e => setNewUserForm({ ...newUserForm, role_type: e.target.value })}>
                    <option value="DOCTOR">Doctor (Consultation Console)</option>
                    <option value="CASHIER">Cashier (Pharmacy & POS)</option>
                  </select>

                  <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Full Name</label>
                  <input type="text" required className="user-form-input" placeholder="e.g. Dr. Upul" value={newUserForm.name} onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })} />

                  <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Username</label>
                  <input type="text" required className="user-form-input" placeholder="e.g. upul123" value={newUserForm.username} onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value.toLowerCase().trim() })} />

                  <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{newUserForm.role_type === 'DOCTOR' ? 'Specialty' : 'Role Title'}</label>
                  <input type="text" className="user-form-input" value={newUserForm.specialty_or_role} onChange={e => setNewUserForm({ ...newUserForm, specialty_or_role: e.target.value })} />

                  <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Secure Password</label>
                  <input type="password" required className="user-form-input" value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} />

                  <button type="submit" disabled={registeringUser} className="csv-btn" style={{ width: '100%', marginTop: '10px' }}>
                    {registeringUser ? 'Registering...' : 'Create Account'}
                  </button>
                </form>
              </div>

              <div className="user-list-card">
                <h3 style={{ margin: '0 0 6px 0', color: '#5eead4' }}>Active Staff Accounts</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Passwords are encrypted in the database (********). If a user forgets their password, remove them and register a new account.
                </p>
                {loadingUsers ? <p style={{ color: '#94a3b8' }}>Loading accounts...</p> : (
                  <div className="user-list-grid">
                    <div>
                      <h4 style={{ color: '#f472b6', borderBottom: '1px solid #1e293b', paddingBottom: '10px', marginBottom: '14px' }}>Doctors</h4>
                      {systemUsers.doctors.map(doc => (
                        <div key={doc.id} className="user-badge-card" style={{ marginBottom: '10px' }}>
                          <div>
                            <h4>{doc.name}</h4>
                            <p>User: <strong>{doc.username}</strong> | Pass: ********</p>
                          </div>
                          <button className="delete-user-btn" onClick={() => handleDeleteUser('DOCTOR', doc.id, doc.name)}>Remove</button>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 style={{ color: '#38bdf8', borderBottom: '1px solid #1e293b', paddingBottom: '10px', marginBottom: '14px' }}>Cashiers</h4>
                      {systemUsers.cashiers.map(cash => (
                        <div key={cash.id} className="user-badge-card" style={{ marginBottom: '10px' }}>
                          <div>
                            <h4>{cash.name}</h4>
                            <p>User: <strong>{cash.username}</strong> | Pass: ********</p>
                          </div>
                          <button className="delete-user-btn" onClick={() => handleDeleteUser('CASHIER', cash.id, cash.name)}>Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}