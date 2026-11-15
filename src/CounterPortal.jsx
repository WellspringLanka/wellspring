import { Link } from 'react-router-dom';
import { useCounterPortalLogic } from './counterLogic';
import './DoctorPortal.css';
import './CounterPortal.css';

export default function CounterPortal() {
  const {
    DOCTOR_THEMES,
    calculateAge,
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
    handleSendSmsBill,
    doctorBellAlert,
    setDoctorBellAlert,
    statusBanner
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
      {/* TOP HEADER BAR */}
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

          {/* LIVE DOCTOR BELL ALERT RECEIVER */}
          <button
            type="button"
            onClick={() => setDoctorBellAlert(null)}
            className={`counter-bell-indicator ${doctorBellAlert ? 'ringing-alert' : ''}`}
            title="Click to acknowledge Doctor Bell Alert"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>
              {doctorBellAlert
                ? `🔔 DOCTOR CALLING COUNTER! (Click to Dismiss)`
                : 'Doctor Bell: Standby'}
            </span>
          </button>
        </div>

        <div className="doc-topbar-right">
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

          {/* RED SIGN OUT BUTTON */}
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
        {/* ================= 1. LEFT SIDEBAR ================= */}
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
              <span className="nav-badge-pill">{prescriptionQueue.length} Rx</span>
            </button>

            <button
              type="button"
              className={`counter-nav-btn ${activePage === 'queue' ? 'active' : ''}`}
              onClick={() => setActivePage('queue')}
            >
              <span>2. Active Queue</span>
              <span className="nav-badge-pill">Manage</span>
            </button>

            <button
              type="button"
              className={`counter-nav-btn ${activePage === 'registration' ? 'active' : ''}`}
              onClick={() => setActivePage('registration')}
            >
              <span>3. Registration</span>
              <span className="nav-badge-pill">+ New</span>
            </button>
          </nav>

          <div className="counter-sidebar-footer">
            <strong>Family Billing Tip:</strong> Click <strong>+ Family Bill</strong> on multiple patients in the prescription list to combine a family&apos;s prescriptions onto a single receipt.
          </div>
        </aside>

        {/* ================= PAGE 1: PHARMACY & POS TERMINAL ================= */}
        {activePage === 'pharmacy' ? (
          <>
            {/* 2. MIDDLE COLUMN: INCOMING PRESCRIPTIONS FROM DOCTOR */}
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
                    No waiting prescriptions from the Doctor right now. You can still ring up direct over-the-counter bills on the right.
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

                        {/* DOCTOR'S PRESCRIPTION SHORTHAND */}
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
                            title="Patient only took an outdoor prescription / left without buying medicines"
                          >
                            Outdoor Rx / Leave →
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* 3. RIGHT WIDE COLUMN: CLASSIC POS & BILLING TERMINAL */}
            <main className="counter-pos-card">
              {/* TOP ACTIVE PATIENT(S) & PRESCRIPTION VIEWER */}
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
                        placeholder="Phone (For SMS)"
                        value={customWalkInPhone}
                        onChange={(e) => setCustomWalkInPhone(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* SIDE-BY-SIDE PRESCRIPTION CARDS FOR SELECTED FAMILY MEMBERS */}
                {activePrescriptionCards.length > 0 && (
                  <div className="pos-rx-cards-grid">
                    {activePrescriptionCards.map((card) => (
                      <div key={card.ticket_id} className="pos-rx-mini-card">
                        <div className="pos-rx-mini-name">
                          Rx for {card.patient.name}:
                        </div>
                        <div className="pos-rx-mini-text">{card.prescription}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DUAL DROPDOWN ENTRY BAR: MEDICINES (WITH QTY) vs CLINIC SERVICES (NO QTY) */}
              <div className="pos-dual-entry-grid">
                {/* BOX A: MEDICINE AUTOCOMPLETE + UNIT PRICE (AUTO-SAVES DB) + QUANTITY */}
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

                {/* BOX B: CONSULTATION FEES & CLINIC CAUSES (NO QUANTITY FIELD) */}
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

              {/* POS BILL ITEMS TABLE (INTERNAL COUNTER VIEW ONLY) */}
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

              {/* BOTTOM CHECKOUT BAR WITH MANUAL TOTAL OVERRIDE FOR ROUNDING */}
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
                    disabled={submittingCheckout || selectedTicketIds.length === 0}
                    className="outdoor-submit-btn"
                    onClick={() => handleFinalizeCheckout('OUTDOOR_RX')}
                    title="Select when doctor wrote outdoor drugs and patient leaves without dispensary billing"
                  >
                    Outdoor Drugs / Close Queue
                  </button>

                  <button
                    type="button"
                    disabled={submittingCheckout}
                    className="pos-grand-submit-btn"
                    onClick={() => handleFinalizeCheckout('COMPLETED_BILL')}
                  >
                    {submittingCheckout ? 'PROCESSING...' : 'SUBMIT & ISSUE BILL'}
                  </button>
                </div>
              </div>
            </main>
          </>
        ) : (
          /* PLACEHOLDER FOR QUEUE & REGISTRATION SUB-PAGES (NEXT STEP) */
          <main className="counter-pos-card" style={{ gridColumn: '2 / -1', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              {activePage === 'queue' ? 'Active Clinic Queue Management' : 'Counter Patient Registration'}
            </h2>
            <p style={{ color: '#64748b', maxWidth: '520px', fontSize: '1rem', lineHeight: '1.6' }}>
              The <strong>Pharmacy &amp; POS</strong> module is live. Ready to build the <strong>{activePage === 'queue' ? 'Queue' : 'Registration'}</strong> sub-page next whenever you give the word!
            </p>
          </main>
        )}
      </div>

      {/* ================= SUMMARY-ONLY BILL PRINT & SMS MODAL ================= */}
      {completedBillModal && (
        <div className="receipt-modal-backdrop">
          <div className="receipt-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                Bill Completed — Issue Receipt
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`rx-family-toggle-btn ${printFormat === 'thermal' ? 'active' : ''}`}
                  onClick={() => setPrintFormat('thermal')}
                >
                  80mm POS Printer
                </button>
                <button
                  type="button"
                  className={`rx-family-toggle-btn ${printFormat === 'a4' ? 'active' : ''}`}
                  onClick={() => setPrintFormat('a4')}
                >
                  A4 Format
                </button>
              </div>
            </div>

            {/* PRINTABLE SUMMARY RECEIPT (STRICTLY NO ITEMIZED MEDICINES OR PRICES) */}
            <div className={`printable-bill-sheet ${printFormat === 'thermal' ? 'thermal-mode' : 'a4-mode'}`}>
              <div style={{ textAlign: 'center', borderBottom: '1.5px solid #000', paddingBottom: '10px', marginBottom: '12px' }}>
                <div style={{ fontFamily: 'Tangerine, cursive', fontSize: '3rem', fontWeight: 700, lineHeight: 0.9 }}>
                  Wellspring
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Medical Center &amp; Dispensary
                </div>
                <div style={{ fontSize: '0.76rem', marginTop: '4px' }}>
                  Official Payment Receipt #{completedBillModal.bill_id}
                </div>
              </div>

              <div style={{ fontSize: '0.88rem', lineHeight: '1.7', marginBottom: '14px' }}>
                <div><strong>Date:</strong> {completedBillModal.date_str}</div>
                <div><strong>Patient(s):</strong> {completedBillModal.patient_names}</div>
                <div><strong>Consultant:</strong> {completedBillModal.doctor_name}</div>
              </div>

              <div style={{ borderTop: '1.5px dashed #000', borderBottom: '1.5px dashed #000', padding: '14px 0', margin: '14px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: 600, marginBottom: '6px' }}>
                  <span>Medical Consultation &amp; Dispensary Charges</span>
                  <span>Included</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem', fontWeight: 800, marginTop: '10px' }}>
                  <span>TOTAL AMOUNT</span>
                  <span>Rs. {Number(completedBillModal.final_total).toFixed(2)}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.78rem', marginTop: '12px' }}>
                Thank you for visiting Wellspring.<br />Wishing you a speedy recovery!
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="pos-add-btn green"
                style={{ height: '46px' }}
                onClick={() => window.print()}
              >
                🖨️ Print ({printFormat.toUpperCase()})
              </button>

              <button
                type="button"
                className="pos-add-btn"
                style={{ height: '46px' }}
                onClick={() => handleSendSmsBill(completedBillModal)}
              >
                📱 Send SMS Bill
              </button>

              <button
                type="button"
                className="doc-logout-btn"
                style={{ height: '46px', background: '#334155', borderColor: '#475569' }}
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