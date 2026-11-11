import { Link } from 'react-router-dom';
import {
  useDoctorPortalLogic,
  calculateAge,
  formatClearDate
} from './doctorLogic';
import './DoctorPortal.css';

export default function DoctorPortal() {
  const {
    loggedInDoctor,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginError,
    loggingIn,
    handleDoctorLogin,
    handleDoctorLogout,
    sidebarTab,
    setSidebarTab,
    queueList,
    loadingQueue,
    fetchQueue,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchPage,
    hasMoreSearch,
    searching,
    handleSearchPatients,
    newPatientForm,
    setNewPatientForm,
    creatingPatient,
    handleCreateWalkInPatient,
    selectedPatient,
    activeTicketId,
    loadingProfile,
    selectPatientForConsultation,
    commonText,
    setCommonText,
    isEditingCommon,
    setIsEditingCommon,
    savingCommon,
    handleSaveCommonDetails,
    allergiesText,
    setAllergiesText,
    isEditingAllergies,
    setIsEditingAllergies,
    savingAllergies,
    handleSaveAllergiesReports,
    prescriptionText,
    setPrescriptionText,
    remarksText,
    setRemarksText,
    submittingRx,
    handleSubmitPrescription,
    prescriptionHistory,
    bellRinging,
    handleRingCounterBell,
    statusBanner
  } = useDoctorPortalLogic();

  // ================= 1. DOCTOR LOGIN SCREEN =================
  if (!loggedInDoctor) {
    return (
      <div className="doctor-login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <span className="login-badge">Wellspring Health Care</span>
            <h1>Doctor Consultation Portal</h1>
            <p>Sign in with your medical staff credentials</p>
          </div>

          {loginError && <div className="login-error-msg">{loginError}</div>}

          <form onSubmit={handleDoctorLogin}>
            <div className="login-form-group">
              <label>Username</label>
              <input
                type="text"
                required
                className="login-input"
                placeholder="Enter username (e.g., upul)"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                autoFocus
              />
            </div>

            <div className="login-form-group">
              <label>Password</label>
              <input
                type="password"
                required
                className="login-input"
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loggingIn} className="login-submit-btn">
              {loggingIn ? 'Signing In...' : 'Sign In to Portal'}
            </button>
          </form>

          <Link to="/" className="login-back-link">
            ← Return to Wellspring Main Page
          </Link>
        </div>
      </div>
    );
  }

  // ================= 2. MAIN CONSULTATION INTERFACE =================
  return (
    <div className="doctor-portal-wrapper">
      {/* TOP HEADER BAR */}
      <header className="doc-topbar">
        <div className="doc-topbar-left">
          <Link to="/" className="doc-back-btn">
            ← Main Menu
          </Link>

          <div className="topbar-divider"></div>

          <div className="doc-identity-info">
            <h1 className="doc-name-heading">{loggedInDoctor.name}</h1>
            <span className="doc-specialty-tag">{loggedInDoctor.specialty}</span>
          </div>
        </div>

        {/* TOP RIGHT: COUNTER BELL & SIGN OUT */}
        <div className="doc-topbar-right">
          <button
            type="button"
            onClick={handleRingCounterBell}
            className={`bell-trigger-btn ${bellRinging ? 'ringing' : ''}`}
            title="Ring alert bell at the Counter"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>{bellRinging ? 'Ringing...' : 'Call Counter'}</span>
          </button>

          <button type="button" onClick={handleDoctorLogout} className="doc-logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {/* FLOATING STATUS BANNER */}
      {statusBanner && (
        <div className={`doc-toast-banner ${statusBanner.type}`}>
          {statusBanner.message}
        </div>
      )}

      {/* FULL-SCREEN 3-COLUMN WORKSPACE */}
      <div className="doc-workspace-grid">
        
        {/* LEFT SIDEBAR: ACTIVE QUEUE, SEARCH & WALK-IN */}
        <aside className="doc-sidebar-card">
          <div className="sidebar-mode-tabs">
            <button
              type="button"
              className={`sidebar-tab-btn ${sidebarTab === 'queue' ? 'active' : ''}`}
              onClick={() => setSidebarTab('queue')}
            >
              Queue ({queueList.length})
            </button>
            <button
              type="button"
              className={`sidebar-tab-btn ${sidebarTab === 'search' ? 'active' : ''}`}
              onClick={() => setSidebarTab('search')}
            >
              Find Patient
            </button>
            <button
              type="button"
              className={`sidebar-tab-btn ${sidebarTab === 'add' ? 'active' : ''}`}
              onClick={() => setSidebarTab('add')}
            >
              + New Patient
            </button>
          </div>

          <div className="sidebar-body">
            {/* TAB A: ACTIVE QUEUE */}
            {sidebarTab === 'queue' && (
              <div>
                <div className="queue-header-row">
                  <span className="queue-count-pill">{queueList.length} Waiting</span>
                  <button type="button" onClick={fetchQueue} className="refresh-mini-btn">
                    {loadingQueue ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {queueList.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '32px 12px', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    No patients currently waiting in the queue. Use <strong>Find Patient</strong> or <strong>+ New Patient</strong> for direct walk-in consultations.
                  </p>
                ) : (
                  queueList.map((item) => (
                    <button
                      key={item.ticket_id}
                      type="button"
                      onClick={() => selectPatientForConsultation(item.patient, item.ticket_id)}
                      className={`patient-list-item ${
                        selectedPatient?.id === item.patient.id ? 'selected' : ''
                      }`}
                    >
                      <div className="patient-item-info">
                        <div className="patient-item-name">{item.patient.name}</div>
                        <div className="patient-item-sub">
                          {calculateAge(item.patient.birth_date)} • {item.patient.phone || 'No Phone'}
                        </div>
                      </div>
                      <span className="ticket-num-badge">#{item.ticket_number}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* TAB B: DIRECT PATIENT SEARCH */}
            {sidebarTab === 'search' && (
              <div>
                <input
                  type="text"
                  className="sidebar-search-input"
                  placeholder="Search by Name, Phone, NIC, or Notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searching && (
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '10px' }}>
                    Searching records...
                  </p>
                )}

                {searchResults.map((pat) => (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => selectPatientForConsultation(pat, null)}
                    className={`patient-list-item ${
                      selectedPatient?.id === pat.id ? 'selected' : ''
                    }`}
                  >
                    <div className="patient-item-info">
                      <div className="patient-item-name">{pat.name}</div>
                      <div className="patient-item-sub">
                        DOB: {formatClearDate(pat.birth_date)} ({calculateAge(pat.birth_date)})
                      </div>
                      <div className="patient-item-sub">
                        Tel: {pat.phone || 'N/A'} • ID: {pat.id_number || pat.id}
                      </div>
                    </div>
                  </button>
                ))}

                {hasMoreSearch && (
                  <button
                    type="button"
                    onClick={() => handleSearchPatients(searchPage + 1)}
                    className="walkin-submit-btn"
                    style={{ marginTop: '8px' }}
                  >
                    Load More
                  </button>
                )}
              </div>
            )}

            {/* TAB C: DIRECT WALK-IN PATIENT REGISTRATION */}
            {sidebarTab === 'add' && (
              <form onSubmit={handleCreateWalkInPatient}>
                <label className="walkin-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="walkin-input"
                  placeholder="Patient full name"
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                />

                <label className="walkin-label">Date of Birth</label>
                <input
                  type="date"
                  className="walkin-input"
                  value={newPatientForm.birth_date}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, birth_date: e.target.value })}
                />

                <label className="walkin-label">Phone Number</label>
                <input
                  type="text"
                  className="walkin-input"
                  placeholder="07X XXX XXXX"
                  value={newPatientForm.phone}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                />

                <label className="walkin-label">NIC / ID Number</label>
                <input
                  type="text"
                  className="walkin-input"
                  placeholder="NIC number"
                  value={newPatientForm.id_number}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, id_number: e.target.value })}
                />

                <label className="walkin-label">Common Details / Medical Notes</label>
                <input
                  type="text"
                  className="walkin-input"
                  placeholder="Initial medical notes..."
                  value={newPatientForm.common}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, common: e.target.value })}
                />

                <button type="submit" disabled={creatingPatient} className="walkin-submit-btn">
                  {creatingPatient ? 'Saving...' : 'Save & Open Patient'}
                </button>
              </form>
            )}
          </div>
        </aside>

        {/* MIDDLE SECTION: STACKED PATIENT DETAILS */}
        <main className="doc-middle-card">
          {!selectedPatient ? (
            <div className="empty-patient-state">
              <h2>No Patient Selected</h2>
              <p>
                Select a patient from the active queue on the left, or use Find Patient to look up an existing record.
              </p>
            </div>
          ) : loadingProfile ? (
            <div className="empty-patient-state">
              <p>Loading patient record...</p>
            </div>
          ) : (
            <div className="stacked-details-list">
              {/* 1. PATIENT NAME */}
              <div className="stacked-field-block">
                <span className="stacked-field-label">
                  Patient Name {activeTicketId ? `• Ticket #${activeTicketId}` : '• Direct Walk-In'}
                </span>
                <div className="stacked-field-value-primary">
                  {selectedPatient.name}
                </div>
                <div className="stacked-field-meta">
                  Patient ID: #{selectedPatient.id} {selectedPatient.phone ? `• Phone: ${selectedPatient.phone}` : ''}
                </div>
              </div>

              {/* 2. AGE */}
              <div className="stacked-field-block">
                <span className="stacked-field-label">Age</span>
                <div className="stacked-field-value">
                  {calculateAge(selectedPatient.birth_date)}
                </div>
              </div>

              {/* 3. BIRTHDAY */}
              <div className="stacked-field-block">
                <span className="stacked-field-label">Date of Birth</span>
                <div className="stacked-field-value">
                  {formatClearDate(selectedPatient.birth_date)}
                </div>
              </div>

              {/* 4. COMMON DETAILS ABOUT PATIENT */}
              <div className="stacked-field-block">
                <div className="editable-header-row">
                  <span className="stacked-field-label">Common Details About Patient</span>

                  {!isEditingCommon ? (
                    <button
                      type="button"
                      className="edit-toggle-btn"
                      onClick={() => setIsEditingCommon(true)}
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={savingCommon}
                      className="edit-toggle-btn done-mode"
                      onClick={handleSaveCommonDetails}
                    >
                      {savingCommon ? 'Saving...' : 'Done'}
                    </button>
                  )}
                </div>

                {!isEditingCommon ? (
                  <div className="clinical-display-box">
                    {commonText ? (
                      commonText
                    ) : (
                      <span className="clinical-placeholder">No common details recorded.</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    className="clinical-edit-textarea"
                    value={commonText}
                    onChange={(e) => setCommonText(e.target.value)}
                    placeholder="Enter general patient details or chronic conditions..."
                    autoFocus
                  />
                )}
              </div>

              {/* 5. ALLERGIES AND REPORTS */}
              <div className="stacked-field-block">
                <div className="editable-header-row">
                  <span className="stacked-field-label">Allergies and Reports</span>

                  {!isEditingAllergies ? (
                    <button
                      type="button"
                      className="edit-toggle-btn"
                      onClick={() => setIsEditingAllergies(true)}
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={savingAllergies}
                      className="edit-toggle-btn done-mode"
                      onClick={handleSaveAllergiesReports}
                    >
                      {savingAllergies ? 'Saving...' : 'Done'}
                    </button>
                  )}
                </div>

                {!isEditingAllergies ? (
                  <div className="clinical-display-box">
                    {allergiesText ? (
                      allergiesText
                    ) : (
                      <span className="clinical-placeholder">No allergies or report findings recorded.</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    className="clinical-edit-textarea"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    placeholder="Enter drug allergies, investigation results, and clinical findings..."
                    autoFocus
                  />
                )}
              </div>
            </div>
          )}
        </main>

        {/* RIGHT SECTION: "TO COUNTER" PRESCRIPTION PANEL */}
        <aside className="doc-counter-handoff-card">
          <div className="to-counter-header">
            <h2 className="to-counter-title">To Counter</h2>
            <span className="live-handoff-tag">Dispensary Handoff</span>
          </div>

          <form onSubmit={handleSubmitPrescription}>
            <div className="counter-form-group">
              <label className="counter-form-label">Prescription</label>
              <textarea
                className="rx-shorthand-textarea"
                placeholder="Enter prescription for the Counter (e.g., dom, cinn, ome)..."
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                disabled={!selectedPatient}
              />
            </div>

            <div className="counter-form-group">
              <label className="counter-form-label">Special Remarks (Optional)</label>
              <input
                type="text"
                className="rx-remarks-input"
                placeholder="Additional instructions for Counter..."
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                disabled={!selectedPatient}
              />
            </div>

            <button
              type="submit"
              disabled={!selectedPatient || submittingRx}
              className="submit-counter-btn"
            >
              {submittingRx ? 'Sending...' : 'Submit to Counter'}
            </button>
          </form>
        </aside>
      </div>

      {/* BOTTOM SECTION: PAST PRESCRIPTION LOG */}
      <section className="doc-history-section">
        <div className="doc-history-card">
          <div className="history-title-bar">
            <h2>
              Prescription History {selectedPatient ? `— ${selectedPatient.name}` : ''}
            </h2>
            <span className="history-count-label">
              {prescriptionHistory.length} Records
            </span>
          </div>

          {!selectedPatient ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Select a patient to view past prescriptions.
            </p>
          ) : prescriptionHistory.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              No previous prescription records found for this patient.
            </p>
          ) : (
            <div className="history-log-list">
              {prescriptionHistory.map((item) => (
                <div key={item.id} className="history-log-item">
                  <div className="history-date-badge">
                    <span className="history-date-main">
                      {formatClearDate(item.visit_date)}
                    </span>
                    <span className="history-ticket-sub">
                      Ticket #{item.ticket_id}
                    </span>
                  </div>

                  <div className="history-rx-body">
                    <div className="history-rx-content">{item.general}</div>
                    {item.reason_remarks && (
                      <div className="history-remarks-sub">
                        Remarks: {item.reason_remarks}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="repeat-rx-btn"
                    onClick={() => setPrescriptionText(item.general)}
                  >
                    Copy to Prescription
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}