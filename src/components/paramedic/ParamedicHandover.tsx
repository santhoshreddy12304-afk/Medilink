import React, { useState, useEffect } from 'react';
import { 
  Ambulance, ShieldAlert, CheckCircle2, AlertTriangle, 
  Clock, Activity, Globe, Send, UserCheck,
  Navigation, RefreshCw, Radio, Zap
} from 'lucide-react';
import type { LanguageCode, Hospital, TriageLevel, ATMISTData, GeoCoordinates, HospitalRankingResult } from '../../types';
import { fetchHospitals } from '../../services/hospitalService';
import { evaluateTriage } from '../../services/triageEngine';
import { submitParamedicCase, updateCaseDestination } from '../../services/caseService';
import { computeHospitalRoutes } from '../../services/routingService';
import { rankCandidateHospitals, evaluateRerouteThreshold } from '../../services/rankingService';
import { startAmbulanceTracking, stopAmbulanceTracking } from '../../services/geolocationService';

// Trilingual Translations Dictionary (English, Telugu, Hindi)
const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    title: 'Paramedic Emergency Pre-Alert Handover',
    subtitle: 'ATMIST Mobile Protocol (Optimized for 4G)',
    hospitalSelect: 'Select Receiving Emergency Hospital',
    ageLabel: 'Age & Demographics',
    agePlaceholder: 'Age (Years)',
    isMinor: 'Patient is a Minor (<18)',
    unknownIdentity: 'Unidentified / Unconscious Patient (Minimum Data Rule)',
    incidentTime: 'Incident Time',
    etaLabel: 'ETA (Estimate in minutes)',
    mechanismLabel: 'M - Mechanism of Injury / Illness',
    mechanismPlaceholder: 'Describe mechanism (e.g. High speed collision, chest pain)',
    injuriesLabel: 'I - Injuries & Key Symptoms',
    injuriesPlaceholder: 'Describe visible injuries, pain location, or red flags',
    redFlagHeader: 'Quick Red Flag Check (Select all that apply)',
    flagUnresponsive: 'Unresponsive / Low GCS (<13)',
    flagBleeding: 'Severe / Uncontrolled Bleeding',
    flagChestSweat: 'Chest Pain WITH Sweating',
    flagFaceDroop: 'Stroke: Face Droop',
    flagArmWeakness: 'Stroke: Arm / Leg Weakness',
    flagSpeech: 'Stroke: Speech Slurring',
    flagTrauma: 'Major High-Energy Trauma',
    signsLabel: 'S - Vital Signs',
    hrLabel: 'HR (bpm)',
    bpSysLabel: 'BP Sys',
    bpDiaLabel: 'BP Dia',
    spo2Label: 'SpO2 (%)',
    gcsLabel: 'GCS (3-15)',
    respLabel: 'Resp Rate',
    treatmentLabel: 'T - Treatment Given in Transit',
    treatmentPlaceholder: 'Oxygen 4L, IV 18G, Aspirin 300mg, Splint...',
    consentLabel: 'I confirm patient/proxy consent obtained OR emergency minimum data rule applies.',
    submitBtn: 'Calculate Triage & Transmit Handover',
    triageModalTitle: 'Deterministic Triage Result',
    suggestedCategory: 'Engine Suggested Category:',
    triageNotice: 'REQUIRES CLINICIAN REVIEW',
    confirmTriage: 'Confirm Suggested Triage',
    overrideTriage: 'Override Triage Category',
    overrideReasonLabel: 'Mandatory Clinical Override Reason:',
    overridePlaceholder: 'State clinical rationale for overriding engine triage...',
    finalSubmitBtn: 'Transmit Pre-Alert to ED Hospital',
    successTitle: 'Pre-Alert Transmitted Successfully!',
    tokenLabel: 'Secure Token:',
  },
  te: {
    title: 'పారామెడిక్ అత్యవసర ప్రీ-అలర్ట్ సమాచారం',
    subtitle: 'ATMIST మొబైల్ ప్రొటోకాల్ (4G వేగవంతమైనది)',
    hospitalSelect: 'అత్యవసర ఆసుపత్రిని ఎంచుకోండి',
    ageLabel: 'వయస్సు మరియు వివరాలు',
    agePlaceholder: 'వయస్సు (సంవత్సరాలు)',
    isMinor: 'రోగి చిన్నపిల్లవాడు/చిన్నపిల్ల (<18)',
    unknownIdentity: 'గుర్తించబడని / స్పృహ లేని రోగి (కనిష్ట డేటా నియమం)',
    incidentTime: 'ఘటన సమయం',
    etaLabel: 'ETA (అంచనా సమయం నిమిషాల్లో)',
    mechanismLabel: 'M - ప్రమాదం / అనారోగ్య కారణం',
    mechanismPlaceholder: 'ప్రమాద కారణం చెప్పండి (ఉదా: రోడ్డు ప్రమాదం, గుండె నొప్పి)',
    injuriesLabel: 'I - గాయాలు మరియు ముఖ్య లక్షణాలు',
    injuriesPlaceholder: 'గాయాలు, నొప్పిన ప్రదేశం వివరించండి',
    redFlagHeader: 'ముఖ్య అత్యవసర గుర్తులు (ఎంచుకోండి)',
    flagUnresponsive: 'స్పృహ లేకపోవడం / తక్కువ GCS (<13)',
    flagBleeding: 'తీవ్రమైన రక్తం కారడం',
    flagChestSweat: 'చెమటతో కూడిన గుండె నొప్పి',
    flagFaceDroop: 'పక్షవాతం: ముఖం వంగిపోవడం',
    flagArmWeakness: 'పక్షవాతం: చెయ్యి/కాలు బలహీనత',
    flagSpeech: 'పక్షవాతం: మాట నత్తిగా రావడం',
    flagTrauma: 'తీవ్రమైన పెద్ద ప్రమాదం',
    signsLabel: 'S - జీవ సంకేతాలు (Vitals)',
    hrLabel: 'గుండె వేగం (HR)',
    bpSysLabel: 'BP సిస్టోలిక్',
    bpDiaLabel: 'BP డయాస్టోలిక్',
    spo2Label: 'ఆక్సిజన్ (SpO2 %)',
    gcsLabel: 'GCS (3-15)',
    respLabel: 'శ్వాస వేగం',
    treatmentLabel: 'T - అంబులెన్స్‌లో ఇచ్చిన చికిత్స',
    treatmentPlaceholder: 'ఆక్సిజన్, ఐవి సెలైన్, ఆస్పిరిన్, కట్టు...',
    consentLabel: 'రోగి/సంరక్షకుల సమ్మతి పొందా లేదా అత్యవసర నిబంధన వర్తిస్తుంది.',
    submitBtn: 'ట్రయాజ్ లెక్కించి పంపండి',
    triageModalTitle: 'ట్రయాజ్ ఫలితం',
    suggestedCategory: 'సూచించిన వర్గం:',
    triageNotice: 'వైద్యుల సమీక్ష అవసరం',
    confirmTriage: 'ట్రయాజ్ నిర్ధారించండి',
    overrideTriage: 'ట్రయాజ్ మార్చండి (Override)',
    overrideReasonLabel: 'మార్చడానికి తప్పనిసరి కారణం:',
    overridePlaceholder: 'మార్చడానికి వైద్య కారణం రాయండి...',
    finalSubmitBtn: 'ఆసుపత్రికి హెచ్చరిక పంపండి',
    successTitle: 'ప్రీ-అలర్ట్ విజయవంతంగా పంపబడింది!',
    tokenLabel: 'రహస్య టోకెన్:',
  },
  hi: {
    title: 'पैरामेडिक आपातकालीन प्री-अलर्ट हैंडओवर',
    subtitle: 'ATMIST मोबाइल प्रोटोकॉल (4G फास्ट)',
    hospitalSelect: 'अस्पताल का चयन करें',
    ageLabel: 'आयु एवं जनसांख्यिकी',
    agePlaceholder: 'आयु (वर्ष)',
    isMinor: 'मरीज़ नाबालिग है (<18)',
    unknownIdentity: 'अज्ञात / अचेत मरीज़ (न्यूनतम डेटा नियम)',
    incidentTime: 'घटना का समय',
    etaLabel: 'ETA (अनुमानित समय मिनटों में)',
    mechanismLabel: 'M - चोट / बीमारी का कारण',
    mechanismPlaceholder: 'कारण दर्ज करें (जैसे: सड़क दुर्घटना, सीने में दर्द)',
    injuriesLabel: 'I - चोटें और मुख्य लक्षण',
    injuriesPlaceholder: 'दिखाई देने वाली चोटें या लक्षण दर्ज करें',
    redFlagHeader: 'त्वरित रेड फ्लैग जांच (चयन करें)',
    flagUnresponsive: 'अचेत अवस्था / कम GCS (<13)',
    flagBleeding: 'गंभीर / अनियंत्रित रक्तस्राव',
    flagChestSweat: 'पसीने के साथ सीने में दर्द',
    flagFaceDroop: 'लकवा: चेहरा टेढ़ा होना',
    flagArmWeakness: 'लकवा: हाथ/पैर में कमजोरी',
    flagSpeech: 'लकवा: बोलने में कठिनाई',
    flagTrauma: 'गंभीर दुर्घटना (Major Trauma)',
    signsLabel: 'S - विटल्स (Vital Signs)',
    hrLabel: 'हृदय गति (HR)',
    bpSysLabel: 'BP सिस्टोलिक',
    bpDiaLabel: 'BP डायस्टोलिक',
    spo2Label: 'ऑक्सीजन (SpO2 %)',
    gcsLabel: 'GCS (3-15)',
    respLabel: 'श्वसन दर',
    treatmentLabel: 'T - एम्बुलेंस में दिया गया उपचार',
    treatmentPlaceholder: 'ऑक्सीजन, IV लाइन, एस्पिरिन, पट्टी...',
    consentLabel: 'मरीज़/अभिभावक की सहमति प्राप्त या आपातकालीन नियम लागू।',
    submitBtn: 'ट्रियाज की गणना करें और भेजें',
    triageModalTitle: 'ट्रियाज परिणाम',
    suggestedCategory: 'अनुशंसित श्रेणी:',
    triageNotice: 'चिकित्सक की समीक्षा आवश्यक है',
    confirmTriage: 'अनुशंसित ट्रियाज की पुष्टि करें',
    overrideTriage: 'ट्रियाज बदलें (Override)',
    overrideReasonLabel: 'बदलने का अनिवार्य कारण:',
    overridePlaceholder: 'ट्रियाज बदलने का चिकित्सीय कारण लिखें...',
    finalSubmitBtn: 'अस्पताल को अलर्ट भेजें',
    successTitle: 'प्री-अलर्ट सफलतापूर्वक भेजा गया!',
    tokenLabel: 'सुरक्षित टोकन:',
  },
};

export const ParamedicHandover: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>('en');
  const t = translations[lang];

  // Case Token (One-time link access token)
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Generate or extract token from URL query
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      const genToken = `paramedic-token-${Math.random().toString(36).substring(2, 9)}`;
      setToken(genToken);
    }
  }, []);

  // Form State
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');

  // ATMIST Form Fields
  const [age, setAge] = useState<number | ''>('');
  const [ageGroup, setAgeGroup] = useState<'INFANT' | 'CHILD' | 'ADULT' | 'ELDERLY' | 'UNKNOWN'>('ADULT');
  const [isMinor, setIsMinor] = useState(false);
  const [isUnknownIdentity, setIsUnknownIdentity] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState<number>(15);

  const [mechanism, setMechanism] = useState('');
  const [injuries, setInjuries] = useState('');

  // Red Flag Checkboxes
  const [flagUnresponsive, setFlagUnresponsive] = useState(false);
  const [flagBleeding, setFlagBleeding] = useState(false);
  const [flagChestSweat, setFlagChestSweat] = useState(false);
  const [flagFaceDroop, setFlagFaceDroop] = useState(false);
  const [flagArmWeakness, setFlagArmWeakness] = useState(false);
  const [flagSpeech, setFlagSpeech] = useState(false);
  const [flagTrauma, setFlagTrauma] = useState(false);

  // Vital Signs
  const [hr, setHr] = useState<number | ''>('');
  const [bpSys, setBpSys] = useState<number | ''>('');
  const [bpDia, setBpDia] = useState<number | ''>('');
  const [spo2, setSpo2] = useState<number | ''>('');
  const [gcs, setGcs] = useState<number | ''>('');
  const [respRate, setRespRate] = useState<number | ''>('');

  // Treatment Given
  const [treatmentGiven, setTreatmentGiven] = useState('');

  // Consent & Agreement
  const [consentObtained, setConsentObtained] = useState(false);

  // UI Control States
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [triageResult, setTriageResult] = useState<{ category: TriageLevel; triggeredRedFlags: string[]; notice: string } | null>(null);
  const [selectedFinalTriage, setSelectedFinalTriage] = useState<TriageLevel>('YELLOW');
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedCaseToken, setSubmittedCaseToken] = useState<string | null>(null);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);

  // Phase 2: Live Geolocation & Smart Hospital Ranking States
  const [isTrackingGps, setIsTrackingGps] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<GeoCoordinates>({ lat: 17.3916, lng: 78.4720 });
  const [rankedHospitals, setRankedHospitals] = useState<HospitalRankingResult[]>([]);
  const [isComputingRoutes, setIsComputingRoutes] = useState(false);
  const [rerouteSuggestion, setRerouteSuggestion] = useState<{
    shouldSuggest: boolean;
    hospital?: Hospital;
    rationale: string;
    timeSaved: number;
  } | null>(null);
  const [simulateRoutingFailure, setSimulateRoutingFailure] = useState(false);

  useEffect(() => {
    fetchHospitals().then((data) => {
      setHospitals(data);
      if (data.length > 0) setSelectedHospitalId(data[0].id);
    });
  }, []);

  // Compute smart hospital ranking whenever coordinates, hospitals, or clinical presentation changes
  const refreshRankings = async (coords: GeoCoordinates, failureSim = simulateRoutingFailure) => {
    if (hospitals.length === 0) return;
    setIsComputingRoutes(true);

    try {
      const routes = await computeHospitalRoutes(coords, hospitals, {
        caseId: token,
        forceSimulateFailure: failureSim,
      });

      const partialAtmist: Partial<ATMISTData> = {
        mechanism,
        injuries,
        vitalSigns: {
          gcs: typeof gcs === 'number' ? gcs : undefined,
          spo2: typeof spo2 === 'number' ? spo2 : undefined,
        },
      };

      const ranked = rankCandidateHospitals(hospitals, routes, partialAtmist);
      setRankedHospitals(ranked);

      // Auto-update estimated ETA for selected hospital if available
      const currentSelectedRank = ranked.find((r) => r.hospital.id === selectedHospitalId);
      if (currentSelectedRank && currentSelectedRank.route.durationMinutes > 0) {
        setEtaMinutes(currentSelectedRank.route.durationMinutes);
      }

      // Check anti-flapping reroute threshold (every 45s during active case)
      if (selectedHospitalId) {
        const thresholdCheck = evaluateRerouteThreshold(selectedHospitalId, ranked);
        if (thresholdCheck.shouldSuggestReroute && thresholdCheck.suggestedHospital) {
          setRerouteSuggestion({
            shouldSuggest: true,
            hospital: thresholdCheck.suggestedHospital,
            rationale: thresholdCheck.rationale,
            timeSaved: thresholdCheck.timeSavedMinutes,
          });
        } else {
          setRerouteSuggestion(null);
        }
      }
    } finally {
      setIsComputingRoutes(false);
    }
  };

  // Recompute routes when coordinates change or mechanism/injuries updated
  useEffect(() => {
    refreshRankings(currentCoords, simulateRoutingFailure);
  }, [currentCoords, hospitals, simulateRoutingFailure, selectedHospitalId]);

  // Periodic 45-second route recomputation timer
  useEffect(() => {
    const timer = setInterval(() => {
      refreshRankings(currentCoords, simulateRoutingFailure);
    }, 45000);
    return () => clearInterval(timer);
  }, [currentCoords, simulateRoutingFailure, selectedHospitalId, hospitals]);

  // Handle GPS tracking activation
  const toggleGpsTracking = () => {
    if (isTrackingGps) {
      stopAmbulanceTracking(token);
      setIsTrackingGps(false);
    } else {
      setIsTrackingGps(true);
      startAmbulanceTracking(token, token, {
        intervalMs: 12000,
        onLocationUpdate: (newCoords) => {
          setCurrentCoords(newCoords);
        },
      });
    }
  };

  // Handle Paramedic Accepting a Dynamic Reroute Suggestion
  const handleAcceptReroute = async (suggestedHospital: Hospital) => {
    setSelectedHospitalId(suggestedHospital.id);
    setRerouteSuggestion(null);

    if (submittedCaseId) {
      await updateCaseDestination(
        submittedCaseId,
        suggestedHospital.id,
        suggestedHospital.name,
        token,
        `Paramedic accepted dynamic reroute: ${rerouteSuggestion?.rationale || 'Faster ETA and capability match'}`
      );
    }
  };

  // Sync Age Group with numerical age
  const handleAgeChange = (val: number | '') => {
    setAge(val);
    if (typeof val === 'number') {
      if (val < 2) setAgeGroup('INFANT');
      else if (val < 18) {
        setAgeGroup('CHILD');
        setIsMinor(true);
      } else if (val < 65) setAgeGroup('ADULT');
      else setAgeGroup('ELDERLY');
    }
  };

  // Step 1: Open Triage Confirmation Modal
  const handleCalculateTriage = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedHospitalId) {
      setErrorMessage('Please select a receiving hospital.');
      return;
    }
    if (!consentObtained) {
      setErrorMessage('Patient/proxy consent or emergency minimum data rule confirmation is required.');
      return;
    }

    const evalResult = evaluateTriage({
      gcs: typeof gcs === 'number' ? gcs : undefined,
      isUnresponsive: flagUnresponsive || (typeof gcs === 'number' && gcs < 13),
      hasSevereBleeding: flagBleeding,
      hasChestPainWithSweating: flagChestSweat,
      strokeFaceDroop: flagFaceDroop,
      strokeArmWeakness: flagArmWeakness,
      strokeSpeechDifficulty: flagSpeech,
      isMajorTrauma: flagTrauma,
      spo2: typeof spo2 === 'number' ? spo2 : undefined,
      mechanism,
      injuries,
    });

    setTriageResult(evalResult);
    setSelectedFinalTriage(evalResult.category);
    setShowTriageModal(true);
  };

  // Step 2: Final Transmit
  const handleFinalTransmit = async () => {
    if (!triageResult) return;
    setErrorMessage('');

    if (triageResult.category !== selectedFinalTriage && overrideReason.trim().length < 5) {
      setErrorMessage('A mandatory clinical override reason (at least 5 characters) is required when changing triage.');
      return;
    }

    setIsSubmitting(true);

    const atmistData: ATMISTData = {
      age: typeof age === 'number' ? age : undefined,
      ageGroup,
      isMinor,
      isUnknownIdentity,
      incidentTime: new Date().toISOString(),
      etaMinutes,
      mechanism: mechanism || 'Emergency Pre-Alert Handover',
      injuries: injuries || 'Unspecified emergency presentation',
      vitalSigns: {
        hr: typeof hr === 'number' ? hr : undefined,
        bpSys: typeof bpSys === 'number' ? bpSys : undefined,
        bpDia: typeof bpDia === 'number' ? bpDia : undefined,
        spo2: typeof spo2 === 'number' ? spo2 : undefined,
        gcs: typeof gcs === 'number' ? gcs : undefined,
        respRate: typeof respRate === 'number' ? respRate : undefined,
      },
      treatmentGiven: treatmentGiven || 'Basic Life Support / Monitoring',
      consentObtained,
    };

    const res = await submitParamedicCase(
      token,
      selectedHospitalId,
      atmistData,
      selectedFinalTriage,
      triageResult.category !== selectedFinalTriage ? overrideReason : undefined
    );

    setIsSubmitting(false);

    if (res.success && res.caseItem) {
      setShowTriageModal(false);
      setSubmittedCaseToken(res.caseItem.accessToken);
      setSubmittedCaseId(res.caseItem.id);
    } else {
      setErrorMessage(res.error || 'Failed to transmit handover pre-alert.');
    }
  };

  if (submittedCaseToken) {
    return (
      <div className="max-w-xl mx-auto my-8 p-6 bg-white rounded-2xl border-2 border-teal-500 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">{t.successTitle}</h2>
        <p className="text-slate-600 text-sm">
          Emergency Department at receiving hospital has been alerted in real time.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left font-mono text-xs space-y-1">
          <p><strong>{t.tokenLabel}</strong> {submittedCaseToken}</p>
          <p><strong>ETA (Estimate):</strong> {etaMinutes} mins</p>
          <p><strong>Final Triage:</strong> <span className={selectedFinalTriage === 'RED' ? 'text-red-600 font-bold' : 'text-amber-600 font-bold'}>{selectedFinalTriage}</span></p>
        </div>

        <button
          onClick={() => {
            setSubmittedCaseToken(null);
            setToken(`paramedic-token-${Math.random().toString(36).substring(2, 9)}`);
            setMechanism('');
            setInjuries('');
            setTreatmentGiven('');
          }}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow transition"
        >
          Create New Emergency Handover
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* Header with Language Selector */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <Ambulance className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{t.title}</h1>
            <p className="text-xs text-teal-300 font-medium">{t.subtitle}</p>
          </div>
        </div>

        {/* Trilingual Language Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 self-end sm:self-center">
          <Globe className="w-4 h-4 text-slate-400 ml-1.5" />
          {(['en', 'te', 'hi'] as LanguageCode[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                lang === l ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {l === 'en' ? 'English' : l === 'te' ? 'తెలుగు' : 'हिंदी'}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main ATMIST Form */}
      <form onSubmit={handleCalculateTriage} className="space-y-6">
        {/* Phase 2: Live GPS Tracking & Smart Routing Header */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isTrackingGps ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Ambulance GPS: {isTrackingGps ? 'Broadcasting (12s interval)' : 'Standby'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleGpsTracking}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  isTrackingGps
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                {isTrackingGps ? 'Stop Tracking' : 'Start Case GPS'}
              </button>

              <button
                type="button"
                onClick={() => setSimulateRoutingFailure(!simulateRoutingFailure)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                  simulateRoutingFailure
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Toggle route API failure simulation"
              >
                Simulate API Drop: {simulateRoutingFailure ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Coordinates: {currentCoords.lat.toFixed(4)}°N, {currentCoords.lng.toFixed(4)}°E</span>
            {isComputingRoutes ? (
              <span className="text-teal-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Recomputing ETA...
              </span>
            ) : (
              <span className="text-slate-500">Auto-recomputes every 45s</span>
            )}
          </div>
        </div>

        {/* Phase 2: Anti-Flapping Dynamic Reroute Alert Banner */}
        {rerouteSuggestion && rerouteSuggestion.hospital && (
          <div className="bg-amber-950/90 border-2 border-amber-500 text-amber-100 p-4 rounded-2xl shadow-lg space-y-3 animate-pulse">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-amber-300">
                  Reroute Recommendation Available
                </h4>
                <p className="text-xs text-amber-200">
                  {rerouteSuggestion.rationale}
                </p>
                <p className="text-[11px] text-amber-300/80">
                  Meets clinical margin threshold (≥20% and ≥2 min improvement). Tap below to accept.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAcceptReroute(rerouteSuggestion.hospital!)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition"
            >
              Accept Reroute to {rerouteSuggestion.hospital.name} (Save {rerouteSuggestion.timeSaved} mins)
            </button>
          </div>
        )}

        {/* Smart Top 3 Recommended Receiving Hospitals */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-teal-600" />
              Smart Hospital Recommendations (Top Ranked)
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              Capability Fit + Traffic-Aware ETA
            </span>
          </div>

          <div className="space-y-2.5">
            {rankedHospitals.slice(0, 3).map((res, index) => {
              const isSelected = selectedHospitalId === res.hospital.id;
              const isEligible = res.hardFilterPassed;

              return (
                <div
                  key={res.hospital.id}
                  onClick={() => {
                    if (isEligible) {
                      setSelectedHospitalId(res.hospital.id);
                      setEtaMinutes(res.route.durationMinutes);
                    }
                  }}
                  className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 shadow-sm'
                      : isEligible
                      ? 'border-slate-200 hover:border-teal-300 bg-slate-50/50'
                      : 'border-red-200 bg-red-50/40 opacity-70 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                          index === 0 && isEligible ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {index + 1}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{res.hospital.name}</h3>
                        {index === 0 && isEligible && (
                          <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                            BEST FIT
                          </span>
                        )}
                        {!res.route.isLiveTraffic && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300">
                            Live traffic unavailable
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        {res.reasonSummary}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-slate-500 pt-1">
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          {res.hospital.traumaLevel}
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          {res.hospital.icuAvailable} ICU Beds
                        </span>
                        {res.hospital.strokeCenter && (
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                            Stroke Unit
                          </span>
                        )}
                        {res.hospital.cathLabAvailable && (
                          <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                            Cath Lab
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-slate-900">
                        ~{res.route.durationMinutes} min
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {res.route.distanceKm} km (est)
                      </div>
                      {isSelected && (
                        <span className="inline-block mt-1 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fallback Standard Dropdown for other hospitals */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Select Another Hospital from Full Registry:
            </label>
            <select
              value={selectedHospitalId}
              onChange={(e) => {
                setSelectedHospitalId(e.target.value);
                const rank = rankedHospitals.find((r) => r.hospital.id === e.target.value);
                if (rank && rank.route.durationMinutes > 0) {
                  setEtaMinutes(rank.route.durationMinutes);
                }
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-xs"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} — {h.traumaLevel} ({h.isDiverted ? 'DIVERTED' : 'Active'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Demographics & ETA */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-md font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            Patient Profile & ETA (Estimate)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.ageLabel}</label>
              <input
                type="number"
                placeholder={t.agePlaceholder}
                value={age}
                onChange={(e) => handleAgeChange(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                {t.etaLabel}
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={etaMinutes}
                onChange={(e) => setEtaMinutes(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-teal-800"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isMinor}
                onChange={(e) => setIsMinor(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <span>{t.isMinor}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isUnknownIdentity}
                onChange={(e) => setIsUnknownIdentity(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <span>{t.unknownIdentity}</span>
            </label>
          </div>
        </div>

        {/* ATMIST: Mechanism & Injuries */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-md font-bold text-slate-900 border-b border-slate-100 pb-2">
            M & I - Mechanism & Injuries
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.mechanismLabel}</label>
            <textarea
              rows={2}
              placeholder={t.mechanismPlaceholder}
              value={mechanism}
              onChange={(e) => setMechanism(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.injuriesLabel}</label>
            <textarea
              rows={2}
              placeholder={t.injuriesPlaceholder}
              value={injuries}
              onChange={(e) => setInjuries(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
            />
          </div>

          {/* Quick Red Flag Checkboxes */}
          <div className="bg-red-50/60 p-4 rounded-xl border border-red-200/60 space-y-2">
            <span className="block text-xs font-extrabold text-red-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              {t.redFlagHeader}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-red-950 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagUnresponsive}
                  onChange={(e) => setFlagUnresponsive(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                />
                <span className="font-medium">{t.flagUnresponsive}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagBleeding}
                  onChange={(e) => setFlagBleeding(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                />
                <span className="font-medium">{t.flagBleeding}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagChestSweat}
                  onChange={(e) => setFlagChestSweat(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                />
                <span className="font-medium">{t.flagChestSweat}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagFaceDroop}
                  onChange={(e) => setFlagFaceDroop(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                />
                <span className="font-medium">{t.flagFaceDroop}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagArmWeakness}
                  onChange={(e) => setFlagArmWeakness(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                />
                <span className="font-medium">{t.flagArmWeakness}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagSpeech}
                  onChange={(e) => setFlagSpeech(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                />
                <span className="font-medium">{t.flagSpeech}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  checked={flagTrauma}
                  onChange={(e) => setFlagTrauma(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                />
                <span className="font-medium">{t.flagTrauma}</span>
              </label>
            </div>
          </div>
        </div>

        {/* ATMIST: Signs (Vitals) & Treatment */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-md font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            S & T - Vital Signs & Treatment Administered
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{t.hrLabel}</label>
              <input
                type="number"
                placeholder="bpm"
                value={hr}
                onChange={(e) => setHr(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{t.bpSysLabel}</label>
              <input
                type="number"
                placeholder="mmHg"
                value={bpSys}
                onChange={(e) => setBpSys(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{t.bpDiaLabel}</label>
              <input
                type="number"
                placeholder="mmHg"
                value={bpDia}
                onChange={(e) => setBpDia(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{t.spo2Label}</label>
              <input
                type="number"
                placeholder="%"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{t.gcsLabel}</label>
              <input
                type="number"
                min={3}
                max={15}
                placeholder="3-15"
                value={gcs}
                onChange={(e) => setGcs(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{t.respLabel}</label>
              <input
                type="number"
                placeholder="bpm"
                value={respRate}
                onChange={(e) => setRespRate(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.treatmentLabel}</label>
            <textarea
              rows={2}
              placeholder={t.treatmentPlaceholder}
              value={treatmentGiven}
              onChange={(e) => setTreatmentGiven(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
            />
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentObtained}
              onChange={(e) => setConsentObtained(e.target.checked)}
              className="w-5 h-5 text-teal-600 rounded border-teal-400 focus:ring-teal-500 mt-0.5 shrink-0"
            />
            <span className="text-xs text-teal-950 font-semibold leading-relaxed">
              {t.consentLabel}
            </span>
          </label>
        </div>

        {/* Big Touch-Friendly Action Button */}
        <button
          type="submit"
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-teal-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          <span>{t.submitBtn}</span>
        </button>
      </form>

      {/* Deterministic Triage & Override Confirmation Modal */}
      {showTriageModal && triageResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900">{t.triageModalTitle}</h3>
              <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300">
                {t.triageNotice}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase">{t.suggestedCategory}</p>

              <div
                className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                  triageResult.category === 'RED'
                    ? 'bg-red-50 border-red-500 text-red-950'
                    : 'bg-amber-50 border-amber-500 text-amber-950'
                }`}
              >
                <div>
                  <span className={`text-2xl font-black ${triageResult.category === 'RED' ? 'text-red-600' : 'text-amber-600'}`}>
                    {triageResult.category} TRIAGE
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    {triageResult.triggeredRedFlags.length > 0
                      ? `Triggered by: ${triageResult.triggeredRedFlags.join(', ')}`
                      : 'No generic red flags detected. Priority: Urgent.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Confirm or Override Selector */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700">Paramedic Final Triage Confirmation:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFinalTriage('RED')}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition ${
                    selectedFinalTriage === 'RED'
                      ? 'bg-red-600 text-white border-red-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-red-50'
                  }`}
                >
                  RED (Critical)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFinalTriage('YELLOW')}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition ${
                    selectedFinalTriage === 'YELLOW'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  YELLOW (Urgent)
                </button>
              </div>

              {/* Mandatory Override Reason when overriding */}
              {triageResult.category !== selectedFinalTriage && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-300 space-y-2">
                  <label className="block text-xs font-extrabold text-amber-950">{t.overrideReasonLabel}</label>
                  <textarea
                    rows={2}
                    placeholder={t.overridePlaceholder}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs font-medium text-slate-900"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowTriageModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
              >
                Back to Edit
              </button>

              <button
                type="button"
                onClick={handleFinalTransmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Transmitting...' : t.finalSubmitBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
