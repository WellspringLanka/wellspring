import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { DOCTOR_THEMES, calculateAge, formatClearDate } from './doctorLogic';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Format live Sri Lanka Clock (Asia/Colombo)
export function getFormattedSriLankaClock() {
  const now = new Date();
  const timePart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(now);

  const datePart = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(now);

  return `${datePart} • ${timePart}`;
}

// 1. REALISTIC METALLIC DESK BELL SOUND (Double-Strike Brass Reception Bell)
function playDoctorBellSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();

    const strikeBell = (startTime) => {
      // Metallic bell harmonic overtones (Fundamental + Inharmonic partials)
      const partials = [
        { freq: 1046.5, amp: 0.35, decay: 1.4 }, // C6 fundamental ring
        { freq: 2093.0, amp: 0.22, decay: 1.0 }, // 2nd harmonic
        { freq: 3139.5, amp: 0.14, decay: 0.65 }, // Metallicclang partial
        { freq: 4435.0, amp: 0.09, decay: 0.3 }   // Initial brass strike transient
      ];

      partials.forEach(({ freq, amp, decay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(amp, startTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + decay + 0.05);
      });
    };

    // Classic "Ding-Ding!" double reception bell ring
    strikeBell(ctx.currentTime);
    strikeBell(ctx.currentTime + 0.28);
  } catch {
    // Audio blocked until user interaction
  }
}

// 2. SUBTLE CHIME WHEN NEW PRESCRIPTION ARRIVES AT COUNTER
function playNewPrescriptionSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [587.33, 880.0]; // Soft D5 -> A5 gentle chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.12 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.5);
    });
  } catch {
    // Ignore if audio context not unlocked yet
  }
}

// Dedicated Print Engine for True 80mm Thermal POS Printer vs A4 Sheet
export function printReceiptDocument(billObj, format = 'thermal') {
  if (!billObj) return;
  const isThermal = format === 'thermal';
  const displayReceiptNo = billObj.daily_bill_no || billObj.bill_id || 1;

  const printWindow = window.open('', '_blank', 'width=450,height=650');
  if (!printWindow) {
    alert('Please allow pop-ups in your browser to print receipts.');
    return;
  }

  const pageSizeRule = isThermal
    ? '@page { size: 80mm auto; margin: 0mm; }'
    : '@page { size: A4 portrait; margin: 18mm; }';

  const bodyStyles = isThermal
    ? `width: 72mm; margin: 0 auto; padding: 4mm 2mm; font-family: 'Courier New', monospace; color: #000;`
    : `width: 100%; max-width: 680px; margin: 0 auto; padding: 24px; font-family: 'Segoe UI', Arial, sans-serif; color: #000; border: 1.5px solid #000; border-radius: 8px;`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Wellspring Receipt #${displayReceiptNo}</title>
        <link href="https://fonts.googleapis.com/css2?family=Tangerine:wght@700&display=swap" rel="stylesheet">
        <style>
          ${pageSizeRule}
          * { box-sizing: border-box; }
          body { ${bodyStyles} background: #fff; -webkit-print-color-adjust: exact; }
          .brand { font-family: 'Tangerine', cursive; font-size: ${isThermal ? '42px' : '54px'}; font-weight: 700; text-align: center; line-height: 0.9; margin-bottom: 4px; }
          .sub { text-align: center; font-size: ${isThermal ? '11px' : '14px'}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
          .receipt-no { text-align: center; font-size: ${isThermal ? '11px' : '13px'}; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1.5px dashed #000; }
          .meta-row { display: flex; justify-content: space-between; font-size: ${isThermal ? '12px' : '15px'}; margin-bottom: 6px; gap: 10px; }
          .meta-label { font-weight: 700; white-space: nowrap; }
          .meta-val { text-align: right; word-break: break-word; }
          .summary-box { border-top: 1.5px dashed #000; border-bottom: 1.5px dashed #000; padding: 12px 0; margin: 14px 0; }
          .summary-line { display: flex; justify-content: space-between; font-size: ${isThermal ? '12px' : '15px'}; margin-bottom: 8px; }
          .grand-total { display: flex; justify-content: space-between; font-size: ${isThermal ? '17px' : '22px'}; font-weight: 800; padding-top: 6px; }
          .footer { text-align: center; font-size: ${isThermal ? '11px' : '13px'}; margin-top: 14px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="brand">Wellspring</div>
        <div class="sub">Medical Center &amp; Dispensary</div>
        <div class="receipt-no">Official Receipt #${displayReceiptNo}</div>

        <div class="meta-row">
          <span class="meta-label">Date:</span>
          <span class="meta-val">${billObj.date_str}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Patient(s):</span>
          <span class="meta-val">${billObj.patient_names}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Consultant:</span>
          <span class="meta-val">${billObj.doctor_name}</span>
        </div>

        <div class="summary-box">
          <div class="summary-line">
            <span>Consultation &amp; Dispensary Charges</span>
            <span>Included</span>
          </div>
          <div class="grand-total">
            <span>TOTAL PAID</span>
            <span>Rs. ${Number(billObj.final_total).toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for visiting Wellspring.<br/>
          Wishing you a speedy recovery!
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              window.close();
            }, 250);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function useCounterPortalLogic() {
  // Live Sri Lanka System Clock
  const [currentClock, setCurrentClock] = useState(() => getFormattedSriLankaClock());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentClock(getFormattedSriLankaClock());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Theme Selector
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('wellspring_counter_theme') || 'teal';
  });

  useEffect(() => {
    localStorage.setItem('wellspring_counter_theme', activeTheme);
  }, [activeTheme]);

  // 2. Counter Staff Auth State
  const [loggedInStaff, setLoggedInStaff] = useState(() => {
    const saved = sessionStorage.getItem('wellspring_counter_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // 3. Left Sidebar Navigation: 'pharmacy' | 'today_log' | 'queue' | 'registration'
  const [activePage, setActivePage] = useState('pharmacy');

  // 4. Incoming Prescriptions from Doctor (flag = 2) + Sound Detection Ref
  const [prescriptionQueue, setPrescriptionQueue] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [customWalkInName, setCustomWalkInName] = useState('');
  const [customWalkInPhone, setCustomWalkInPhone] = useState('');
  const knownPrescriptionIdsRef = useRef(null);

  // 5. Medicine & Clinic Services Catalog
  const [medicinesCatalog, setMedicinesCatalog] = useState([]);
  const [servicesCatalog, setServicesCatalog] = useState([]);

  // 6. Box A: Medicine Autocomplete & Price Updater State
  const [medSearchText, setMedSearchText] = useState('');
  const [selectedMedObj, setSelectedMedObj] = useState(null);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [medUnitPrice, setMedUnitPrice] = useState('');
  const [medQty, setMedQty] = useState('1');
  const [updatingPriceInDb, setUpdatingPriceInDb] = useState(false);

  // 7. Box B: Dispensary Service / Fee State
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceCustomName, setServiceCustomName] = useState('');
  const [serviceFeeAmount, setServiceFeeAmount] = useState('');

  // 8. Active POS Cart Items & Manual Final Total Override
  const [billItems, setBillItems] = useState([]);
  const [manualFinalTotal, setManualFinalTotal] = useState('');
  const [isManualTotalEdited, setIsManualTotalEdited] = useState(false);

  // 9. Completed Bill Modal + SMS Confirmation & Sent State
  const [completedBillModal, setCompletedBillModal] = useState(null);
  const [printFormat, setPrintFormat] = useState('thermal');
  const [submittingCheckout, setSubmittingCheckout] = useState(false);

  const [showSmsConfirmBox, setShowSmsConfirmBox] = useState(false);
  const [smsPhoneInput, setSmsPhoneInput] = useState('');
  const [isEditingSmsPhone, setIsEditingSmsPhone] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [smsSentStatus, setSmsSentStatus] = useState(null);

  // 10. Today's Log State
  const [todayLogList, setTodayLogList] = useState([]);
  const [loadingTodayLog, setLoadingTodayLog] = useState(false);
  const [todayLogSearch, setTodayLogSearch] = useState('');

  // 11. Page 3: Active Queue & Patient Search State (Same smart search as Doctor Portal)
  const [activeWaitingQueue, setActiveWaitingQueue] = useState([]);
  const [loadingWaitingQueue, setLoadingWaitingQueue] = useState(false);
  const [queueSearch, setQueueSearch] = useState({ name: '', nic: '', phone: '', dob: '' });
  const [queueSearchResults, setQueueSearchResults] = useState([]);
  const [queueSearchPage, setQueueSearchPage] = useState(1);
  const [hasMoreQueueSearch, setHasMoreQueueSearch] = useState(false);
  const [searchingQueuePatients, setSearchingQueuePatients] = useState(false);
  const [addingToQueueId, setAddingToQueueId] = useState(null);

  // 12. Page 4: Counter Full Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    birth_date: '',
    phone: '',
    id_number: '',
    gender: '',
    married: '0',
    weight: '',
    height: '',
    common: '',
    autoAddToQueue: true
  });
  const [registeringPatient, setRegisteringPatient] = useState(false);

  // 13. Live Doctor Bell Receiver Alert
  const [lastSeenBellId, setLastSeenBellId] = useState(() => {
    return Number(sessionStorage.getItem('last_seen_bell_id') || 0);
  });
  const [doctorBellAlert, setDoctorBellAlert] = useState(null);
  const [statusBanner, setStatusBanner] = useState(null);

  const showToast = (message, type = 'success') => {
    setStatusBanner({ message, type });
    setTimeout(() => setStatusBanner(null), 4000);
  };

  // Login Handler
  const handleCounterLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await axios.post(`${API_BASE}/counter/login`, {
        username: loginUsername,
        password: loginPassword
      });
      setLoggedInStaff(res.data);
      sessionStorage.setItem('wellspring_counter_session', JSON.stringify(res.data));
      setLoginPassword('');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Unable to sign in to Counter Console.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleCounterLogout = () => {
    sessionStorage.removeItem('wellspring_counter_session');
    setLoggedInStaff(null);
    setSelectedTicketIds([]);
    setBillItems([]);
  };

  const fetchCatalog = useCallback(async () => {
    if (!loggedInStaff) return;
    try {
      const res = await axios.get(`${API_BASE}/counter/catalog`);
      setMedicinesCatalog(res.data.medicines || []);
      setServicesCatalog(res.data.services || []);
      if (res.data.services && res.data.services.length > 0 && !selectedServiceId) {
        const firstSrv = res.data.services[0];
        setSelectedServiceId(String(firstSrv.id));
        setServiceFeeAmount(String(firstSrv.default_price));
      }
    } catch (err) {
      console.error('Failed to load catalog:', err.message);
    }
  }, [loggedInStaff, selectedServiceId]);

  // Fetch Incoming Doctor Prescriptions (flag = 2) + Play Chime on New Arrival
  const fetchPrescriptions = useCallback(async () => {
    if (!loggedInStaff) return;
    setLoadingPrescriptions(true);
    try {
      const res = await axios.get(`${API_BASE}/counter/prescriptions`);
      const list = res.data || [];

      // Detect if a brand new prescription arrived from the Doctor
      const incomingIds = list.map(item => item.ticket_id);
      if (knownPrescriptionIdsRef.current !== null) {
        const hasNewArrival = incomingIds.some(id => !knownPrescriptionIdsRef.current.includes(id));
        if (hasNewArrival) {
          playNewPrescriptionSound();
        }
      }
      knownPrescriptionIdsRef.current = incomingIds;

      setPrescriptionQueue(list);

      setSelectedTicketIds(prev => {
        const validExisting = prev.filter(id => list.some(item => item.ticket_id === id));
        if (validExisting.length > 0) return validExisting;
        return list.length > 0 ? [list[0].ticket_id] : [];
      });
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err.message);
    } finally {
      setLoadingPrescriptions(false);
    }
  }, [loggedInStaff]);

  // Fetch Active Doctor Waiting Queue (flag = 1)
  const fetchActiveWaitingQueue = useCallback(async () => {
    if (!loggedInStaff) return;
    setLoadingWaitingQueue(true);
    try {
      const res = await axios.get(`${API_BASE}/doctor/queue`);
      setActiveWaitingQueue(res.data || []);
    } catch (err) {
      console.error('Failed to load active waiting queue:', err.message);
    } finally {
      setLoadingWaitingQueue(false);
    }
  }, [loggedInStaff]);

  const fetchTodayLog = useCallback(async () => {
    if (!loggedInStaff) return;
    setLoadingTodayLog(true);
    try {
      const res = await axios.get(`${API_BASE}/counter/today-log`);
      setTodayLogList(res.data || []);
    } catch (err) {
      console.error('Failed to load today log:', err.message);
    } finally {
      setLoadingTodayLog(false);
    }
  }, [loggedInStaff]);

  useEffect(() => {
    if (!loggedInStaff) return;
    if (activePage === 'today_log') fetchTodayLog();
    if (activePage === 'queue') fetchActiveWaitingQueue();
  }, [loggedInStaff, activePage, fetchTodayLog, fetchActiveWaitingQueue]);

  // Poll every 4 seconds for Doctor Bell, Prescriptions, and Active Queue
  useEffect(() => {
    if (!loggedInStaff) return;
    fetchCatalog();
    fetchPrescriptions();
    fetchActiveWaitingQueue();
    fetchTodayLog();

    const pollInterval = setInterval(async () => {
      fetchPrescriptions();
      fetchActiveWaitingQueue();
      try {
        const res = await axios.get(`${API_BASE}/counter/alerts`);
        const latestBell = res.data;
        if (latestBell && latestBell.id > lastSeenBellId) {
          if (lastSeenBellId !== 0) {
            setDoctorBellAlert(latestBell);
            playDoctorBellSound();
          }
          setLastSeenBellId(latestBell.id);
          sessionStorage.setItem('last_seen_bell_id', String(latestBell.id));
        }
      } catch {
        // Ignore polling hiccups
      }
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [loggedInStaff, fetchCatalog, fetchPrescriptions, fetchActiveWaitingQueue, fetchTodayLog, lastSeenBellId]);

  // Smart Search for Queue Tab (Identical to Doctor Portal Search)
  const handleQueuePatientSearch = async (pageToLoad = 1) => {
    const { name, nic, phone, dob } = queueSearch;
    if (!name.trim() && !nic.trim() && !phone.trim() && !dob.trim()) {
      setQueueSearchResults([]);
      return;
    }
    setSearchingQueuePatients(true);
    try {
      const res = await axios.get(`${API_BASE}/patients/search`, {
        params: { name, nic, phone, dob, page: pageToLoad }
      });
      if (pageToLoad === 1) {
        setQueueSearchResults(res.data.data || []);
      } else {
        setQueueSearchResults(prev => [...prev, ...(res.data.data || [])]);
      }
      setQueueSearchPage(pageToLoad);
      setHasMoreQueueSearch(res.data.hasMore);
    } catch {
      showToast('Patient search failed.', 'error');
    } finally {
      setSearchingQueuePatients(false);
    }
  };

  useEffect(() => {
    if (activePage !== 'queue') return;
    const timer = setTimeout(() => {
      const { name, nic, phone, dob } = queueSearch;
      if (name.trim().length >= 2 || nic.trim().length >= 2 || phone.trim().length >= 2 || dob.trim().length >= 4) {
        handleQueuePatientSearch(1);
      } else if (!name.trim() && !nic.trim() && !phone.trim() && !dob.trim()) {
        setQueueSearchResults([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [queueSearch, activePage]);

  // Add Patient to Today's Active Queue
  const handleAddPatientToQueue = async (patientObj) => {
    if (!patientObj || !patientObj.id) return;
    setAddingToQueueId(patientObj.id);
    try {
      const res = await axios.post(`${API_BASE}/counter/queue/add`, {
        patient_id: patientObj.id
      });
      showToast(`Added ${patientObj.name} to Active Queue (Queue #${res.data.daily_number})!`);
      await fetchActiveWaitingQueue();
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not add patient to queue.', 'error');
    } finally {
      setAddingToQueueId(null);
    }
  };

  // Cancel / Remove Patient from Active Queue (Walk-Out)
  const handleRemoveFromActiveQueue = async (ticketId, patientName) => {
    try {
      await axios.put(`${API_BASE}/counter/queue/${ticketId}/cancel`);
      showToast(`Removed ${patientName} from today's active queue.`);
      await fetchActiveWaitingQueue();
    } catch {
      showToast('Failed to remove patient from queue.', 'error');
    }
  };

  // Counter Full Patient Registration Submit (Clears form immediately for fast next entry)
  const handleCounterRegisterPatient = async (e) => {
    e.preventDefault();
    if (!regForm.name.trim()) {
      return showToast('Patient full name is required.', 'error');
    }
    // NEW: Enforce mandatory phone number
    if (!regForm.phone.trim()) {
      return showToast('Mobile phone number is required.', 'error');
    }

    if (!regForm.gender) {
      return showToast('Please select a gender.', 'error');
    }

    setRegisteringPatient(true);
    try {
      const res = await axios.post(`${API_BASE}/patients`, regForm);
      const createdPatient = res.data;

      if (regForm.autoAddToQueue) {
        await axios.post(`${API_BASE}/counter/queue/add`, {
          patient_id: createdPatient.id
        });
        await fetchActiveWaitingQueue();
        showToast(`✓ Registered ${createdPatient.name} & added to Doctor's Queue!`);
      } else {
        showToast(`✓ Successfully registered ${createdPatient.name}!`);
      }

      // Clear all fields immediately so Counter can register the next patient
      setRegForm({
        name: '',
        birth_date: '',
        phone: '',
        id_number: '',
        gender: '',
        married: '0',
        weight: '',
        height: '',
        common: '',
        autoAddToQueue: regForm.autoAddToQueue
      });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to register patient.', 'error');
    } finally {
      setRegisteringPatient(false);
    }
  };

  const handleSelectSinglePrescription = (ticketId) => {
    setSelectedTicketIds([ticketId]);
  };

  const handleToggleFamilyMember = (ticketId) => {
    setSelectedTicketIds(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const activePrescriptionCards = useMemo(() => {
    return prescriptionQueue.filter(item => selectedTicketIds.includes(item.ticket_id));
  }, [prescriptionQueue, selectedTicketIds]);

  const filteredMedicines = useMemo(() => {
    const q = medSearchText.trim().toLowerCase();
    if (!q) return medicinesCatalog.slice(0, 12);
    return medicinesCatalog
      .filter(m => m.name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [medSearchText, medicinesCatalog]);

  const handlePickMedicineFromDropdown = (med) => {
    setSelectedMedObj(med);
    setMedSearchText(med.name);
    setMedUnitPrice(String(med.unit_price));
    setShowMedDropdown(false);
  };

  const handleAddMedicineToBill = async (e) => {
    if (e) e.preventDefault();
    const cleanName = medSearchText.trim();
    const priceNum = parseFloat(medUnitPrice);
    const qtyNum = parseFloat(medQty) || 1;

    if (!cleanName) {
      return showToast('Please enter or select a medicine name.', 'error');
    }
    if (isNaN(priceNum) || priceNum < 0) {
      return showToast('Please enter a valid unit price.', 'error');
    }

    const priceWasEdited =
      !selectedMedObj ||
      selectedMedObj.name.toLowerCase() !== cleanName.toLowerCase() ||
      Number(selectedMedObj.unit_price) !== priceNum;

    if (priceWasEdited) {
      setUpdatingPriceInDb(true);
      try {
        const res = await axios.post(`${API_BASE}/counter/medicines/upsert`, {
          id: selectedMedObj && selectedMedObj.name.toLowerCase() === cleanName.toLowerCase() ? selectedMedObj.id : null,
          name: cleanName,
          unit_price: priceNum
        });
        const savedMed = res.data;
        setMedicinesCatalog(prev => {
          const exists = prev.some(m => m.id === savedMed.id);
          if (exists) {
            return prev.map(m => (m.id === savedMed.id ? savedMed : m));
          }
          return [...prev, savedMed].sort((a, b) => a.name.localeCompare(b.name));
        });
        showToast(`Updated "${savedMed.name}" price to Rs. ${priceNum.toFixed(2)} in database.`);
      } catch {
        showToast('Added to bill, but could not update database price.', 'error');
      } finally {
        setUpdatingPriceInDb(false);
      }
    }

    const lineTotal = priceNum * qtyNum;
    setBillItems(prev => [
      ...prev,
      {
        uid: Date.now() + Math.random(),
        item_type: 'MEDICINE',
        name: cleanName,
        unit_price: priceNum,
        qty: qtyNum,
        line_total: lineTotal
      }
    ]);

    setMedSearchText('');
    setSelectedMedObj(null);
    setMedUnitPrice('');
    setMedQty('1');
  };

  const handleServiceSelectChange = (srvId) => {
    setSelectedServiceId(srvId);
    if (srvId === 'custom') {
      setServiceCustomName('');
      setServiceFeeAmount('');
      return;
    }
    const found = servicesCatalog.find(s => String(s.id) === String(srvId));
    if (found) {
      setServiceFeeAmount(String(found.default_price));
    }
  };

  const handleAddServiceToBill = (e) => {
    if (e) e.preventDefault();
    const feeNum = parseFloat(serviceFeeAmount);
    if (isNaN(feeNum) || feeNum < 0) {
      return showToast('Please enter a valid service fee amount.', 'error');
    }

    let label = 'Consultation / Clinic Fee';
    if (selectedServiceId === 'custom') {
      if (!serviceCustomName.trim()) {
        return showToast('Please type a description for the custom charge.', 'error');
      }
      label = serviceCustomName.trim();
    } else {
      const found = servicesCatalog.find(s => String(s.id) === String(selectedServiceId));
      if (found) label = found.service_name;
    }

    setBillItems(prev => [
      ...prev,
      {
        uid: Date.now() + Math.random(),
        item_type: 'SERVICE',
        name: label,
        unit_price: feeNum,
        qty: null,
        line_total: feeNum
      }
    ]);
  };

  const handleRemoveBillItem = (uid) => {
    setBillItems(prev => prev.filter(item => item.uid !== uid));
  };

  const handleClearPOSCart = () => {
    setBillItems([]);
    setIsManualTotalEdited(false);
    setManualFinalTotal('');
  };

  const calculatedTotal = useMemo(() => {
    return billItems.reduce((sum, item) => sum + (Number(item.line_total) || 0), 0);
  }, [billItems]);

  useEffect(() => {
    if (!isManualTotalEdited) {
      setManualFinalTotal(calculatedTotal > 0 ? String(calculatedTotal.toFixed(2)) : '0.00');
    }
  }, [calculatedTotal, isManualTotalEdited]);

  const handleManualTotalChange = (val) => {
    setIsManualTotalEdited(true);
    setManualFinalTotal(val);
  };

  const handleQuickRoundTotal = (step) => {
    if (calculatedTotal <= 0) return;
    const rounded = Math.round(calculatedTotal / step) * step;
    setIsManualTotalEdited(true);
    setManualFinalTotal(String(rounded.toFixed(2)));
  };

  const openReceiptModalWithData = (billModalObj) => {
    setCompletedBillModal(billModalObj);
    setSmsPhoneInput(billModalObj.patient_phone || '');
    setShowSmsConfirmBox(false);
    setIsEditingSmsPhone(false);
    setSmsSentStatus(null);
  };

  const handleFinalizeCheckout = async (mode = 'COMPLETED_BILL') => {
    const isRegisteredPatient = activePrescriptionCards.length > 0;
    const combinedNames = isRegisteredPatient
      ? activePrescriptionCards.map(c => c.patient.name).join(', ')
      : customWalkInName.trim() || 'Walk-In Patient';

    const primaryPhone = isRegisteredPatient
      ? activePrescriptionCards[0].patient.phone || ''
      : customWalkInPhone.trim();

    const doctorName = isRegisteredPatient
      ? activePrescriptionCards[0].doctor_name
      : 'Wellspring Physician';

    const finalPayable = mode === 'OUTDOOR_RX' && billItems.length === 0
      ? 0
      : parseFloat(manualFinalTotal) || 0;

    setSubmittingCheckout(true);
    try {
      const res = await axios.post(`${API_BASE}/counter/checkout`, {
        ticket_ids: selectedTicketIds,
        patient_names: combinedNames,
        patient_phone: primaryPhone,
        doctor_name: doctorName,
        bill_status: mode,
        calculated_total: calculatedTotal,
        final_total: finalPayable,
        items_snapshot: billItems,
        created_by: loggedInStaff?.name || 'Counter'
      });

      if (mode === 'OUTDOOR_RX') {
        showToast(`Marked ${combinedNames} as Outdoor Medicine & removed from queue.`);
      } else {
        const slNowStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Colombo',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).format(new Date());

        openReceiptModalWithData({
          bill_id: res.data.bill.id,
          daily_bill_no: res.data.bill.daily_bill_no || 1,
          ticket_ids: selectedTicketIds,
          is_walk_in: !isRegisteredPatient,
          date_str: slNowStr,
          patient_names: combinedNames,
          patient_phone: primaryPhone,
          doctor_name: doctorName,
          final_total: finalPayable,
          staff_name: loggedInStaff?.name || 'Counter'
        });
      }

      setBillItems([]);
      setIsManualTotalEdited(false);
      setManualFinalTotal('0.00');
      setCustomWalkInName('');
      setCustomWalkInPhone('');
      setSelectedTicketIds([]);
      await fetchPrescriptions();
      await fetchTodayLog();
    } catch {
      showToast('Failed to complete transaction. Check backend connection.', 'error');
    } finally {
      setSubmittingCheckout(false);
    }
  };

  const handleReprintFromTodayLog = (logRow) => {
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Colombo',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(logRow.created_at));

    const hasTickets = Array.isArray(logRow.ticket_ids) && logRow.ticket_ids.length > 0;

    openReceiptModalWithData({
      bill_id: logRow.id,
      daily_bill_no: logRow.daily_bill_no || logRow.id,
      ticket_ids: logRow.ticket_ids || [],
      is_walk_in: !hasTickets,
      date_str: formattedDate,
      patient_names: logRow.patient_names,
      patient_phone: logRow.patient_phone || '',
      doctor_name: logRow.doctor_name || 'Consulting Physician',
      final_total: logRow.final_total,
      staff_name: logRow.created_by || 'Counter'
    });
  };

  const handleInitiateSmsFlow = () => {
    if (!completedBillModal) return;
    setSmsPhoneInput(completedBillModal.patient_phone || '');
    setShowSmsConfirmBox(true);
    setSmsSentStatus(null);
    if (!completedBillModal.patient_phone) {
      setIsEditingSmsPhone(true);
    } else {
      setIsEditingSmsPhone(false);
    }
  };

  const handleConfirmAndSendSms = async () => {
    if (!completedBillModal) return;
    const cleanPhone = smsPhoneInput.trim();
    if (!cleanPhone) {
      return showToast('Please enter a mobile phone number before sending SMS.', 'error');
    }

    setSendingSms(true);
    try {
      const res = await axios.post(`${API_BASE}/counter/send-sms`, {
        bill_id: completedBillModal.bill_id,
        daily_bill_no: completedBillModal.daily_bill_no,
        ticket_ids: completedBillModal.ticket_ids || [],
        phone: cleanPhone,
        patient_names: completedBillModal.patient_names,
        final_total: completedBillModal.final_total,
        date_str: completedBillModal.date_str
      });

      if (res.data.success === false && res.data.gateway_warning) {
        showToast(res.data.gateway_warning, 'error');
        return;
      }

      setCompletedBillModal(prev => (prev ? { ...prev, patient_phone: cleanPhone } : prev));
      setIsEditingSmsPhone(false);

      setSmsSentStatus({
        phone: cleanPhone,
        savedToProfile: Boolean(res.data.updatedPatientProfile)
      });

      fetchTodayLog();
      showToast(`SMS Receipt sent to ${cleanPhone}!`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send SMS bill.', 'error');
    } finally {
      setSendingSms(false);
    }
  };

  const filteredTodayLog = useMemo(() => {
    const q = todayLogSearch.trim().toLowerCase();
    if (!q) return todayLogList;
    return todayLogList.filter(
      row =>
        (row.patient_names || '').toLowerCase().includes(q) ||
        (row.patient_phone || '').toLowerCase().includes(q) ||
        String(row.daily_bill_no || row.id).includes(q)
    );
  }, [todayLogList, todayLogSearch]);

  const todaySummary = useMemo(() => {
    let paidPatientsCount = 0;
    let outdoorCount = 0;

    todayLogList.forEach(row => {
      if (row.bill_status === 'OUTDOOR_RX') {
        outdoorCount += 1;
      } else {
        paidPatientsCount += 1;
      }
    });

    return { paidPatientsCount, outdoorCount, totalVisits: todayLogList.length };
  }, [todayLogList]);

  return {
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
    medicinesCatalog,
    servicesCatalog,
    medSearchText,
    setMedSearchText,
    selectedMedObj,
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
  };
}