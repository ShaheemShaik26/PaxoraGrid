/**
 * PaxoraGrid - National Healthcare Multilingual Translation Engine
 * Supports 12 Major Languages spoken across India:
 * English, Hindi, Malayalam, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Odia, Punjabi, Assamese
 */

export type SupportedLanguage = 
  | 'en' 
  | 'hi' 
  | 'ml' 
  | 'ta' 
  | 'te' 
  | 'kn' 
  | 'bn' 
  | 'mr' 
  | 'gu' 
  | 'or' 
  | 'pa' 
  | 'as';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'National / Official' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'North / Central India' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala / Lakshadweep' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu / Puducherry' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra Pradesh / Telangana' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal / Tripura' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra / Goa' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat / DNH & DD' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjab / Chandigarh' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam / Northeast' }
];

export interface TranslationDictionary {
  [key: string]: string;
}

const baseEnglish: TranslationDictionary = {
  // Brand & Header
  appName: 'PaxoraGrid',
  appTagline: "National Health Supply Grid & Outbreak Early-Warning System",
  nhmTitle: 'National Health Authority',
  abdmAligned: 'Ayushman Bharat Digital Health Grid',
  dpdpCompliant: 'DPDP Act 2023 Compliant • Federated Core',
  offlineMode: 'Offline Mode',
  liveSync: 'Live e-Aushadhi Sync',
  runDemoBtn: 'Simulate Surge',
  stateAll: 'All India (36 States & UTs)',

  // Navigation Tabs
  tabTacticalCommand: 'Command Center',
  tabFederatedGrid: 'Federated Grid',
  tabFieldLogger: 'Field Terminal',
  tabStorylineDemo: 'Surge Protocols',

  // KPIs
  kpiCriticalStockouts: 'Critical Stock-Outs',
  kpiCriticalSub: 'Facilities requiring immediate supply',
  kpiTransfersAwaiting: 'Pending Transfers',
  kpiTransfersSub: 'Awaiting Administrator Authorization',
  kpiPatientsProtected: 'Patients Protected',
  kpiPatientsSub: 'Prevented acute medicine stock-outs',
  kpiExpirySaved: 'Saved via FEFO',
  kpiExpirySub: 'Redistributed prior to batch expiry',
  kpiLeadTime: 'Early Warning Horizon',
  kpiLeadTimeSub: 'Preparation runway before surge peak',

  // GIS Map & Spatial
  gisTitle: 'National Health Facility Spatial Grid',
  facilitiesActive: 'Active Facilities',
  legendRisk7d: 'Critical (<7 Days Cover)',
  legendModerate: 'Moderate (8-14 Days)',
  legendNormal: 'Sufficient (>14 Days)',
  legendSurplus: 'Surplus Warehouse Hub',
  legendTransferArc: 'Transfer Conduits',

  // Redistribution
  transfersPlanTitle: 'Stock Balancing & Redistribution Directives',
  transfersPlanDesc: 'Automated FEFO-prioritized batch transfers to prevent imminent facility stock-outs',
  actionablePending: 'Actionable Pending',
  allTransfersBalanced: 'All supply lines balanced across active clusters',
  noShortagesRemain: 'No critical shortages detected in selected jurisdiction.',
  donorFacility: 'Donor Facility',
  recipientFacility: 'Recipient Facility',
  fefoMatch: 'FEFO Shelf Life Remaining',
  coldChain: 'Cold Chain Required (2°C - 8°C)',
  viewPass: 'View Gate Pass',
  rejectBtn: 'Decline',
  approveBtn: 'Authorize Transfer',
  paxoraProof: 'Algorithmic Optimization Proof',

  // Early Warning Table
  earlyWarningTitle: 'Essential Medicine Supply Monitor',
  earlyWarningDesc: 'Real-time days-of-cover, daily burn rates, and outbreak vulnerability per facility',
  searchPlaceholder: 'Filter facility, drug, or district...',
  allDrugs: 'All Essential Medicines',
  allRiskLevels: 'All Status Levels',
  riskCritical: 'Critical (<7 Days)',
  riskWarning: 'Warning (8-14 Days)',
  riskHealthy: 'Healthy (>14 Days)',
  riskSurplus: 'Surplus (>28 Days)',
  thFacility: 'Health Facility',
  thDrugItem: 'Medicine & Specification',
  thCurrentStock: 'In Stock',
  thDailyBurn: 'Daily Burn',
  thDaysOfCover: 'Days of Cover',
  thRisk: 'Status',
  thStatusForecast: 'Surge Forecast',
  daysUnit: 'Days',
  surgePlus: 'Surge',

  // 60-Second Logger
  loggerTitle: 'Facility Daily Reporting Terminal',
  bedOccupancyTitle: 'Bed Utilization',
  bedMax: 'Max Capacity',
  bedSanctioned: 'Operational Beds Occupied',
  surgeWardActive: 'Emergency Surge Ward Active',
  staffTitle: 'Staff on Duty & Verification',
  gpsVerified: 'GPS Geofenced',
  staffDutyPresent: 'Staff Present on Shift',
  simulateSelfieBtn: 'Verify Biometric Attendance',
  fastCounterTitle: 'Essential Drug Count',
  fastCounterDesc: 'Quick-adjust ledger stock or scan medicine carton barcode',
  ocrBtn: 'Gemini Vision Document Scanner',
  scanBtn: 'Scan',
  targetTime: 'Target Submission: <60s',
  submitLedgerBtn: 'Submit Facility Status',
  smsGatewayTitle: 'SMS & WhatsApp Gateway',
  smsGatewayDesc: 'Offline low-bandwidth transmission channel for remote Sub-Centres',
  clickSampleMsg: 'Quick fill test message:',
  typeOrSpeak: 'Type or speak report (e.g. Paracetamol 400, ORS 100, Beds 8/10)...',
  voiceBtn: 'Voice Input',
  listenBtn: 'Audio Playback',

  // Federated Learning
  flHeroBadge: 'Federated Architecture • Zero Raw Patient Data Leaves the State',
  flHeroTitle: 'Privacy-Preserving Federated Intelligence Grid',
  flHeroDesc: 'DPDP Act 2023 compliant model exchange: each state retains sovereign data ownership, exchanging only encrypted weight updates (ΔW).',
  executeFlBtn: 'Execute Federated Aggregation Round',
  tabTopology: 'Topology & State Nodes',
  tabCrossState: 'Inter-State Knowledge Transfer',
  tabBenchmark: 'Model Accuracy & WAPE Benchmarks',
  nationalAggregatorTitle: 'National Orchestrator',
  mohfwFedAvgServer: 'National FedAvg Central Aggregator',
  nodeInspection: 'State Node Telemetry',
  rawHealthShared: 'Raw Data Transferred: 0 Bytes (Zero-Knowledge)',

  // Storyline / Surge Protocols
  demoHeroBadge: 'National Health Surge & Protocol Simulation',
  demoHeroTitle: 'Vector Outbreak Detection & Automated Stock Balancing Drill',
  demoHeroDesc: 'Simulate IDSP health emergency outbreak alerts, early-warning triggers, automated FEFO matching, and administrative authorization.',
  resetScenario: 'Reset Protocol State',
  step1Title: '1. Baseline Grid',
  step1Desc: 'Steady-state consumption patterns',
  step2Title: '2. Surge Emergence',
  step2Desc: 'Epidemic incidence and emergency clinical surge',
  step3Title: '3. Early Warning',
  step3Desc: 'Federated advance prediction generated',
  step4Title: '4. Stock Balanced',
  step4Desc: 'FEFO stock transfer dispatched',
  injectOutbreakBtn: 'Simulate: Inject Outbreak Demand Spike',
  activateInferenceBtn: 'Activate Predictive Inference',
  oneTapDhoBtn: 'Authorize Recommended Transfers',
  step4Success: 'Stock-out Averted Successfully',

  // Auth & Admin
  adminPortalTitle: 'National Health Authority Admin Portal',
  adminPortalSub: 'Ayushman Bharat Digital Health Grid • Verified Officer Sign-In',
  signInGoogle: 'Sign In with Google (Admin SSO)',
  enterDemoOfficer: 'Enter as Demo Health Administrator',
  officerRole: 'District Medical Officer (DMO / DHO)',
  adminStatus: 'Authenticated Admin',
  signOut: 'Sign Out'
};

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: baseEnglish,

  hi: {
    ...baseEnglish,
    appName: 'पैक्सोराग्रिड',
    appTagline: 'राष्ट्रीय स्वास्थ्य आपूर्ति ग्रिड एवं महामारी पूर्व-चेतावनी प्रणाली',
    nhmTitle: 'राष्ट्रीय स्वास्थ्य प्राधिकरण',
    abdmAligned: 'आयुष्मान भारत डिजिटल स्वास्थ्य ग्रिड',
    runDemoBtn: 'प्रकोप सिमुलेशन',
    stateAll: 'संपूर्ण भारत (36 राज्य एवं केंद्र शासित प्रदेश)',
    tabTacticalCommand: 'कमांड सेंटर',
    tabFederatedGrid: 'फेडरेटेड ग्रिड',
    tabFieldLogger: 'फील्ड टर्मिनल',
    tabStorylineDemo: 'प्रकोप प्रोटोकॉल',
    kpiCriticalStockouts: 'गंभीर दवा संकट',
    kpiCriticalSub: 'तत्काल आपूर्ति की आवश्यकता वाले केंद्र',
    kpiTransfersAwaiting: 'स्वीकृति हेतु लंबित ट्रांसफर',
    kpiTransfersSub: 'अधिकारी हस्ताक्षर हेतु तैयार',
    kpiPatientsProtected: 'सुरक्षित मरीज',
    kpiPatientsSub: 'दवा संकट से बचाए गए',
    kpiExpirySaved: 'FEFO द्वारा सुरक्षित मूल्य',
    kpiExpirySub: 'समाप्ति पूर्व पुनर्वितरित स्टॉक',
    kpiLeadTime: 'पूर्व-चेतावनी अवधि',
    kpiLeadTimeSub: 'प्रकोप चरम से पहले तैयारी समय',
    gisTitle: 'राष्ट्रीय स्वास्थ्य सुविधा स्थानिक ग्रिड',
    facilitiesActive: 'सक्रिय स्वास्थ्य केंद्र',
    transfersPlanTitle: 'स्टॉक संतुलन एवं पुनर्वितरण निर्देश',
    transfersPlanDesc: 'संकट से पहले दवाओं का स्वचालित FEFO-प्राथमिकता आधारित ट्रांसफर',
    approveBtn: 'ट्रांसफर अधिकृत करें',
    rejectBtn: 'अस्वीकार करें',
    earlyWarningTitle: 'आवश्यक दवा आपूर्ति निगरानी',
    searchPlaceholder: 'केंद्र, दवा या जिला खोजें...',
    adminPortalTitle: 'राष्ट्रीय स्वास्थ्य प्राधिकरण एडमिन पोर्टल',
    adminPortalSub: 'आयुष्मान भारत डिजिटल हेल्थ ग्रिड • अधिकृत अधिकारी लॉगिन',
    signInGoogle: 'गूगल से लॉगिन करें (एडमिन SSO)',
    enterDemoOfficer: 'डेमो स्वास्थ्य प्रशासक के रूप में प्रवेश करें',
    officerRole: 'जिला चिकित्सा अधिकारी (DMO / DHO)',
    adminStatus: 'प्रमाणित एडमिन',
    signOut: 'लॉग आउट'
  },

  ml: {
    ...baseEnglish,
    appName: 'പാക്സോറഗ്രിഡ്',
    appTagline: 'ദേശീയ ആരോഗ്യ വിതരണ ശൃംഖല & പകർച്ചവ്യാധി മുൻകൂർ മുന്നറിയിപ്പ്',
    nhmTitle: 'നാഷണൽ ഹെൽത്ത് അതോറിറ്റി',
    abdmAligned: 'ആയുഷ്മാൻ ഭാരത് ഡിജിറ്റൽ ഹെൽത്ത് ഗ്രിഡ്',
    runDemoBtn: 'സർജ് സിമുലേഷൻ',
    stateAll: 'ഇന്ത്യയൊട്ടാകെ (36 സംസ്ഥാനങ്ങളും കേന്ദ്രഭരണ പ്രദേശങ്ങളും)',
    tabTacticalCommand: 'കമാൻഡ് സെന്റർ',
    tabFederatedGrid: 'ഫെഡറേറ്റഡ് ഗ്രിഡ്',
    tabFieldLogger: 'ഫീൽഡ് ടെർമിനൽ',
    tabStorylineDemo: 'സർജ് പ്രോട്ടോക്കോൾ',
    kpiCriticalStockouts: 'അടിയന്തര മരുന്ന് ക്ഷാമം',
    kpiCriticalSub: 'ഉടൻ മരുന്ന് എത്തിക്കേണ്ട ആരോഗ്യ കേന്ദ്രങ്ങൾ',
    kpiTransfersAwaiting: 'അംഗീകാരത്തിനായുള്ളവ',
    kpiTransfersSub: 'മെഡിക്കൽ ഓഫീസറുടെ അനുമതിക്കായി',
    kpiPatientsProtected: 'സംരക്ഷിക്കപ്പെട്ട രോഗികൾ',
    kpiPatientsSub: 'മരുന്ന് ലഭ്യത ഉറപ്പാക്കി',
    kpiExpirySaved: 'പാഴാകാതെ സംരക്ഷിച്ചത്',
    kpiExpirySub: 'കാലാവധിക്ക് മുൻപ് പുനർവിതരണം ചെയ്തു',
    kpiLeadTime: 'മുന്നറിയിപ്പ് സമയം',
    gisTitle: 'ദേശീയ ആരോഗ്യ കേന്ദ്ര മാപ്പ് ശൃംഖല',
    facilitiesActive: 'സജീവ ആരോഗ്യ കേന്ദ്രങ്ങൾ',
    transfersPlanTitle: 'മരുന്ന് പുനർവിതരണ നിർദ്ദേശങ്ങൾ',
    approveBtn: 'കൈമാറ്റം അംഗീകരിക്കുക',
    rejectBtn: 'നിരസിക്കുക',
    earlyWarningTitle: 'അവശ്യ മരുന്ന് ലഭ്യത നിരീക്ഷണം',
    adminPortalTitle: 'നാഷണൽ ഹെൽത്ത് അതോറിറ്റി അഡ്മിൻ പോർട്ടൽ',
    adminPortalSub: 'ആയുഷ്മാൻ ഭാരത് ഡിജിറ്റൽ ഹെൽത്ത് ഗ്രിഡ് • ഉദ്യോഗസ്ഥ ലോഗിൻ',
    signInGoogle: 'ഗൂഗിൾ വഴി ലോഗിൻ ചെയ്യുക (അഡ്മിൻ)',
    enterDemoOfficer: 'ഡെമോ അഡ്മിനിസ്ട്രേറ്ററായി പ്രവേശിക്കുക',
    officerRole: 'ഡിസ്ട്രിക്ട് മെഡിക്കൽ ഓഫീസർ (DMO)',
    adminStatus: 'അംഗീകൃത അഡ്മിൻ',
    signOut: 'ലോഗ് ഔട്ട്'
  },

  ta: {
    ...baseEnglish,
    appName: 'பாக்சோராகிரிட்',
    appTagline: 'தேசிய சுகாதார விநியோக கட்டமைப்பு மற்றும் தொற்றுநோய் முன்னெச்சரிக்கை அமைப்பு',
    nhmTitle: 'தேசிய சுகாதார ஆணையம்',
    abdmAligned: 'ஆயுஷ்மான் பாரத் டிஜிட்டல் சுகாதார கட்டமைப்பு',
    runDemoBtn: 'தொற்றுநோய் மாதிரி பயிற்சி',
    stateAll: 'அனைத்து இந்தியா (36 மாநிலங்கள் & யூனியன் பிரதேசங்கள்)',
    tabTacticalCommand: 'கட்டுப்பாட்டு மையம்',
    tabFederatedGrid: 'கூட்டமைப்பு கட்டமைப்பு',
    tabFieldLogger: 'கள முனையம்',
    tabStorylineDemo: 'தொற்றுநெறிமுறைகள்',
    kpiCriticalStockouts: 'மருந்து பற்றாக்குறை',
    kpiCriticalSub: 'உடனடி மருந்து தேவைப்படும் நிலையங்கள்',
    kpiTransfersAwaiting: 'ஒப்புதலுக்குக் காத்திருப்பவை',
    kpiTransfersSub: 'அதிகாரப்பூர்வ கையொப்பத்திற்கு தயார்',
    kpiPatientsProtected: 'பாதுகாக்கப்பட்ட நோயாளிகள்',
    kpiExpirySaved: 'FEFO மூலம் சேமிக்கப்பட்டது',
    kpiLeadTime: 'முன்னெச்சரிக்கை காலம்',
    gisTitle: 'தேசிய சுகாதார வசதிகள் வரைபடம்',
    facilitiesActive: 'செயலில் உள்ள நிலையங்கள்',
    transfersPlanTitle: 'மருந்து மறுவிநியோக உத்தரவுகள்',
    approveBtn: 'பரிமாற்றத்தை அங்கீகரிக்கவும்',
    rejectBtn: 'நிராகரி',
    earlyWarningTitle: 'அத்தியாவசிய மருந்து கண்காணிப்பு',
    adminPortalTitle: 'தேசிய சுகாதார ஆணைய நிர்வாக போர்ட்டல்',
    signInGoogle: 'கூகிள் மூலம் உள்நுழைக (நிர்வாகம்)',
    enterDemoOfficer: 'டெமோ அதிகாரியாக உள்நுழையவும்',
    officerRole: 'மாவட்ட மருத்துவ அலுவலர் (DMO)',
    adminStatus: 'அங்கீகரிக்கப்பட்ட நிர்வாகி',
    signOut: 'வெளியேறு'
  },

  te: {
    ...baseEnglish,
    appName: 'పాక్సోరాగ్రిడ్',
    appTagline: 'జాతీయ ఆరోగ్య సరఫరా గ్రిడ్ & వ్యాధి వ్యాప్తి ముందస్తు హెచ్చరిక వ్యవస్థ',
    nhmTitle: 'జాతీయ ఆరోగ్య అథారిటీ',
    abdmAligned: 'ఆయుష్మాన్ భారత్ డిజిటల్ హెల్త్ గ్రిడ్',
    runDemoBtn: 'వ్యాప్తి అనుకరణ',
    stateAll: 'భారతదేశం మొత్తం (36 రాష్ట్రాలు & కేంద్రపాలిత ప్రాంతాలు)',
    tabTacticalCommand: 'కమాండ్ సెంటర్',
    tabFederatedGrid: 'ఫెడరేటెడ్ గ్రిడ్',
    tabFieldLogger: 'ఫీల్డ్ టెర్మినల్',
    tabStorylineDemo: 'సర్జ్ ప్రోటోకాల్స్',
    kpiCriticalStockouts: 'తీవ్ర ఔషధ కొరత',
    kpiTransfersAwaiting: 'ఆమోదం కోసం పెండింగ్‌లో ఉన్నాయి',
    kpiPatientsProtected: 'రక్షించబడిన రోగులు',
    kpiExpirySaved: 'గడువు ముగియకుండా ఆదా',
    kpiLeadTime: 'ముందస్తు హెచ్చరిక సమయం',
    gisTitle: 'జాతీయ ఆరోగ్య కేంద్రాల మ్యాప్',
    transfersPlanTitle: 'ఔషధ పునర్విభజన ఆదేశాలు',
    approveBtn: 'బదిలీని ఆమోదించండి',
    rejectBtn: 'తిరస్కరించు',
    earlyWarningTitle: 'అవసరమైన మందుల పర్యవేక్షణ',
    adminPortalTitle: 'జాతీయ ఆరోగ్య అథారిటీ అడ్మిన్ పోర్టల్',
    signInGoogle: 'గూగుల్ ద్వారా లాగిన్ అవ్వండి (అడ్మిన్)',
    enterDemoOfficer: 'డెమో అడ్మినిస్ట్రేటర్‌గా ప్రవేశించండి',
    officerRole: 'జిల్లా వైద్యాధికారి (DMO)',
    adminStatus: 'ధృవీకరించబడిన అడ్మిన్',
    signOut: 'లాగ్ అవుట్'
  },

  kn: {
    ...baseEnglish,
    appName: 'ಪಾಕ್ಸೋರಾಗ್ರಿಡ್',
    appTagline: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಸರಬರಾಜು ಜಾಲ ಮತ್ತು ರೋಗ ಮುನ್ಸೂಚನೆ ವ್ಯವಸ್ಥೆ',
    nhmTitle: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಪ್ರಾಧಿಕಾರ',
    abdmAligned: 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಡಿಜಿಟಲ್ ಹೆಲ್ತ್ ಗ್ರಿಡ್',
    stateAll: 'ಸಮಗ್ರ ಭಾರತ (36 ರಾಜ್ಯಗಳು ಮತ್ತು ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶಗಳು)',
    tabTacticalCommand: 'ಕಮಾಂಡ್ ಕೇಂದ್ರ',
    tabFederatedGrid: 'ಫೆಡರೇಟೆಡ್ ಗ್ರಿಡ್',
    tabFieldLogger: 'ಕ್ಷೇತ್ರ ಟರ್ಮಿನಲ್',
    tabStorylineDemo: 'ರೋಗ ನಿಯಂತ್ರಣ ಪ್ರೋಟೋಕಾಲ್',
    kpiCriticalStockouts: 'ತುರ್ತು ಔಷಧ ಕೊರತೆ',
    kpiTransfersAwaiting: 'ಅನುಮೋದನೆ ಬಾಕಿ',
    kpiPatientsProtected: 'ರಕ್ಷಿಸಲ್ಪಟ್ಟ ರೋಗಿಗಳು',
    kpiExpirySaved: 'ಅವಧಿ ಮುಗಿಯುವ ಮುನ್ನ ಉಳಿತಾಯ',
    transfersPlanTitle: 'ಔಷಧ ಮರುವಿತರಣೆ ನಿರ್ದೇಶನಗಳು',
    approveBtn: 'ವರ್ಗಾವಣೆಯನ್ನು ಅನುಮೋದಿಸಿ',
    rejectBtn: 'ತಿರಸ್ಕರಿಸಿ',
    adminPortalTitle: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಪ್ರಾಧಿಕಾರ ಅಡ್ಮಿನ್ ಪೋರ್ಟಲ್',
    signInGoogle: 'ಗೂಗಲ್ ಮೂಲಕ ಲಾಗಿನ್ ಆಗಿ (ಅಡ್ಮಿನ್)',
    enterDemoOfficer: 'ಡೆಮೊ ಅಡ್ಮಿನಿಸ್ಟ್ರೇಟರ್ ಆಗಿ ಪ್ರವೇಶಿಸಿ',
    officerRole: 'ಜಿಲ್ಲಾ ವೈದ್ಯಾಧಿಕಾರಿ (DMO)',
    adminStatus: 'ದೃಢೀಕೃತ ಅಡ್ಮಿನ್',
    signOut: 'ಲಾಗ್ ಔಟ್'
  },

  bn: {
    ...baseEnglish,
    appName: 'প্যাক্সোরাগ্রিড',
    appTagline: 'জাতীয় স্বাস্থ্য সরবরাহ গ্রিড ও মহামারী পূর্বাভাস ব্যবস্থা',
    nhmTitle: 'জাতীয় স্বাস্থ্য কর্তৃপক্ষ',
    abdmAligned: 'আয়ুষ্মান ভারত ডিজিটাল হেলথ গ্রিড',
    stateAll: 'সমগ্র ভারত (৩৬টি রাজ্য ও কেন্দ্রশাসিত অঞ্চল)',
    tabTacticalCommand: 'কমান্ড সেন্টার',
    tabFederatedGrid: 'ফেডারেটেড গ্রিড',
    tabFieldLogger: 'ফিল্ড টার্মিনাল',
    tabStorylineDemo: 'মহামারী প্রোটোকল',
    kpiCriticalStockouts: 'জরুরী ওষুধের সংকট',
    kpiTransfersAwaiting: 'অনুমোদনের অপেক্ষায়',
    kpiPatientsProtected: 'সুরক্ষিত রোগী সংখ্যা',
    kpiExpirySaved: 'মেয়াদোত্তীর্ণের পূর্বে পুনর্বিতরিত',
    transfersPlanTitle: 'ওষুধ পুনর্বণ্টন নির্দেশিকা',
    approveBtn: 'অনুমোদন করুন',
    rejectBtn: 'বাতিল করুন',
    adminPortalTitle: 'জাতীয় স্বাস্থ্য কর্তৃপক্ষ অ্যাডমিন পোর্টাল',
    signInGoogle: 'গুগল দিয়ে সাইন ইন করুন (অ্যাডমিন)',
    enterDemoOfficer: 'ডেমো অ্যাডমিনিস্ট্রেটর হিসেবে প্রবেশ করুন',
    officerRole: 'জেলা স্বাস্থ্য আধিকারিক (DMO)',
    adminStatus: 'যাচাইকৃত অ্যাডমিন',
    signOut: 'লগ আউট'
  },

  mr: {
    ...baseEnglish,
    appName: 'पॅक्सोराग्रिड',
    appTagline: 'राष्ट्रीय आरोग्य पुरवठा नेटवर्क आणि साथीच्या रोगांची पूर्वसूचना प्रणाली',
    nhmTitle: 'राष्ट्रीय आरोग्य प्राधिकरण',
    abdmAligned: 'आयुष्मान भारत डिजिटल हेल्थ ग्रिड',
    stateAll: 'संपूर्ण भारत (३६ राज्ये व केंद्रशासित प्रदेश)',
    tabTacticalCommand: 'कमांड सेंटर',
    tabFederatedGrid: 'फेडरेटेड ग्रिड',
    tabFieldLogger: 'फील्ड टर्मिनल',
    tabStorylineDemo: 'रोगप्रसार प्रोटोकॉल',
    kpiCriticalStockouts: 'गंभीर औषध तुटवडा',
    kpiTransfersAwaiting: 'मंजुरीसाठी प्रलंबित ट्रान्सफर',
    kpiPatientsProtected: 'संरक्षित रुग्ण संख्या',
    kpiExpirySaved: 'कालबाह्यतेपूर्वी वाचवलेले औषध साठे',
    transfersPlanTitle: 'औषध पुनर्वितरण योजना',
    approveBtn: 'मंजूर करा',
    rejectBtn: 'नाकारा',
    adminPortalTitle: 'राष्ट्रीय आरोग्य प्राधिकरण ॲडमिन पोर्टल',
    signInGoogle: 'गुगलने लॉगिन करा (ॲडमिन)',
    enterDemoOfficer: 'डेमो ॲडमिनिस्ट्रेटर म्हणून प्रवेश करा',
    officerRole: 'जिल्हा आरोग्य अधिकारी (DHO / DMO)',
    adminStatus: 'प्रमाणित ॲडमिन',
    signOut: 'लॉग आउट'
  },

  gu: {
    ...baseEnglish,
    appName: 'પેક્સોરાગ્રીડ',
    appTagline: 'રાષ્ટ્રીય આરોગ્ય પુરવઠા ગ્રીડ અને રોગચાળા પૂર્વ ચેતવણી પ્રણાલી',
    nhmTitle: 'રાષ્ટ્રીય આરોગ્ય સત્તામંડળ',
    abdmAligned: 'આયુષ્માન ભારત ડિજિટલ હેલ્થ ગ્રીડ',
    stateAll: 'સમગ્ર ભારત (૩૬ રાજ્યો અને કેન્દ્રશાસિત પ્રદેશો)',
    tabTacticalCommand: 'કમાન્ડ સેન્ટર',
    tabFederatedGrid: 'ફેડરેટેડ ગ્રીડ',
    tabFieldLogger: 'ફીલ્ડ ટર્મિનલ',
    tabStorylineDemo: 'રોગચાળા પ્રોટોકોલ',
    kpiCriticalStockouts: 'ગંભીર દવાઓની અછત',
    kpiTransfersAwaiting: 'મંજૂરી માટે બાકી ટ્રાન્સફર',
    kpiPatientsProtected: 'સુરક્ષિત દર્દીઓ',
    transfersPlanTitle: 'દવા પુનર્વિતરણ નિર્દેશો',
    approveBtn: 'ટ્રાન્સફર મંજૂર કરો',
    rejectBtn: 'અસ્વીકાર કરો',
    adminPortalTitle: 'રાષ્ટ્રીય આરોગ્ય સત્તામંડળ એડમિન પોર્ટલ',
    signInGoogle: 'ગૂગલ સાથે સાઇન ઇન કરો (એડમિન)',
    enterDemoOfficer: 'ડેમો હેલ્થ એડમિનિસ્ટ્રેટર તરીકે પ્રવેશ કરો',
    officerRole: 'જિલ્લા આરોગ્ય અધિકારી (DHO)',
    adminStatus: 'પ્રમાણિત એડમિન',
    signOut: 'સાઇન આઉટ'
  },

  or: {
    ...baseEnglish,
    appName: 'ପାକ୍ସୋରାଗ୍ରିଡ୍',
    appTagline: 'ଜାତୀୟ ସ୍ୱାସ୍ଥ୍ୟ ଯୋଗାଣ ଗ୍ରିଡ୍ ଏବଂ ମହାମାରୀ ପୂର୍ବ ସତର୍କତା ପ୍ରଣାଳୀ',
    nhmTitle: 'ଜାତୀୟ ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରାଧିକରଣ',
    abdmAligned: 'ଆୟୁଷ୍ମାନ ଭାରତ ଡିଜିଟାଲ୍ ହେଲଥ୍ ଗ୍ରିଡ୍',
    stateAll: 'ସମଗ୍ର ଭାରତ (୩୬ ରାଜ୍ୟ ଏବଂ କେନ୍ଦ୍ରଶାସିତ ଅଞ୍ଚଳ)',
    tabTacticalCommand: 'କମାଣ୍ଡ ସେଣ୍ଟର',
    tabFederatedGrid: 'ଫେଡେରେଟେଡ୍ ଗ୍ରିଡ୍',
    tabFieldLogger: 'ଫିଲ୍ଡ ଟର୍ମିନାଲ୍',
    tabStorylineDemo: 'ମହାମାରୀ ପ୍ରୋଟୋକଲ୍',
    kpiCriticalStockouts: 'ଜରୁରୀ ଔଷଧ ଅଭାବ',
    kpiTransfersAwaiting: 'ଅନୁମୋଦନ ଅପେକ୍ଷାରେ',
    transfersPlanTitle: 'ଔଷଧ ପୁନଃବଣ୍ଟନ ନିର୍ଦ୍ଦେଶ',
    approveBtn: 'ଅନୁମୋଦନ କରନ୍ତୁ',
    rejectBtn: 'ପ୍ରତ୍ୟାଖ୍ୟାନ କରନ୍ତୁ',
    adminPortalTitle: 'ଜାତୀୟ ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରାଧିକରଣ ଆଡମିନ୍ ପୋର୍ଟାଲ୍',
    signInGoogle: 'ଗୁଗୁଲ୍ ସହିତ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ (ଆଡମିନ୍)',
    enterDemoOfficer: 'ଡେମୋ ଅଧିକାରୀ ଭାବରେ ପ୍ରବେଶ କରନ୍ତୁ',
    officerRole: 'ଜିଲ୍ଲା ଚିକିତ୍ସା ଅଧିକାରୀ (DMO)',
    adminStatus: 'ପ୍ରମାଣିତ ଆଡମିନ୍',
    signOut: 'ଲଗ୍ ଆଉଟ୍'
  },

  pa: {
    ...baseEnglish,
    appName: 'ਪੈਕਸੋਰਾਗ੍ਰਿਡ',
    appTagline: 'ਰਾਸ਼ਟਰੀ ਸਿਹਤ ਸਪਲਾਈ ਗਰਿੱਡ ਅਤੇ ਮਹਾਂਮਾਰੀ ਚੇਤਾਵਨੀ ਪ੍ਰਣਾਲੀ',
    nhmTitle: 'ਰਾਸ਼ਟਰੀ ਸਿਹਤ ਅਥਾਰਟੀ',
    abdmAligned: 'ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਡਿਜੀਟਲ ਹੈਲਥ ਗਰਿੱਡ',
    stateAll: 'ਸਮੁੱਚਾ ਭਾਰਤ (36 ਰਾਜ ਅਤੇ ਕੇਂਦਰ ਸ਼ਾਸਤ ਪ੍ਰਦੇਸ਼)',
    tabTacticalCommand: 'ਕਮਾਂਡ ਸੈਂਟਰ',
    tabFederatedGrid: 'ਫੈਡਰੇਟਿਡ ਗਰਿੱਡ',
    tabFieldLogger: 'ਫੀਲਡ ਟਰਮੀਨਲ',
    tabStorylineDemo: 'ਸਰਜ ਪ੍ਰੋਟੋਕੋਲ',
    kpiCriticalStockouts: 'ਗੰਭੀਰ ਦਵਾਈਆਂ ਦੀ ਘਾਟ',
    kpiTransfersAwaiting: 'ਮਨਜ਼ੂਰੀ ਲਈ ਉਡੀਕ ਰਹੇ ਤਬਾਦਲੇ',
    transfersPlanTitle: 'ਦਵਾਈ ਮੁੜ ਵੰਡ ਨਿਰਦੇਸ਼',
    approveBtn: 'ਤਬਾਦਲੇ ਨੂੰ ਮਨਜ਼ੂਰ ਕਰੋ',
    rejectBtn: 'ਰੱਦ ਕਰੋ',
    adminPortalTitle: 'ਰਾਸ਼ਟਰੀ ਸਿਹਤ ਅਥਾਰਟੀ ਐਡਮਿਨ ਪੋਰਟਲ',
    signInGoogle: 'ਗੂਗਲ ਨਾਲ ਲੌਗਇਨ ਕਰੋ (ਐਡਮਿਨ)',
    enterDemoOfficer: 'ਡੈਮੋ ਅਧਿਕਾਰੀ ਵਜੋਂ ਦਾਖਲ ਹੋਵੋ',
    officerRole: 'ਜ਼ਿਲ੍ਹਾ ਸਿਹਤ ਅਧਿਕਾਰੀ (DHO)',
    adminStatus: 'ਪ੍ਰਮਾਣਿਤ ਐਡਮਿਨ',
    signOut: 'ਲੌਗ ਆਉਟ'
  },

  as: {
    ...baseEnglish,
    appName: 'পেক্সোৰাগ্ৰিড',
    appTagline: 'ৰাষ্ট্ৰীয় স্বাস্থ্য যোগান গ্ৰিড আৰু মহামাৰী পূৰ্বাভাস প্ৰণালী',
    nhmTitle: 'ৰাষ্ট্ৰীয় স্বাস্থ্য কৰ্তৃপক্ষ',
    abdmAligned: 'আয়ুষ্মান ভাৰত ডিজিটেল হেল্থ গ্ৰিড',
    stateAll: 'সমগ্ৰ ভাৰত (৩৬ খন ৰাজ্য আৰু কেন্দ্ৰীয় শাসিত অঞ্চল)',
    tabTacticalCommand: 'কমাণ্ড চেণ্টাৰ',
    tabFederatedGrid: 'ফেডাৰেটেড গ্ৰিড',
    tabFieldLogger: 'ফিল্ড টাৰ্মিনেল',
    tabStorylineDemo: 'মহামাৰী প্ৰটোকল',
    kpiCriticalStockouts: 'জৰুৰী ঔষধৰ নাটনি',
    kpiTransfersAwaiting: 'অনুমোদনৰ অপেক্ষাত',
    transfersPlanTitle: 'ঔষধ পুনৰ বিতৰণ নিৰ্দেশনা',
    approveBtn: 'অনুমোদন কৰক',
    rejectBtn: 'প্ৰত্যাখ্যান কৰক',
    adminPortalTitle: 'ৰাষ্ট্ৰীয় স্বাস্থ্য কৰ্তৃপক্ষ এডমিন পৰ্টেল',
    signInGoogle: 'গুগলৰ সৈতে ছাইন ইন কৰক (এডমিন)',
    enterDemoOfficer: 'ডেমো বিষয়া হিচাপে প্ৰৱেশ কৰক',
    officerRole: 'জিলা স্বাস্থ্য বিষয়া (DHO)',
    adminStatus: 'প্ৰমাণিত এডমিন',
    signOut: 'লগ আউট'
  }
};

/**
 * Returns the localized translation for a given key, falling back to English.
 */
export function getTranslation(key: string, lang: SupportedLanguage = 'en'): string {
  const dict = translations[lang] || translations.en;
  if (dict && dict[key]) {
    return dict[key];
  }
  return baseEnglish[key] || key;
}

