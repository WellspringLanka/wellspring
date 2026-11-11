import { Link } from 'react-router-dom';
import {
  useDoctorPortalLogic,
  calculateAge,
  formatClearDate
} from './doctorLogic';
import './DoctorPortal.css';

export default function DoctorPortal() {
  const {
    doctors,
    activeDoctor,
    setActiveDoctor,
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

  return (
    <div className="doctor-portal-wrapper">
      {/* ================= TOP HEADER BAR ================= */}
      <header className="doc-topbar">
        <div className="doc-topbar-left">
          <Link to="/" className="doc-back-btn">
            ← Home
          </Link>

          <div className="doc-identity-box">
            <div className="doc-avatar-badge">Dr</div>
            <div className="doc-selector-wrap">
              <span className="doc-greeting-label">Active Consultation Terminal</span>
              <select
                className="doc-select-dropdown"
                value={activeDoctor.id}
                onChange={(e) => {
                  const found = doctors.find(d => d.id === Number(e.target.value));
                  if (found) setActiveDoctor(found);
                }}
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* TOP RIGHT: COUNTER BELL ICON BUTTON */}
        <div className="doc-topbar-right">
          <button
            type="button"
            onClick={handleRingCounterBell}
            className={`bell-trigger-btn ${bellRinging ? 'ringing' : ''}`}
            title="Click to ring the alert bell on the Counter screen"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>{bellRinging ? 'Ringing Counter...' : 'Ring Counter Bell'}</span>
          </button>
        </div>
      </header>

      {/* FLOATING STATUS BANNER */}
      {statusBanner && (
        <div className={`doc-toast-banner ${statusBanner.type}`}>
          {statusBanner.message}
        </div>
      )}

      {/* ================= MAIN 3-COLUMN WORKSPACE ================= */}
      <div className="doc-workspace-grid">
        
        {/* 1. LEFT SIDEBAR: ACTIVE QUEUE, DIRECT PATIENT SEARCH & WALK-IN ADD */}
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
              + New Walk-In
            </button>
          </div>

          <div className="sidebar-body">
            {/* TAB A: ACTIVE QUEUE */}
            {sidebarTab === 'queue' && (
              <div>
                <div className="queue-header-row">
                  <span className="queue-count-pill">
                    {queueList.length} Waiting
                  </span>
                  <button type="button" onClick={fetchQueue} className="refresh-mini-btn">
                    {loadingQueue ? 'Refreshing...' : '↻ Refresh'}
                  </button>
                </div>

                {queueList.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px 10px', fontSize: '1rem' }}>
                    No patients waiting in the active queue right now. Use <strong>Find Patient</strong> or <strong>+ New Walk-In</strong> for direct consultations.
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
                      <div>
                        <div className="patient-item-name">{item.patient.name}</div>
                        <div className="patient-item-sub">
                          Age: {calculateAge(item.patient.birth_date)} • {item.patient.phone || 'No Phone'}
                        </div>
                      </div>
                      <span className="ticket-num-badge">#{item.ticket_number}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* TAB B: DIRECT PATIENT SEARCH (26,000+ LEGACY RECORDS) */}
            {sidebarTab === 'search' && (
              <div>
                <input
                  type="text"
                  className="sidebar-search-input"
                  placeholder="Search Name, Phone, NIC, Ref, or Notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searching && (
                  <p style={{ color: '#7dd3fc', marginBottom: '10px' }}>Searching database...</p>
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
                    <div>
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
                    Load More Results
                  </button>
                )}
              </div>
            )}

            {/* TAB C: DIRECT WALK-IN PATIENT REGISTRATION */}
            {sidebarTab === 'add' && (
              <form onSubmit={handleCreateWalkInPatient}>
                <label className="walkin-label">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  className="walkin-input"
                  placeholder="e.g., Sunil Perera"
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
                  placeholder="NIC Number"
                  value={newPatientForm.id_number}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, id_number: e.target.value })}
                />

                <label className="walkin-label">Common Details / Initial Notes</label>
                <input
                  type="text"
                  className="walkin-input"
                  placeholder="Known conditions, family history..."
                  value={newPatientForm.common}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, common: e.target.value })}
                />

                <button type="submit" disabled={creatingPatient} className="walkin-submit-btn">
                  {creatingPatient ? 'Saving Patient...' : 'Save & Open Patient'}
                </button>
              </form>
            )}
          </div>
        </aside>

        {/* 2. MIDDLE SECTION: STACKED ONE-BY-ONE PATIENT PROFILE */}
        <main className="doc-middle-card">
          {!selectedPatient ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#7dd3fc', marginBottom: '12px' }}>
                No Patient Selected
              </h2>
              <p style={{ fontSize: '1.15rem', color: '#94a3b8' }}>
                Click a patient from the <strong>Active Queue</strong> on the left, or use <strong>Find Patient</strong> to open a walk-in patient directly.
              </p>
            </div>
          ) : loadingProfile ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: '1.3rem', color: '#38bdf8' }}>
              Loading {selectedPatient.name}&apos;s clinical profile...
            </div>
          ) : (
            <div>
              {/* ITEM 1: PATIENT NAME */}
              <div className="stacked-field-block">
                <span className="stacked-field-label">
                  Patient Name {activeTicketId ? `• Queue Ticket #${activeTicketId}` : '• Direct Walk-In Consult'}
                </span>
                <div className="stacked-field-value-xl">
                  {selectedPatient.name}
                </div>
                <div style={{ color: '#93c5fd', fontSize: '1rem', marginTop: '4px' }}>
                  Patient ID: #{selectedPatient.id} {selectedPatient.phone ? `• Tel: ${selectedPatient.phone}` : ''}
                </div>
              </div>

              {/* ITEM 2: CALCULATED AGE */}
              <div className="stacked-field-block">
                <span className="stacked-field-label">Patient Age (Auto-Calculated)</span>
                <div className="stacked-field-value-lg">
                  {calculateAge(selectedPatient.birth_date)}
                </div>
              </div>

              {/* ITEM 3: BIRTHDAY */}
              <div className="stacked-field-block">
                <span className="stacked-field-label">Date of Birth</span>
                <div className="stacked-field-value-lg">
                  {formatClearDate(selectedPatient.birth_date)}
                </div>
              </div>

              {/* ITEM 4: COMMON DETAILS ABOUT PATIENT (patients_master.common) */}
              <div className="stacked-field-block">
                <div className="editable-header-row">
                  <span className="stacked-field-label" style={{ marginBottom: 0 }}>
                    Common Details About Patient
                  </span>

                  {!isEditingCommon ? (
                    <button
                      type="button"
                      className="edit-toggle-btn"
                      onClick={() => setIsEditingCommon(true)}
                    >
                      ✎ Edit
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={savingCommon}
                      className="edit-toggle-btn done-mode"
                      onClick={handleSaveCommonDetails}
                    >
                      {savingCommon ? 'Saving...' : '✓ Done'}
                    </button>
                  )}
                </div>

                {!isEditingCommon ? (
                  <div className="clinical-display-box">
                    {commonText ? commonText : <span style={{ color: '#64748b' }}>No common details recorded yet. Click Edit to add.</span>}
                  </div>
                ) : (
                  <textarea
                    className="clinical-edit-textarea"
                    value={commonText}
                    onChange={(e) => setCommonText(e.target.value)}
                    placeholder="Enter long-term conditions, chronic notes, or general patient details..."
                    autoFocus
                  />
                )}
              </div>

              {/* ITEM 5: ALLERGIES AND REPORTS (channeling_findings_master.findings_comment) */}
              <div className="stacked-field-block" style={{ marginBottom: 0 }}>
                <div className="editable-header-row">
                  <span className="stacked-field-label" style={{ marginBottom: 0, color: '#fda4af' }}>
                    Allergies &amp; Lab Reports (Findings)
                  </span>

                  {!isEditingAllergies ? (
                    <button
                      type="button"
                      className="edit-toggle-btn"
                      onClick={() => setIsEditingAllergies(true)}
                    >
                      ✎ Edit
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={savingAllergies}
                      className="edit-toggle-btn done-mode"
                      onClick={handleSaveAllergiesReports}
                    >
                      {savingAllergies ? 'Saving...' : '✓ Done'}
                    </button>
                  )}
                </div>

                {!isEditingAllergies ? (
                  <div className="clinical-display-box">
                    {allergiesText ? allergiesText : <span style={{ color: '#64748b' }}>No allergies or lab report findings recorded. Click Edit to add.</span>}
                  </div>
                ) : (
                  <textarea
                    className="clinical-edit-textarea"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    placeholder="Enter drug allergies, blood pressure, FBS/FBC lab values, and clinical findings..."
                    autoFocus
                  />
                )}
              </div>
            </div>
          )}
        </main>

        {/* 3. RIGHT SECTION: HIGHLIGHTED "TO COUNTER" PRESCRIPTION PANEL */}
        <aside className="doc-counter-handoff-card">
          <div className="to-counter-header">
            <h2 className="to-counter-title">
              <span>💊</span>
              <span>To Counter</span>
            </h2>
            <span className="live-handoff-tag">Instant Handoff</span>
          </div>

          <form onSubmit={handleSubmitPrescription}>
            <label className="stacked-field-label" style={{ color: '#bae6fd', marginBottom: '8px' }}>
              Prescription Shorthand (Saves to channeling_master.general)
            </label>
            <textarea
              className="rx-shorthand-textarea"
              placeholder="Type prescription for Counter (e.g., dom, cinn, ome, beta his)..."
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              disabled={!selectedPatient}
            />

            <label className="stacked-field-label" style={{ color: '#bae6fd', marginBottom: '8px' }}>
              Special Remarks / Visit Note (Optional)
            </label>
            <input
              type="text"
              className="rx-remarks-input"
              placeholder="Optional note or instruction for Counter..."
              value={remarksText}
              onChange={(e) => setRemarksText(e.target.value)}
              disabled={!selectedPatient}
            />

            <button
              type="submit"
              disabled={!selectedPatient || submittingRx}
              className="submit-counter-btn"
            >
              {submittingRx ? 'SENDING TO COUNTER...' : 'SUBMIT TO COUNTER →'}
            </button>
          </form>
        </aside>
      </div>

      {/* ================= 4. BOTTOM SECTION: PAST PRESCRIPTION HISTORY LOG ================= */}
      <section className="doc-history-section">
        <div className="doc-history-card">
          <div className="history-title-bar">
            <h2>
              Past Prescription Log {selectedPatient ? `— ${selectedPatient.name}` : ''}
            </h2>
            <span style={{ color: '#bae6fd', fontSize: '1.05rem', fontWeight: 600 }}>
              {prescriptionHistory.length} Recorded Visits
            </span>
          </div>

          {!selectedPatient ? (
            <p style={{ color: '#94a3b8', fontSize: '1.15rem' }}>
              Select a patient above to view their complete historical prescription log.
            </p>
          ) : prescriptionHistory.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>
              No previous prescriptions found in <code>channeling_master</code> for this patient.
            </p>
          ) : (
            <div className="history-log-list">
              {prescriptionHistory.map((item) => (
                <div key={item.id} className="history-log-item">
                  {/* Large, High-Contrast Date Box */}
                  <div className="history-date-badge">
                    <span className="history-date-main">
                      {formatClearDate(item.visit_date)}
                    </span>
                    <span className="history-ticket-sub">
                      Ticket #{item.ticket_id}
                    </span>
                  </div>

                  {/* Large Prescription Text */}
                  <div>
                    <div className="history-rx-content">{item.general}</div>
                    {item.reason_remarks && (
                      <div className="history-remarks-sub">
                        Note: {item.reason_remarks}
                      </div>
                    )}
                  </div>

                  {/* 1-Click Repeat Prescription Button */}
                  <button
                    type="button"
                    className="repeat-rx-btn"
                    onClick={() => setPrescriptionText(item.general)}
                    title="Copy this past prescription into today's To Counter box"
                  >
                    ↻ Copy to Today
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