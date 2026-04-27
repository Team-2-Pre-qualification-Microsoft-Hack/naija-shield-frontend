export const kpiData = [
  {
    label: "Threats Blocked Today",
    value: "1,247",
    delta: "+12%",
    color: "#ef4444",
  },
  {
    label: "Deepfake Calls Intercepted",
    value: "38",
    delta: "+5%",
    color: "#f59e0b",
  },
  {
    label: "SMS Scams Flagged",
    value: "892",
    delta: "+18%",
    color: "#e8581a",
  },
  {
    label: "Network Risk Score",
    value: "73/100",
    delta: "-4pts",
    color: "#10b981",
  },
];

export const threatFeedData = [
  {
    id: "INC-2847",
    time: "09:42:11",
    channel: "SMS",
    preview: "Your GTBank account has been suspended. Send OTP to 08012345678...",
    language: "English",
    risk: 96,
    riskLevel: "High",
    typology: "OTP Phishing",
    status: "Blocked",
    number: "+2348012345678",
    transcript:
      "Your GTBank account has been suspended due to suspicious activity. Send your OTP now.",
    aiReasoning:
      "Message requests OTP with urgency and impersonates a financial institution.",
  },
  {
    id: "INC-2846",
    time: "09:38:55",
    channel: "Voice",
    preview: "Caller claimed to be EFCC officer demanding immediate payment...",
    language: "Pidgin",
    risk: 99,
    riskLevel: "High",
    typology: "Vishing",
    status: "Blocked",
    number: "+2347098765432",
    transcript: "Na EFCC we be. Pay now to avoid arrest.",
    aiReasoning:
      "Authority impersonation and immediate financial demand indicate high-risk fraud.",
  },
  {
    id: "INC-2844",
    time: "09:24:08",
    channel: "WhatsApp",
    preview: "Hi Mum, I changed my number. Please send N50k urgent...",
    language: "English",
    risk: 82,
    riskLevel: "High",
    typology: "Impersonation",
    status: "Monitoring",
    number: "+2348123456789",
    transcript: "Hi Mum, I'm in trouble, send N50,000 urgently.",
    aiReasoning:
      "Classic family impersonation scam with urgency and secrecy cues.",
  },
  {
    id: "INC-2840",
    time: "08:44:05",
    channel: "SMS",
    preview: "Safe: Standard OTP delivery from verified infrastructure...",
    language: "English",
    risk: 8,
    riskLevel: "Low",
    typology: "Legitimate",
    status: "Allowed",
    number: "+2348099999999",
    transcript: "Your verification code is 847291. Do not share with anyone.",
    aiReasoning:
      "Verified sender profile and standard OTP content with no social engineering cues.",
  },
];

export const complianceReports = [
  {
    id: "CBN-RPT-2025-0427-001",
    generated: "Today, 08:00 AM",
    period: "Apr 26 – Apr 27, 2025",
    incidents: 47,
    status: "Submitted",
  },
  {
    id: "CBN-RPT-2025-0426-001",
    generated: "Yesterday, 08:00 AM",
    period: "Apr 25 – Apr 26, 2025",
    incidents: 61,
    status: "Acknowledged",
  },
  {
    id: "CBN-RPT-2025-0425-001",
    generated: "Apr 25, 08:00 AM",
    period: "Apr 24 – Apr 25, 2025",
    incidents: 38,
    status: "Draft",
  },
];

export const users = [
  {
    id: "USR-001",
    name: "Emeka Okafor",
    email: "e.okafor@mtn.ng",
    role: "SOC Analyst",
    status: "Active",
    lastActive: "2 mins ago",
  },
  {
    id: "USR-002",
    name: "Amaka Nwosu",
    email: "a.nwosu@mtn.ng",
    role: "Compliance Officer",
    status: "Active",
    lastActive: "15 mins ago",
  },
  {
    id: "USR-003",
    name: "Tunde Adeyemi",
    email: "t.adeyemi@mtn.ng",
    role: "System Admin",
    status: "Active",
    lastActive: "1 hour ago",
  },
];

export const nigeriaHotspots = [
  { city: "Lagos", intensity: 95, count: 512, x: 46, y: 78 },
  { city: "Abuja", intensity: 72, count: 287, x: 53, y: 48 },
  { city: "Kano", intensity: 58, count: 198, x: 62, y: 28 },
  { city: "Port Harcourt", intensity: 45, count: 134, x: 44, y: 84 },
  { city: "Ibadan", intensity: 38, count: 98, x: 42, y: 68 },
  { city: "Enugu", intensity: 31, count: 78, x: 56, y: 72 },
];

export const threatVelocity = [
  { hour: "00:00", sms: 12, voice: 3 },
  { hour: "02:00", sms: 5, voice: 1 },
  { hour: "04:00", sms: 6, voice: 1 },
  { hour: "06:00", sms: 28, voice: 5 },
  { hour: "08:00", sms: 89, voice: 14 },
  { hour: "10:00", sms: 98, voice: 18 },
  { hour: "12:00", sms: 87, voice: 15 },
  { hour: "14:00", sms: 74, voice: 12 },
  { hour: "16:00", sms: 65, voice: 10 },
  { hour: "18:00", sms: 81, voice: 16 },
  { hour: "20:00", sms: 59, voice: 9 },
  { hour: "22:00", sms: 36, voice: 6 },
];
