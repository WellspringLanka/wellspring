import { Link } from 'react-router-dom';
import {
  useDoctorPortalLogic,
  DOCTOR_THEMES,
  calculateAge,
  formatClearDate
} from './doctorLogic';
import './DoctorPortal.css';

export default function DoctorPortal() {
  const {
    activeTheme,
    setActiveTheme,
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
            <div className="login-brand-script">Wellspring</div>
            <span className="login-badge">Doctor Console</span>
            <h1>Physician Sign In</h1>
            <p>Enter your clinical credentials to access patient consultations</p>
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
              {loggingIn ? 'Signing In...' : 'Sign In to Console'}
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
    <div className={`doctor-portal-wrapper theme-${activeTheme}`}>
      {/* TOP COLORED HEADER BAR */}
      <header className="doc-topbar">
        <div className="doc-topbar-left">
          <Link to="/" className="doc-back-btn">
            ← Home
          </Link>

          <div className="topbar-divider"></div>

          <div className="doc-identity-info">
            <h1 className="doc-name-heading">{loggedInDoctor.name}</h1>
            <span className="doc-specialty-tag">{loggedInDoctor.specialty}</span>
          </div>
        </div>

        {/* TOP RIGHT: 4-COLOR THEME PICKER, AESTHETIC BELL & RED SIGN OUT */}
        <div className="doc-topbar-right">
          <div className="theme-picker-group" title="Choose Portal Color Theme">
            <span className="theme-picker-label">Theme</span>
            {DOCTOR_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-swatch-btn ${activeTheme === t.id ? 'active' : ''}`}
                style={{ backgroundColor: t.swatch }}
                onClick={() => setActiveTheme(t.id)}
                title={t.name}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleRingCounterBell}
            className={`bell-trigger-btn ${bellRinging ? 'ringing' : ''}`}
            title="Ring the alert bell at the Counter"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>{bellRinging ? 'Ringing Counter...' : 'Ring Counter'}</span>
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

      {/* 3-SECTION WORKSPACE WITH EDGE SPACING */}
      <div className="doc-workspace-grid">
        
        {/* 1. LEFT SIDEBAR: BRAND BANNER + 3 SEPARATE BUTTONS + LIST */}
        <aside className="doc-sidebar-card">
          {/* Rectangular Top Area with Photo Overlay, DOCTOR CONSOLE pill, and Tangerine Wellspring */}
          <div className="sidebar-brand-banner">
            <div className="sidebar-banner-photo"></div>
            <div className="sidebar-banner-tint"></div>
            <div className="sidebar-banner-content">
              <span className="doctor-console-pill">Doctor Console</span>
              <div className="sidebar-wellspring-script">Wellspring</div>
            </div>
          </div>

          {/* 3 Visually Separate Rounded Buttons */}
          <div className="sidebar-separate-tabs">
            <button
              type="button"
              className={`sidebar-pill-btn ${sidebarTab === 'queue' ? 'active' : ''}`}
              onClick={() => setSidebarTab('queue')}
            >
              Queue ({queueList.length})
            </button>
            <button
              type="button"
              className={`sidebar-pill-btn ${sidebarTab === 'search' ? 'active' : ''}`}
              onClick={() => setSidebarTab('search')}
            >
              Find Patient
            </button>
            <button
              type="button"
              className={`sidebar-pill-btn ${sidebarTab === 'add' ? 'active' : ''}`}
              onClick={() => setSidebarTab('add')}
            >
              + New Patient
            </button>
          </div>

          <div className="sidebar-body">
            {/* TAB A: ACTIVE QUEUE (Ordered by First Arrival) */}
            {sidebarTab === 'queue' && (
              <div>
                <div className="queue-header-row">
                  <span className="queue-count-pill">{queueList.length} in Queue</span>
                  <button type="button" onClick={fetchQueue} className="refresh-mini-btn">
                    {loadingQueue ? 'Loading...' : '↻ Refresh'}
                  </button>
                </div>

                {queueList.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '36px 14px', fontSize: '0.92rem', lineHeight: '1.6', fontWeight: 500 }}>
                    No patients waiting in the active queue. Use <strong>Find Patient</strong> or <strong>+ New Patient</strong> for direct walk-in consultations.
                  </p>
                ) : (
                  queueList.map((item, index) => (
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
                      <span className="queue-order-badge" title="Arrival Queue Order">
                        Queue #{index + 1}
                      </span>
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
                  placeholder="Search Name, Phone, NIC, or Notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searching && (
                  <p style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px' }}>
                    Searching patient database...
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
                        Tel: {pat.phone || 'N/A'} {pat.id_number ? `• NIC: ${pat.id_number}` : ''}
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
                    Load More Results
                  </button>
                )}
              </div>
            )}

            {/* TAB C: DIRECT WALK-IN PATIENT REGISTRATION */}
            {sidebarTab === 'add' && (
              <form onSubmit={handleCreateWalkInPatient}>
                <div className="walkin-form-grid">
                  <div className="walkin-form-group full-width">
                    <label className="walkin-label">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      className="walkin-input"
                      style={{ marginBottom: 0 }}
                      placeholder="Enter full name"
                      value={newPatientForm.name}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    />
                  </div>

                  <div className="walkin-form-group">
                    <label className="walkin-label">Gender *</label>
                    <div className="walkin-radio-wrap">
                      <label className="walkin-radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="1"
                          checked={newPatientForm.gender === '1'}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                        /> Male
                      </label>
                      <label className="walkin-radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="2"
                          checked={newPatientForm.gender === '2'}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                        /> Female
                      </label>
                    </div>
                  </div>

                  <div className="walkin-form-group">
                    <label className="walkin-label">Date of Birth</label>
                    <input
                      type="date"
                      className="walkin-input"
                      style={{ marginBottom: 0 }}
                      value={newPatientForm.birth_date}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, birth_date: e.target.value })}
                    />
                  </div>

                  <div className="walkin-form-group">
                    <label className="walkin-label">Phone Number</label>
                    <input
                      type="text"
                      className="walkin-input"
                      style={{ marginBottom: 0 }}
                      placeholder="07X XXX XXXX"
                      value={newPatientForm.phone}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="walkin-form-group">
                    <label className="walkin-label">NIC / ID Number</label>
                    <input
                      type="text"
                      className="walkin-input"
                      style={{ marginBottom: 0 }}
                      placeholder="NIC number"
                      value={newPatientForm.id_number}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, id_number: e.target.value })}
                    />
                  </div>

                  <div className="walkin-form-group">
                    <label className="walkin-label">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="walkin-input"
                      style={{ marginBottom: 0 }}
                      placeholder="e.g., 65.5"
                      value={newPatientForm.weight}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, weight: e.target.value })}
                    />
                  </div>

                  <div className="walkin-form-group">
                    <label className="walkin-label">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="walkin-input"
                      style={{ marginBottom: 0 }}
                      placeholder="e.g., 170"
                      value={newPatientForm.height}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, height: e.target.value })}
                    />
                  </div>

                  <div className="walkin-form-group full-width">
                    <label className="walkin-label">Married?</label>
                    <div className="walkin-radio-wrap" style={{ gap: '24px' }}>
                      <label className="walkin-radio-label">
                        <input
                          type="radio"
                          name="married"
                          value="0"
                          checked={newPatientForm.married === '0'}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, married: e.target.value })}
                        /> No / Single
                      </label>
                      <label className="walkin-radio-label">
                        <input
                          type="radio"
                          name="married"
                          value="1"
                          checked={newPatientForm.married === '1'}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, married: e.target.value })}
                        /> Yes / Married
                      </label>
                    </div>
                  </div>

                  <div className="walkin-form-group full-width">
                    <label className="walkin-label">Common Details / Medical Notes</label>
                    <input
                      type="text"
                      className="walkin-input"
                      style={{ marginBottom: 0 }}
                      placeholder="Initial medical notes..."
                      value={newPatientForm.common}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, common: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" disabled={creatingPatient} className="walkin-submit-btn">
                  {creatingPatient ? 'Saving...' : 'Save & Open Patient'}
                </button>
              </form>
            )}
          </div>
        </aside>

        {/* 2. MIDDLE SECTION: PATIENT CLINICAL PROFILE */}
        <main className="doc-middle-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Patient Clinical Profile</h2>
            <span className="section-card-tag">Medical Record</span>
          </div>

          {!selectedPatient ? (
            <div className="empty-patient-state">
              <h2>No Patient Selected</h2>
              <p>
                Choose a patient from the <strong>Queue</strong> on the left, or use <strong>Find Patient</strong> to view any patient record.
              </p>
            </div>
          ) : loadingProfile ? (
            <div className="empty-patient-state">
              <p>Loading patient clinical profile...</p>
            </div>
          ) : (
            <div className="stacked-details-list">
              {/* 1. PATIENT NAME (Removed confusing raw #ticket number) */}
              <div className="stacked-field-block">
                <span className="stacked-field-label">Patient Name</span>
                <div className="stacked-field-value-primary">
                  {selectedPatient.name}
                </div>
                <div className="stacked-field-meta">
                  {selectedPatient.phone ? `Phone: ${selectedPatient.phone}` : 'No Phone Recorded'}
                  {selectedPatient.id_number ? ` • NIC: ${selectedPatient.id_number}` : ''}
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

              {/* 4. COMMON DETAILS ABOUT PATIENT (patients_master.common) */}
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
                      <span className="clinical-placeholder">No common details recorded. Click Edit to add.</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    className="clinical-edit-textarea"
                    value={commonText}
                    onChange={(e) => setCommonText(e.target.value)}
                    placeholder="Enter general patient details or long-term history..."
                    autoFocus
                  />
                )}
              </div>

              {/* 5. ALLERGIES AND REPORTS (channeling_findings_master.findings_comment) */}
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
                      <span className="clinical-placeholder">No allergies or lab report findings recorded. Click Edit to add.</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    className="clinical-edit-textarea"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    placeholder="Enter drug allergies, lab investigation results, and clinical findings..."
                    autoFocus
                  />
                )}
              </div>
            </div>
          )}
        </main>

        {/* 3. WIDER RIGHT SECTION: "TO COUNTER" PRESCRIPTION & DOCTOR VISIT REMARKS */}
        <aside className="doc-counter-handoff-card">
          <div className="to-counter-header">
            <h2 className="to-counter-title">To Counter</h2>
            <span className="live-handoff-tag">Dispensary Dispatch</span>
          </div>

          <form onSubmit={handleSubmitPrescription}>
            <div className="counter-form-group">
              <label className="counter-form-label">
                Prescription Medicines *
              </label>
              <textarea
                className="rx-shorthand-textarea"
                placeholder="Type prescription for Counter (e.g., dom, cinn, ome, beta his)..."
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                disabled={!selectedPatient}
              />
            </div>

            <div className="counter-form-group">
              <label className="counter-form-label">
                Doctor&apos;s Visit Remarks (Optional)
              </label>
              <span className="counter-db-sub">
                Saved to patient consultation history (channeling_master.reason_remarks)
              </span>
              <textarea
                className="rx-remarks-textarea"
                placeholder="Optional clinical remarks or diagnosis notes for this visit..."
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
              {submittingRx ? 'SENDING TO COUNTER...' : 'SUBMIT TO COUNTER'}
            </button>
          </form>
        </aside>
      </div>

      {/* 4. BOTTOM SECTION: 4-COLUMN PRESCRIPTION & REMARKS LOG */}
      <section className="doc-history-section">
        <div className="doc-history-card">
          <div className="history-title-bar">
            <h2>
              Consultation &amp; Prescription Log {selectedPatient ? `— ${selectedPatient.name}` : ''}
            </h2>
            <span className="history-count-label">
              {prescriptionHistory.length} Past Visits
            </span>
          </div>

          {!selectedPatient ? (
            <p style={{ color: '#64748b', fontSize: '0.98rem', fontWeight: 500 }}>
              Select a patient above to view their historical prescriptions and visit remarks.
            </p>
          ) : prescriptionHistory.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.98rem', fontWeight: 500 }}>
              No previous consultation records found for this patient.
            </p>
          ) : (
            <div>
              {/* 4-Column Header */}
              <div className="history-grid-header">
                <div>Visit Date</div>
                <div>Prescription (channeling_master.general)</div>
                <div>Doctor&apos;s Remarks (reason_remarks)</div>
                <div style={{ textAlign: 'center' }}>Quick Action</div>
              </div>

              <div className="history-log-list">
                {prescriptionHistory.map((item) => (
                  <div key={item.id} className="history-log-item">
                    {/* COLUMN 1: DATE */}
                    <div className="history-date-col">
                      <span className="history-date-main">
                        {formatClearDate(item.visit_date)}
                      </span>
                      <span className="history-date-sub">
                        Recorded Visit
                      </span>
                    </div>

                    {/* COLUMN 2: PRESCRIPTION */}
                    <div className="history-rx-col">
                      {item.general}
                    </div>

                    {/* COLUMN 3: REMARKS */}
                    <div className="history-remarks-col">
                      {item.reason_remarks ? (
                        item.reason_remarks
                      ) : (
                        <span className="history-remarks-empty">No remarks recorded</span>
                      )}
                    </div>

                    {/* COLUMN 4: COPY BUTTON */}
                    <div>
                      <button
                        type="button"
                        className="repeat-rx-btn"
                        onClick={() => {
                          setPrescriptionText(item.general);
                          if (item.reason_remarks) setRemarksText(item.reason_remarks);
                        }}
                      >
                        Copy to Today
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}