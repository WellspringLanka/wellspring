import { Link } from 'react-router-dom';
import { useCounterPortalLogic, printReceiptDocument } from './counterLogic';
import './DoctorPortal.css';
import './CounterPortal.css';

export default function CounterPortal() {
  const {
    DOCTOR_THEMES,
    calculateAge,
    formatClearDate,
    currentClock,
    activeTheme,
    setActiveTheme,
    loggedInStaff,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginError,
    loggingIn,
    handleCounterLogin,
    handleCounterLogout,
    activePage,
    setActivePage,
    prescriptionQueue,
    loadingPrescriptions,
    fetchPrescriptions,
    selectedTicketIds,
    handleSelectSinglePrescription,
    handleToggleFamilyMember,
    activePrescriptionCards,
    customWalkInName,
    setCustomWalkInName,
    customWalkInPhone,
    setCustomWalkInPhone,
    servicesCatalog,
    medSearchText,
    setMedSearchText,
    showMedDropdown,
    setShowMedDropdown,
    filteredMedicines,
    handlePickMedicineFromDropdown,
    medUnitPrice,
    setMedUnitPrice,
    medQty,
    setMedQty,
    updatingPriceInDb,
    handleAddMedicineToBill,
    selectedServiceId,
    handleServiceSelectChange,
    serviceCustomName,
    setServiceCustomName,
    serviceFeeAmount,
    setServiceFeeAmount,
    handleAddServiceToBill,
    billItems,
    handleRemoveBillItem,
    handleClearPOSCart,
    calculatedTotal,
    manualFinalTotal,
    isManualTotalEdited,
    setIsManualTotalEdited,
    handleManualTotalChange,
    handleQuickRoundTotal,
    submittingCheckout,
    handleFinalizeCheckout,
    completedBillModal,
    setCompletedBillModal,
    printFormat,
    setPrintFormat,
    showSmsConfirmBox,
    setShowSmsConfirmBox,
    smsPhoneInput,
    setSmsPhoneInput,
    isEditingSmsPhone,
    setIsEditingSmsPhone,
    sendingSms,
    smsSentStatus,
    setSmsSentStatus,
    handleInitiateSmsFlow,
    handleConfirmAndSendSms,
    todayLogList,
    filteredTodayLog,
    loadingTodayLog,
    fetchTodayLog,
    todayLogSearch,
    setTodayLogSearch,
    todaySummary,
    handleReprintFromTodayLog,
    activeWaitingQueue,
    loadingWaitingQueue,
    fetchActiveWaitingQueue,
    queueSearch,
    setQueueSearch,
    queueSearchResults,
    queueSearchPage,
    hasMoreQueueSearch,
    searchingQueuePatients,
    handleQueuePatientSearch,
    addingToQueueId,
    handleAddPatientToQueue,
    handleRemoveFromActiveQueue,
    regForm,
    setRegForm,
    registeringPatient,
    handleCounterRegisterPatient,
    doctorBellAlert,
    setDoctorBellAlert,
    statusBanner,
    playDoctorBellSound
  } = useCounterPortalLogic();

  // ================= 1. COUNTER LOGIN SCREEN =================
  if (!loggedInStaff) {
    return (
      <div className="doctor-login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-brand-script">Wellspring</div>
            <span className="login-badge">Counter &amp; POS Console</span>
            <h1>Dispensary Counter Sign In</h1>
            <p>Sign in with your counter credentials (e.g., counter / 1234)</p>
          </div>

          {loginError && <div className="login-error-msg">{loginError}</div>}

          <form onSubmit={handleCounterLogin}>
            <div className="login-form-group">
              <label>Counter Username</label>
              <input
                type="text"
                required
                className="login-input"
                placeholder="Enter username (counter or desk)"
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
              {loggingIn ? 'Signing In...' : 'Open Counter Console'}
            </button>
          </form>

          <Link to="/" className="login-back-link">
            ← Return to Wellspring Main Page
          </Link>
        </div>
      </div>
    );
  }

  // ================= 2. MAIN COUNTER & PHARMACY INTERFACE =================
  return (
    <div className={`doctor-portal-wrapper theme-${activeTheme}`}>
      {/* TOP HEADER BAR WITH LIVE SRI LANKA CLOCK */}
      <header className="doc-topbar" style={{ padding: '0 28px' }}>
        <div className="doc-topbar-left">
          <Link to="/" className="doc-back-btn">
            ← Home
          </Link>

          <div className="topbar-divider"></div>

          <div className="doc-identity-info">
            <h1 className="doc-name-heading">{loggedInStaff.name}</h1>
            <span className="doc-specialty-tag">{loggedInStaff.role}</span>
          </div>

          {/* LIVE DOCTOR BELL ALERT RECEIVER (Click when standby to test real bell sound!) */}
          <button
            type="button"
            onClick={() => {
              if (doctorBellAlert) {
                setDoctorBellAlert(null);
              } else {
                playDoctorBellSound();
              }
            }}
            className={`counter-bell-indicator ${doctorBellAlert ? 'ringing-alert' : ''}`}
            title="Click to dismiss alert (or click on standby to test reception bell sound)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>
              {doctorBellAlert
                ? '🔔 DOCTOR CALLING COUNTER! (Click to Dismiss)'
                : 'Doctor Bell: Standby'}
            </span>
          </button>
        </div>

        <div className="doc-topbar-right">
          {/* LIVE SRI LANKA SYSTEM CLOCK */}
          <div className="topbar-live-clock" title="Sri Lanka Standard Time">
            🕒 {currentClock}
          </div>

          {/* 4-COLOR THEME PICKER */}
          <div className="theme-picker-group">
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

          <button type="button" onClick={handleCounterLogout} className="doc-logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {/* FLOATING STATUS TOAST */}
      {statusBanner && (
        <div className={`doc-toast-banner ${statusBanner.type}`}>
          {statusBanner.message}
        </div>
      )}

      {/* MAIN FULL-WINDOW WORKSPACE */}
      <div className="counter-workspace-grid">
        {/* ================= 1. LEFT SIDEBAR (4 SUB-PAGES) ================= */}
        <aside className="counter-sidebar-card">
          <div className="sidebar-brand-banner">
            <div className="sidebar-banner-photo"></div>
            <div className="sidebar-banner-tint"></div>
            <div className="sidebar-banner-content">
              <span className="doctor-console-pill">Counter Console</span>
              <div className="sidebar-wellspring-script">Wellspring</div>
            </div>
          </div>

          <nav className="counter-nav-stack">
            <button
              type="button"
              className={`counter-nav-btn ${activePage === 'pharmacy' ? 'active' : ''}`}
              onClick={() => setActivePage('pharmacy')}
            >
              <span>1. Pharmacy &amp; POS</span>
              <span className="nav-badge-pill">{prescriptionQueue.length} Waiting</span>
            </button>

            <button
              type="button"
              className={`counter-nav-btn ${activePage === 'today_log' ? 'active' : ''}`}
              onClick={() => setActivePage('today_log')}
            >
              <span>2. Today&apos;s Log</span>
              <span className="nav-badge-pill">{todayLogList.length} Today</span>
            </button>

            <button
              type="button"
              className={`counter-nav-btn ${activePage === 'queue' ? 'active' : ''}`}
              onClick={() => setActivePage('queue')}
            >
              <span>3. Active Queue</span>
              <span className="nav-badge-pill">{activeWaitingQueue.length} In Queue</span>
            </button>

            <button
              type="button"
              className={`counter-nav-btn ${activePage === 'registration' ? 'active' : ''}`}
              onClick={() => setActivePage('registration')}
            >
              <span>4. Registration</span>
              <span className="nav-badge-pill">+ New</span>
            </button>
          </nav>

          <div className="counter-sidebar-footer">
            <strong>Quick Workflow:</strong> Register new patients in <strong>Registration</strong>, issue queue numbers in <strong>Active Queue</strong>, and dispense bills in <strong>Pharmacy &amp; POS</strong>.
          </div>
        </aside>

        {/* ================= PAGE 1: PHARMACY & POS TERMINAL ================= */}
        {activePage === 'pharmacy' && (
          <>
            <section className="counter-rx-tray-card">
              <div className="section-card-header" style={{ marginBottom: '14px', paddingBottom: '12px' }}>
                <h2 className="section-card-title" style={{ fontSize: '1.15rem' }}>
                  Doctor Prescriptions
                </h2>
                <button type="button" onClick={fetchPrescriptions} className="refresh-mini-btn">
                  {loadingPrescriptions ? '...' : `↻ (${prescriptionQueue.length})`}
                </button>
              </div>

              <div className="rx-tray-scroll">
                {prescriptionQueue.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 12px', fontSize: '0.92rem', lineHeight: '1.6' }}>
                    No waiting prescriptions from the Doctor right now. You can still issue direct Walk-In bills on the right.
                  </p>
                ) : (
                  prescriptionQueue.map((item) => {
                    const isSelected = selectedTicketIds.includes(item.ticket_id);
                    return (
                      <div
                        key={item.ticket_id}
                        className={`rx-Wait-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectSinglePrescription(item.ticket_id)}
                      >
                        <div className="rx-card-top">
                          <div>
                            <div className="rx-patient-title">{item.patient.name}</div>
                            <div className="patient-item-sub">
                              {calculateAge(item.patient.birth_date)} • {item.patient.phone || 'No Phone'}
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`rx-family-toggle-btn ${isSelected ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFamilyMember(item.ticket_id);
                            }}
                            title="Add or remove this person to a combined Family Bill"
                          >
                            {isSelected ? '✓ In Bill' : '+ Family Bill'}
                          </button>
                        </div>

                        <div className="rx-shorthand-preview">
                          {item.prescription}
                        </div>

                        <div className="rx-card-actions">
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                            By {item.doctor_name}
                          </span>

                          <button
                            type="button"
                            className="outdoor-quick-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSinglePrescription(item.ticket_id);
                              handleFinalizeCheckout('OUTDOOR_RX');
                            }}
                          >
                            Outdoor Medicine / Leave →
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <main className="counter-pos-card">
              <div className="pos-active-rx-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span className="stacked-field-label" style={{ color: '#0f766e' }}>
                      Active Billing Patient(s) ({activePrescriptionCards.length || 'Walk-In'})
                    </span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      {activePrescriptionCards.length > 0
                        ? activePrescriptionCards.map((c) => c.patient.name).join(' + ')
                        : 'Direct Walk-In / Over-The-Counter'}
                    </div>
                  </div>

                  {activePrescriptionCards.length === 0 && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="pos-field-input"
                        style={{ width: '190px' }}
                        placeholder="Walk-In Name (Optional)"
                        value={customWalkInName}
                        onChange={(e) => setCustomWalkInName(e.target.value)}
                      />
                      <input
                        type="text"
                        className="pos-field-input"
                        style={{ width: '150px' }}
                        placeholder="Phone (Optional)"
                        value={customWalkInPhone}
                        onChange={(e) => setCustomWalkInPhone(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {activePrescriptionCards.length > 0 && (
                  <div className="pos-rx-cards-grid">
                    {activePrescriptionCards.map((card) => (
                      <div key={card.ticket_id} className="pos-rx-mini-card">
                        <div className="pos-rx-mini-name">
                          Prescription for {card.patient.name}:
                        </div>
                        <div className="pos-rx-mini-text">{card.prescription}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pos-dual-entry-grid">
                <form className="pos-entry-box" onSubmit={handleAddMedicineToBill}>
                  <div className="pos-entry-title">
                    <span>Add Medicine (POS)</span>
                    <span style={{ fontSize: '0.72rem', color: '#0f766e', textTransform: 'none' }}>
                      {updatingPriceInDb ? 'Saving new price to DB...' : 'Price edits auto-update DB'}
                    </span>
                  </div>

                  <div className="med-entry-row">
                    <div className="med-autocomplete-wrap">
                      <label className="pos-input-label">Medicine Name (Search or Type New)</label>
                      <input
                        type="text"
                        className="pos-field-input"
                        placeholder="Search e.g. Panadol, Ome, Dom..."
                        value={medSearchText}
                        onFocus={() => setShowMedDropdown(true)}
                        onBlur={() => setTimeout(() => setShowMedDropdown(false), 180)}
                        onChange={(e) => {
                          setMedSearchText(e.target.value);
                          setShowMedDropdown(true);
                        }}
                      />

                      {showMedDropdown && filteredMedicines.length > 0 && (
                        <div className="med-suggestions-dropdown">
                          {filteredMedicines.map((med) => (
                            <button
                              key={med.id}
                              type="button"
                              className="med-suggestion-item"
                              onMouseDown={() => handlePickMedicineFromDropdown(med)}
                            >
                              <span>{med.name}</span>
                              <span className="med-suggestion-price">
                                Rs. {Number(med.unit_price).toFixed(2)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="pos-input-label">Unit Price (Rs.)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="pos-field-input"
                        placeholder="0.00"
                        value={medUnitPrice}
                        onChange={(e) => setMedUnitPrice(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="pos-input-label">Qty</label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        className="pos-field-input"
                        value={medQty}
                        onChange={(e) => setMedQty(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="pos-add-btn">
                      + Add Med
                    </button>
                  </div>
                </form>

                <form className="pos-entry-box service-box" onSubmit={handleAddServiceToBill}>
                  <div className="pos-entry-title">
                    <span>Consultation &amp; Clinic Charges</span>
                    <span style={{ fontSize: '0.72rem', color: '#15803d', textTransform: 'none' }}>
                      No Quantity Required
                    </span>
                  </div>

                  <div className="service-entry-row">
                    <div>
                      <label className="pos-input-label">Select Service / Cause</label>
                      <select
                        className="pos-field-input"
                        value={selectedServiceId}
                        onChange={(e) => handleServiceSelectChange(e.target.value)}
                      >
                        {servicesCatalog.map((srv) => (
                          <option key={srv.id} value={srv.id}>
                            {srv.service_name}
                          </option>
                        ))}
                        <option value="custom">+ Custom Dispensary Charge...</option>
                      </select>
                    </div>

                    <div>
                      <label className="pos-input-label">Fee (Rs.)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="pos-field-input"
                        placeholder="1500.00"
                        value={serviceFeeAmount}
                        onChange={(e) => setServiceFeeAmount(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="pos-add-btn green">
                      + Add Fee
                    </button>
                  </div>

                  {selectedServiceId === 'custom' && (
                    <input
                      type="text"
                      className="pos-field-input"
                      style={{ marginTop: '8px' }}
                      placeholder="Enter custom charge reason (e.g., Medical Certificate)..."
                      value={serviceCustomName}
                      onChange={(e) => setServiceCustomName(e.target.value)}
                    />
                  )}
                </form>
              </div>

              <div className="pos-table-container">
                <div className="pos-table-header">
                  <div>Description (Internal View Only)</div>
                  <div>Category</div>
                  <div>Qty</div>
                  <div>Unit / Fee</div>
                  <div>Line Total</div>
                  <div></div>
                </div>

                {billItems.length === 0 ? (
                  <div style={{ padding: '44px 20px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                    No medicines or clinic charges added yet. Use the dropdowns above to build the bill.
                  </div>
                ) : (
                  <div style={{ overflowY: 'auto', maxHeight: '290px' }}>
                    {billItems.map((item) => (
                      <div key={item.uid} className="pos-table-row">
                        <div>{item.name}</div>
                        <div>
                          <span className={`pos-item-badge ${item.item_type === 'MEDICINE' ? 'med' : 'srv'}`}>
                            {item.item_type === 'MEDICINE' ? 'Medicine' : 'Clinic Fee'}
                          </span>
                        </div>
                        <div>{item.qty !== null ? item.qty : '—'}</div>
                        <div>Rs. {Number(item.unit_price).toFixed(2)}</div>
                        <div style={{ color: '#0f766e', fontWeight: 800 }}>
                          Rs. {Number(item.line_total).toFixed(2)}
                        </div>
                        <div>
                          <button
                            type="button"
                            className="pos-remove-btn"
                            onClick={() => handleRemoveBillItem(item.uid)}
                            title="Remove item"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pos-checkout-footer">
                <div className="totals-comparison-group">
                  <div className="calc-total-box">
                    <span className="calc-total-label">Calculated Total</span>
                    <span className="calc-total-val">Rs. {calculatedTotal.toFixed(2)}</span>
                    {billItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearPOSCart}
                        style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: '4px' }}
                      >
                        Clear All Items
                      </button>
                    )}
                  </div>

                  <div className="final-override-box">
                    <label className="pos-input-label" style={{ color: '#065f46' }}>
                      Final Total (Editable for Rounding)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="final-total-input"
                      value={manualFinalTotal}
                      onChange={(e) => handleManualTotalChange(e.target.value)}
                    />
                    <div className="quick-round-pills">
                      <button type="button" className="round-pill-btn" onClick={() => handleQuickRoundTotal(10)}>
                        Round 10
                      </button>
                      <button type="button" className="round-pill-btn" onClick={() => handleQuickRoundTotal(50)}>
                        Round 50
                      </button>
                      <button type="button" className="round-pill-btn" onClick={() => handleQuickRoundTotal(100)}>
                        Round 100
                      </button>
                      {isManualTotalEdited && (
                        <button
                          type="button"
                          className="round-pill-btn"
                          style={{ color: '#0f766e' }}
                          onClick={() => setIsManualTotalEdited(false)}
                        >
                          Reset Exact
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="checkout-action-buttons">
                  <button
                    type="button"
                    disabled={submittingCheckout || (selectedTicketIds.length === 0 && !customWalkInName.trim())}
                    className="outdoor-submit-btn"
                    onClick={() => handleFinalizeCheckout('OUTDOOR_RX')}
                  >
                    Outdoor Drugs / Close Queue
                  </button>

                  <button
                    type="button"
                    disabled={submittingCheckout || (selectedTicketIds.length === 0 && !customWalkInName.trim())}
                    className="pos-grand-submit-btn"
                    onClick={() => handleFinalizeCheckout('COMPLETED_BILL')}
                  >
                    {submittingCheckout ? 'PROCESSING...' : 'SUBMIT & ISSUE BILL'}
                  </button>
                </div>
              </div>
            </main>
          </>
        )}

        {/* ================= PAGE 2: FULL-HEIGHT TODAY'S LOG ================= */}
        {activePage === 'today_log' && (
          <main className="today-log-container">
            <div className="today-kpi-grid">
              <div className="today-kpi-card">
                <div className="today-kpi-label">Patients Who Took Medicine Today</div>
                <div className="today-kpi-value" style={{ color: '#0f766e' }}>
                  {todaySummary.paidPatientsCount} Bills Issued
                </div>
              </div>

              <div className="today-kpi-card outdoor">
                <div className="today-kpi-label">Outdoor Prescriptions (No Meds Bought)</div>
                <div className="today-kpi-value" style={{ color: '#b45309' }}>
                  {todaySummary.outdoorCount} Patients
                </div>
              </div>
            </div>

            <div className="today-log-table-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px', flexShrink: 0 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    Today&apos;s Dispensary &amp; Billing Log
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#64748b', fontWeight: 600 }}>
                    Bill numbers start at <strong>#1</strong> every day and reset at midnight. Click <strong>Reprint / SMS</strong> to re-issue any bill.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="pos-field-input"
                    style={{ width: '250px' }}
                    placeholder="Filter by patient name, phone, bill #..."
                    value={todayLogSearch}
                    onChange={(e) => setTodayLogSearch(e.target.value)}
                  />
                  <button type="button" onClick={fetchTodayLog} className="refresh-mini-btn" style={{ height: '40px' }}>
                    {loadingTodayLog ? 'Loading...' : '↻ Refresh Log'}
                  </button>
                </div>
              </div>

              <div className="today-log-header-row" style={{ flexShrink: 0 }}>
                <div>Today Bill #</div>
                <div>Time</div>
                <div>Patient Name(s)</div>
                <div>Phone</div>
                <div>Status</div>
                <div>Bill Amount</div>
                <div style={{ textAlign: 'center' }}>Receipt Action</div>
              </div>

              {filteredTodayLog.length === 0 ? (
                <div style={{ padding: '56px 20px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                  No patient bills or outdoor prescriptions recorded for today yet.
                </div>
              ) : (
                <div className="today-log-scroll-body">
                  {filteredTodayLog.map((row) => {
                    const timeStr = new Intl.DateTimeFormat('en-GB', {
                      timeZone: 'Asia/Colombo',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }).format(new Date(row.created_at));
                    const isOutdoor = row.bill_status === 'OUTDOOR_RX';

                    return (
                      <div key={row.id} className="today-log-item-row">
                        <div style={{ color: '#0f766e', fontWeight: 800 }}>
                          #{row.daily_bill_no || 1}
                        </div>
                        <div style={{ color: '#475569' }}>{timeStr}</div>
                        <div style={{ fontWeight: 800 }}>{row.patient_names}</div>
                        <div style={{ color: '#475569' }}>{row.patient_phone || 'Not Set'}</div>
                        <div>
                          <span className={`log-status-pill ${isOutdoor ? 'outdoor' : 'paid'}`}>
                            {isOutdoor ? 'Outdoor Drugs' : 'Took Medicine'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 800, color: isOutdoor ? '#64748b' : '#065f46' }}>
                          {isOutdoor ? 'Rs. 0.00' : `Rs. ${Number(row.final_total).toFixed(2)}`}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="reprint-action-btn"
                            onClick={() => handleReprintFromTodayLog(row)}
                          >
                            🖨️ Reprint / SMS
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        )}

        {/* ================= PAGE 3: ACTIVE QUEUE (MIDDLE SEARCH + RIGHT LIVE QUEUE) ================= */}
        {activePage === 'queue' && (
          <>
            {/* MIDDLE COLUMN: FIND REGISTERED PATIENT (SAME SMART SEARCH AS DOCTOR PAGE) */}
            <section className="counter-queue-search-card">
              <div className="section-card-header" style={{ marginBottom: '14px', paddingBottom: '12px' }}>
                <h2 className="section-card-title" style={{ fontSize: '1.15rem' }}>
                  Find Patient for Queue
                </h2>
                <button
                  type="button"
                  className="refresh-mini-btn"
                  onClick={() => {
                    setQueueSearch({ name: '', nic: '', phone: '', dob: '' });
                    setQueueSearchResults([]);
                  }}
                >
                  Clear
                </button>
              </div>

              <div className="advanced-search-grid" style={{ flexShrink: 0 }}>
                <div className="walkin-form-group full-width">
                  <label className="walkin-label">Patient Name</label>
                  <input
                    type="text"
                    className="sidebar-search-input"
                    style={{ marginBottom: 0 }}
                    placeholder="e.g., Priyantha"
                    value={queueSearch.name}
                    onChange={(e) => setQueueSearch({ ...queueSearch, name: e.target.value })}
                  />
                </div>

                <div className="walkin-form-group">
                  <label className="walkin-label">NIC Number</label>
                  <input
                    type="text"
                    className="sidebar-search-input"
                    style={{ marginBottom: 0 }}
                    placeholder="ID Number"
                    value={queueSearch.nic}
                    onChange={(e) => setQueueSearch({ ...queueSearch, nic: e.target.value })}
                  />
                </div>

                <div className="walkin-form-group">
                  <label className="walkin-label">Phone</label>
                  <input
                    type="text"
                    className="sidebar-search-input"
                    style={{ marginBottom: 0 }}
                    placeholder="07X..."
                    value={queueSearch.phone}
                    onChange={(e) => setQueueSearch({ ...queueSearch, phone: e.target.value })}
                  />
                </div>

                <div className="walkin-form-group full-width">
                  <label className="walkin-label">Date of Birth (YYYY, YYYY/MM, or YYYY-MM-DD)</label>
                  <input
                    type="text"
                    className="sidebar-search-input"
                    style={{ marginBottom: 0 }}
                    placeholder="e.g., 2005 or 2005/12 or 1993-05-14"
                    value={queueSearch.dob}
                    onChange={(e) => setQueueSearch({ ...queueSearch, dob: e.target.value })}
                  />
                </div>
              </div>

              {searchingQueuePatients && (
                <p style={{ color: '#0f766e', fontSize: '0.86rem', fontWeight: 700, margin: '6px 0' }}>
                  Searching patient database...
                </p>
              )}

              <div className="queue-search-results-scroll">
                {queueSearchResults.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '32px 12px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    Type a patient&apos;s Name, NIC, Phone, or Birth Year above to find them and add them to today&apos;s active queue.
                  </p>
                ) : (
                  queueSearchResults.map((pat) => {
                    const alreadyInQueue = activeWaitingQueue.some((q) => q.patient?.id === pat.id);
                    return (
                      <div key={pat.id} className="queue-patient-result-card">
                        <div className="patient-item-info">
                          <div className="patient-item-name">{pat.name}</div>
                          <div className="patient-item-sub">
                            DOB: {formatClearDate(pat.birth_date)} ({calculateAge(pat.birth_date)})
                          </div>
                          <div className="patient-item-sub">
                            Tel: {pat.phone || 'N/A'} {pat.id_number ? `• NIC: ${pat.id_number}` : ''}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={alreadyInQueue || addingToQueueId === pat.id}
                          className="add-to-queue-btn"
                          onClick={() => handleAddPatientToQueue(pat)}
                        >
                          {alreadyInQueue
                            ? '✓ In Queue'
                            : addingToQueueId === pat.id
                            ? 'Adding...'
                            : '+ Add to Queue'}
                        </button>
                      </div>
                    );
                  })
                )}

                {hasMoreQueueSearch && (
                  <button
                    type="button"
                    onClick={() => handleQueuePatientSearch(queueSearchPage + 1)}
                    className="walkin-submit-btn"
                    style={{ marginTop: '8px' }}
                  >
                    Load More Results
                  </button>
                )}
              </div>
            </section>

            {/* RIGHT WIDE COLUMN: TODAY'S ACTIVE WAITING QUEUE FOR DOCTOR */}
            <main className="counter-active-queue-card">
              <div className="section-card-header" style={{ marginBottom: '16px', paddingBottom: '14px' }}>
                <div>
                  <h2 className="section-card-title" style={{ fontSize: '1.3rem' }}>
                    Today&apos;s Active Waiting Queue (Doctor Room)
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#64748b', fontWeight: 600 }}>
                    Strictly showing patients registered for <strong>today only</strong>. Old unfinished tickets from past days are automatically cleared.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="queue-count-pill" style={{ fontSize: '0.9rem', padding: '7px 14px' }}>
                    {activeWaitingQueue.length} Waiting Today
                  </span>
                  <button type="button" onClick={fetchActiveWaitingQueue} className="refresh-mini-btn" style={{ height: '38px' }}>
                    {loadingWaitingQueue ? 'Loading...' : '↻ Refresh'}
                  </button>
                </div>
              </div>

              <div className="active-queue-list-scroll">
                {activeWaitingQueue.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '70px 24px', color: '#64748b' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                      Active Queue is Currently Empty (0 Waiting)
                    </h3>
                    <p style={{ fontSize: '0.95rem', maxWidth: '460px', margin: '0 auto', lineHeight: '1.6' }}>
                      Search for an existing patient in the middle column and click <strong>+ Add to Queue</strong>, or register a new patient in the <strong>Registration</strong> tab.
                    </p>
                  </div>
                ) : (
                  activeWaitingQueue.map((item, index) => (
                    <div key={item.ticket_id} className="active-queue-row-card">
                      <div className="active-queue-left">
                        <div className="active-queue-number-circle" title="Arrival Queue Order">
                          #{index + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0f172a' }}>
                            {item.patient.name}
                          </div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#475569', marginTop: '3px' }}>
                            {calculateAge(item.patient.birth_date)} • DOB: {formatClearDate(item.patient.birth_date)} • Tel: {item.patient.phone || 'No Phone'}
                            {item.patient.id_number ? ` • NIC: ${item.patient.id_number}` : ''}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="cancel-queue-btn"
                        onClick={() => handleRemoveFromActiveQueue(item.ticket_id, item.patient.name)}
                        title="Remove patient if they walked out or cancelled before seeing the doctor"
                      >
                        ✕ Cancel / Left Clinic
                      </button>
                    </div>
                  ))
                )}
              </div>
            </main>
          </>
        )}

        {/* ================= PAGE 4: SPACIOUS COUNTER PATIENT REGISTRATION ================= */}
        {activePage === 'registration' && (
          <main className="counter-registration-card">
            <div className="section-card-header" style={{ marginBottom: '18px' }}>
              <div>
                <h2 className="section-card-title" style={{ fontSize: '1.4rem' }}>
                  New Patient Registration
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                  Register a new patient into the master database. Fields automatically clear on submit so you can register the next patient immediately.
                </p>
              </div>
              <span className="section-card-tag">Master Database Entry</span>
            </div>

            <form onSubmit={handleCounterRegisterPatient} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="counter-reg-grid">
                <div className="counter-reg-group span-2">
                  <label className="counter-reg-label">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    className="counter-reg-input"
                    placeholder="Enter patient's full name"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="counter-reg-group">
                  <label className="counter-reg-label">Date of Birth (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    className="counter-reg-input"
                    value={regForm.birth_date}
                    onChange={(e) => setRegForm({ ...regForm, birth_date: e.target.value })}
                  />
                </div>

                <div className="counter-reg-group">
                  <label className="counter-reg-label">Gender *</label>
                  <div className="counter-reg-radio-box">
                    <label className="walkin-radio-label" style={{ fontSize: '0.95rem' }}>
                      <input
                        type="radio"
                        name="counter_gender"
                        value="1"
                        checked={regForm.gender === '1'}
                        onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                      />
                      Male
                    </label>
                    <label className="walkin-radio-label" style={{ fontSize: '0.95rem' }}>
                      <input
                        type="radio"
                        name="counter_gender"
                        value="0"
                        checked={regForm.gender === '0'}
                        onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                      />
                      Female
                    </label>
                  </div>
                </div>

                <div className="counter-reg-group">
                  <label className="counter-reg-label">Marital Status *</label>
                  <div className="counter-reg-radio-box">
                    <label className="walkin-radio-label" style={{ fontSize: '0.95rem' }}>
                      <input
                        type="radio"
                        name="counter_married"
                        value="0"
                        checked={regForm.married === '0'}
                        onChange={(e) => setRegForm({ ...regForm, married: e.target.value })}
                      />
                      Single / Unmarried
                    </label>
                    <label className="walkin-radio-label" style={{ fontSize: '0.95rem' }}>
                      <input
                        type="radio"
                        name="counter_married"
                        value="1"
                        checked={regForm.married === '1'}
                        onChange={(e) => setRegForm({ ...regForm, married: e.target.value })}
                      />
                      Married
                    </label>
                  </div>
                </div>

                <div className="counter-reg-group">
                  <label className="counter-reg-label">Mobile Phone Number *</label>
                  <input
                    type="text"
                    className="counter-reg-input"
                    placeholder="07X XXX XXXX"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  />
                </div>

                <div className="counter-reg-group">
                  <label className="counter-reg-label">NIC / ID Number (Optional)</label>
                  <input
                    type="text"
                    className="counter-reg-input"
                    placeholder="National ID Number"
                    value={regForm.id_number}
                    onChange={(e) => setRegForm({ ...regForm, id_number: e.target.value })}
                  />
                </div>

                <div className="counter-reg-group">
                  <label className="counter-reg-label">Weight in kg (Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="counter-reg-input"
                    placeholder="e.g., 65.5"
                    value={regForm.weight}
                    onChange={(e) => setRegForm({ ...regForm, weight: e.target.value })}
                  />
                </div>

                <div className="counter-reg-group">
                  <label className="counter-reg-label">Height in cm (Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="counter-reg-input"
                    placeholder="e.g., 170"
                    value={regForm.height}
                    onChange={(e) => setRegForm({ ...regForm, height: e.target.value })}
                  />
                </div>

                <div className="counter-reg-group span-3">
                  <label className="counter-reg-label">Common Details / Initial Medical Notes (Optional)</label>
                  <input
                    type="text"
                    className="counter-reg-input"
                    placeholder="Known medical conditions, long-term notes, or reference details..."
                    value={regForm.common}
                    onChange={(e) => setRegForm({ ...regForm, common: e.target.value })}
                  />
                </div>
              </div>

              <div className="counter-reg-submit-bar">
                <label className="walkin-radio-label" style={{ fontSize: '1rem', fontWeight: 800, color: '#0f766e' }}>
                  <input
                    type="checkbox"
                    checked={regForm.autoAddToQueue}
                    onChange={(e) => setRegForm({ ...regForm, autoAddToQueue: e.target.checked })}
                    style={{ width: '20px', height: '20px', accentColor: '#0d9488' }}
                  />
                  Automatically place this patient into Today&apos;s Active Doctor Queue upon registration
                </label>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="refresh-mini-btn"
                    style={{ padding: '14px 22px', fontSize: '0.95rem' }}
                    onClick={() =>
                      setRegForm({
                        name: '',
                        birth_date: '',
                        phone: '',
                        id_number: '',
                        gender: '1',
                        married: '0',
                        weight: '',
                        height: '',
                        common: '',
                        autoAddToQueue: regForm.autoAddToQueue
                      })
                    }
                  >
                    Clear Fields
                  </button>

                  <button
                    type="submit"
                    disabled={registeringPatient}
                    className="pos-grand-submit-btn"
                    style={{ padding: '16px 34px' }}
                  >
                    {registeringPatient ? 'REGISTERING...' : '✓ REGISTER PATIENT'}
                  </button>
                </div>
              </div>
            </form>
          </main>
        )}
      </div>

      {/* ================= SUMMARY-ONLY BILL PRINT & SMS MODAL ================= */}
      {completedBillModal && (
        <div className="receipt-modal-backdrop">
          <div className="receipt-modal-card">
            <div className="receipt-modal-top">
              <h2 className="receipt-modal-title">
                Bill Completed — Issue Receipt
              </h2>
              <button
                type="button"
                className="receipt-modal-close-icon"
                onClick={() => setCompletedBillModal(null)}
                title="Close Receipt Window"
              >
                ×
              </button>
            </div>

            <div className="receipt-format-switcher">
              <button
                type="button"
                className={`format-tab-btn ${printFormat === 'thermal' ? 'active' : ''}`}
                onClick={() => setPrintFormat('thermal')}
              >
                🧾 80mm Thermal POS Printer
              </button>
              <button
                type="button"
                className={`format-tab-btn ${printFormat === 'a4' ? 'active' : ''}`}
                onClick={() => setPrintFormat('a4')}
              >
                📄 Standard A4 Format
              </button>
            </div>

            <div className={`printable-bill-sheet ${printFormat === 'thermal' ? 'thermal-mode' : 'a4-mode'}`}>
              <div className="receipt-brand-header">
                <div className="receipt-brand-script">Wellspring</div>
                <div className="receipt-brand-sub">Medical Center &amp; Dispensary</div>
                <span className="receipt-no-badge">
                  Official Receipt #{completedBillModal.daily_bill_no || completedBillModal.bill_id}
                </span>
              </div>

              <div className="receipt-meta-list">
                <div className="receipt-meta-row">
                  <span className="receipt-meta-label">Date &amp; Time:</span>
                  <span className="receipt-meta-value">{completedBillModal.date_str}</span>
                </div>
                <div className="receipt-meta-row">
                  <span className="receipt-meta-label">Patient Name(s):</span>
                  <span className="receipt-meta-value">{completedBillModal.patient_names}</span>
                </div>
                <div className="receipt-meta-row">
                  <span className="receipt-meta-label">Consultant:</span>
                  <span className="receipt-meta-value">{completedBillModal.doctor_name}</span>
                </div>
              </div>

              <div className="receipt-summary-box">
                <div className="receipt-summary-note">
                  <span>Medical Consultation &amp; Dispensary Charges</span>
                  <span>Included</span>
                </div>
                <div className="receipt-grand-row">
                  <span>TOTAL AMOUNT</span>
                  <span>Rs. {Number(completedBillModal.final_total).toFixed(2)}</span>
                </div>
              </div>

              <div className="receipt-footer-note">
                Thank you for visiting Wellspring.<br />
                Wishing you a speedy recovery!
              </div>
            </div>

            {showSmsConfirmBox && (
              <div className="sms-confirm-drawer">
                {smsSentStatus ? (
                  <div className="sms-sent-success-banner">
                    <div>
                      <div style={{ fontSize: '1.02rem', fontWeight: 800 }}>
                        ✓ SMS Receipt Sent to {smsSentStatus.phone}
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, marginTop: '2px' }}>
                        {smsSentStatus.savedToProfile
                          ? 'Updated registered patient mobile number.'
                          : 'Sent as one-time Walk-In SMS (No patient account modified).'}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="sms-edit-btn"
                      onClick={() => {
                        setSmsSentStatus(null);
                        setIsEditingSmsPhone(true);
                      }}
                    >
                      Resend / Change
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="sms-confirm-header">
                      <span className="sms-confirm-title">
                        📱 {completedBillModal.is_walk_in
                          ? 'Enter One-Time Walk-In Mobile Number for SMS'
                          : 'Confirm Patient Mobile Number for SMS Bill'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSmsConfirmBox(false)}
                        style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>

                    {!isEditingSmsPhone ? (
                      <div className="sms-phone-display-row">
                        <div>
                          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>
                            {completedBillModal.is_walk_in ? 'Walk-In Mobile Number:' : 'Registered Database Number:'}
                          </div>
                          <div className="sms-phone-number-text">
                            {smsPhoneInput || 'No Phone Number Entered'}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="sms-edit-btn"
                          onClick={() => setIsEditingSmsPhone(true)}
                        >
                          ✎ Edit Number
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <input
                          type="text"
                          className="pos-field-input"
                          placeholder="Enter mobile number (e.g. 0771234567)"
                          value={smsPhoneInput}
                          onChange={(e) => setSmsPhoneInput(e.target.value)}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="sms-edit-btn"
                          onClick={() => setIsEditingSmsPhone(false)}
                        >
                          Lock In
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={sendingSms}
                      className="pos-add-btn green"
                      style={{ width: '100%', height: '44px', fontSize: '0.95rem' }}
                      onClick={handleConfirmAndSendSms}
                    >
                      {sendingSms
                        ? 'Sending SMS...'
                        : `✓ Confirm & Send SMS to ${smsPhoneInput || '...'}`}
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="receipt-modal-actions">
              <button
                type="button"
                className="pos-add-btn green"
                style={{ height: '48px' }}
                onClick={() => printReceiptDocument(completedBillModal, printFormat)}
              >
                🖨️ Print ({printFormat === 'thermal' ? '80mm' : 'A4'})
              </button>

              <button
                type="button"
                className="pos-add-btn"
                style={{ height: '48px', background: smsSentStatus ? '#16a34a' : undefined }}
                onClick={handleInitiateSmsFlow}
              >
                {smsSentStatus ? '✓ SMS Sent' : '📱 Send SMS Bill'}
              </button>

              <button
                type="button"
                className="doc-logout-btn"
                style={{ height: '48px', background: '#334155', borderColor: '#475569' }}
                onClick={() => setCompletedBillModal(null)}
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}