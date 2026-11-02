/**
 * Campus Hackathon Problem Statements
 * Source: Campus_Hackathon_Problem_Statements_No_Ratings.pdf
 * "Advanced AI Campus Hackathon - Smart Campus, Better Society"
 */

const HACKATHON_METADATA = {
  title: "Advanced AI Campus Hackathon",
  theme: "Smart Campus, Better Society",
  catalog: "Expanded Problem Statement Catalogue — Revised",
  evaluationCriteria: [
    { name: "Social impact", weight: "25%" },
    { name: "Technical implementation", weight: "25%" },
    { name: "Innovation", weight: "20%" },
    { name: "UI/UX", weight: "15%" },
    { name: "Practical feasibility", weight: "15%" }
  ],
  organizerNotes: [
    "Provide common or simulated datasets and surprise test cases.",
    "Judge working functionality, safety, fairness, and measurable outcomes—not chatbot integration alone.",
    "Require human review for high-risk decisions involving health, safety, harassment, finances, or academic consequences.",
    "Teams should document limitations, false positives, privacy protections, and responsible-AI safeguards."
  ],
  recommendedProblemIds: ["PS-12", "PS-14", "PS-15", "PS-19", "PS-21", "PS-22"]
};

const PROBLEM_STATEMENTS = [
  {
    id: "PS-01",
    num: 1,
    isOdd: true,
    category: "Original",
    title: "Student Dropout Early Warning System",
    description: "Use simulated attendance, academic performance, and engagement data to identify students who may need additional support. Create explainable, privacy-preserving predictions and equitable intervention recommendations.",
    tags: ["Academics", "Student Support", "Predictive AI"],
    isRecommended: false
  },
  {
    id: "PS-02",
    num: 2,
    isOdd: false,
    category: "Original",
    title: "Intelligent Campus Disaster Response",
    description: "Build a platform to simulate fires, floods, earthquakes, and other campus emergencies. Implement dynamic evacuation routing that adapts to hazards, crowd density, and accessibility needs.",
    tags: ["Emergency", "Evacuation", "Routing", "Safety"],
    isRecommended: false
  },
  {
    id: "PS-03",
    num: 3,
    isOdd: true,
    category: "Original",
    title: "Campus Food Demand Prediction",
    description: "Forecast daily mess and canteen demand using historical meals, holidays, exam schedules, and attendance estimates. Reduce food waste while avoiding shortages under uncertain demand.",
    tags: ["Food & Dining", "Forecasting", "Waste Reduction"],
    isRecommended: false
  },
  {
    id: "PS-04",
    num: 4,
    isOdd: false,
    category: "Original",
    title: "AI Campus Accessibility Auditor",
    description: "Analyze campus maps and infrastructure images to identify obstacles faced by people with disabilities. Recommend accessible routes and prioritize infrastructure improvements.",
    tags: ["Accessibility", "Computer Vision", "Infrastructure"],
    isRecommended: false
  },
  {
    id: "PS-05",
    num: 5,
    isOdd: true,
    category: "Original",
    title: "Campus Cybersecurity Threat Detection",
    description: "Create a dashboard that monitors a simulated campus network for suspicious activity. Detect anomalous logins, phishing indicators, and attack patterns with low false-positive rates.",
    tags: ["Cybersecurity", "Network", "Threat Detection"],
    isRecommended: false
  },
  {
    id: "PS-06",
    num: 6,
    isOdd: false,
    category: "Original",
    title: "Campus Resource Allocation Optimizer",
    description: "Allocate classrooms, laboratories, equipment, and study areas based on competing requirements. Solve scheduling conflicts under capacity, fairness, accessibility, and availability constraints.",
    tags: ["Resource Management", "Optimization", "Scheduling"],
    isRecommended: false
  },
  {
    id: "PS-07",
    num: 7,
    isOdd: true,
    category: "Original",
    title: "Privacy-Preserving Harassment Pattern Detection",
    description: "Design a confidential reporting system that helps authorized staff identify potentially related incidents. Find patterns without exposing complainants, making automated accusations, or bypassing human review.",
    tags: ["Campus Safety", "Privacy", "Pattern Detection"],
    isRecommended: false
  },
  {
    id: "PS-08",
    num: 8,
    isOdd: false,
    category: "Original",
    title: "Campus Energy Optimization",
    description: "Predict electricity demand in hostels, labs, and academic buildings. Use occupancy, weather, and simulated meter data to reduce consumption while maintaining essential services.",
    tags: ["Energy", "Sustainability", "Smart Grid"],
    isRecommended: false
  },
  {
    id: "PS-09",
    num: 9,
    isOdd: true,
    category: "Original",
    title: "Campus Misinformation Detection",
    description: "Help students check potentially false college announcements against verified institutional information. Provide evidence-linked assessments, uncertainty labels, and source traceability.",
    tags: ["Information Integrity", "NLP", "Fact Checking"],
    isRecommended: false
  },
  {
    id: "PS-10",
    num: 10,
    isOdd: false,
    category: "Original",
    title: "Emergency Medical Coordination",
    description: "Coordinate verified emergency requests with campus responders and healthcare contacts. Optimize assignment and routing using incident severity, availability, and travel time.",
    tags: ["Healthcare", "Emergency", "Dispatch & Routing"],
    isRecommended: false
  },
  {
    id: "PS-11",
    num: 11,
    isOdd: true,
    category: "Original",
    title: "Campus Sustainability Decision Engine",
    description: "Evaluate the environmental impact of campus operations across energy, water, waste, and transport. Recommend a cost-constrained portfolio of improvements using multi-objective optimization.",
    tags: ["Sustainability", "Operations", "Optimization"],
    isRecommended: false
  },
  {
    id: "PS-12",
    num: 12,
    isOdd: false,
    category: "Additional High-Impact",
    title: "AI-Based Mental Health Support and Crisis Detection",
    description: "Develop a privacy-preserving platform that identifies students at risk of severe stress, burnout, or self-harm using voluntary surveys, academic patterns, and help-seeking behavior. Detect risk without diagnosis, protect privacy, minimize false alarms, and connect students to verified support.",
    tags: ["Mental Health", "Privacy", "Wellness", "High-Impact"],
    isRecommended: true
  },
  {
    id: "PS-13",
    num: 13,
    isOdd: true,
    category: "Additional High-Impact",
    title: "Women’s Safety and Safe Route Optimizer",
    description: "Recommend safer walking routes using lighting, crowd density, emergency phones, security coverage, and historical incident data. Optimize routes in real time while protecting sensitive location data and avoiding victim-blaming.",
    tags: ["Women Safety", "Routing", "Navigation", "Real-Time"],
    isRecommended: false
  },
  {
    id: "PS-14",
    num: 14,
    isOdd: false,
    category: "Additional High-Impact",
    title: "AI Sign-Language and Speech Accessibility Assistant",
    description: "Create a real-time tool that converts sign language to text or speech and spoken language into visual instructions. Support diverse signing styles, regional languages, limited training data, and low-latency operation.",
    tags: ["Accessibility", "Sign Language", "Speech", "High-Impact"],
    isRecommended: true
  },
  {
    id: "PS-15",
    num: 15,
    isOdd: true,
    category: "Additional High-Impact",
    title: "Assistive Navigation for Visually Impaired Students",
    description: "Develop an AI navigation assistant using computer vision, maps, voice instructions, and obstacle detection. Provide safe, accurate, real-time guidance and identify temporary obstacles.",
    tags: ["Assistive Tech", "Computer Vision", "Navigation", "High-Impact"],
    isRecommended: true
  },
  {
    id: "PS-16",
    num: 16,
    isOdd: false,
    category: "Additional High-Impact",
    title: "Scholarship and Financial-Aid Eligibility Engine",
    description: "Identify students who may qualify for scholarships, fee support, food assistance, or emergency funds. Match complex eligibility rules while protecting financial data and preventing discrimination.",
    tags: ["Financial Aid", "Equity", "Eligibility Matching"],
    isRecommended: false
  },
  {
    id: "PS-17",
    num: 17,
    isOdd: true,
    category: "Additional High-Impact",
    title: "Campus Food Rescue and Redistribution Platform",
    description: "Predict surplus food from hostels and canteens and coordinate safe redistribution to students, shelters, or community organizations. Forecast surplus, optimize collection routes, and monitor food safety.",
    tags: ["Food Rescue", "Community", "Logistics"],
    isRecommended: false
  },
  {
    id: "PS-18",
    num: 18,
    isOdd: false,
    category: "Additional High-Impact",
    title: "Student Accessibility Accommodation System",
    description: "Convert confidential disability-related accommodation requests into coordinated academic, transportation, examination, and housing support. Prioritize urgent needs, detect service gaps, and provide explainable recommendations.",
    tags: ["Accessibility", "Special Needs", "Accommodations"],
    isRecommended: false
  },
  {
    id: "PS-19",
    num: 19,
    isOdd: true,
    category: "Additional High-Impact",
    title: "Human Trafficking and Exploitation Risk Awareness System",
    description: "Detect suspicious patterns in simulated campus or community reports without automatically accusing individuals. Analyze weak signals, preserve anonymity, reduce bias, and require human verification before escalation.",
    tags: ["Public Safety", "Ethics", "Pattern Detection", "High-Impact"],
    isRecommended: true
  },
  {
    id: "PS-20",
    num: 20,
    isOdd: false,
    category: "Additional High-Impact",
    title: "AI-Based Academic Integrity and Fairness Monitor",
    description: "Detect suspicious academic behavior while protecting students from unfair automated punishment. Distinguish collaboration from cheating, detect bias, provide evidence, preserve privacy, and keep humans in the decision loop.",
    tags: ["Academic Integrity", "Fairness", "Ethics"],
    isRecommended: false
  },
  {
    id: "PS-21",
    num: 21,
    isOdd: true,
    category: "Additional High-Impact",
    title: "Community Blood and Organ Donation Coordinator",
    description: "Predict blood demand, verify donors, match compatible donations, and coordinate urgent requests. Handle real-time matching, medical privacy, availability uncertainty, and emergency prioritization.",
    tags: ["Healthcare", "Blood Donation", "Matching", "High-Impact"],
    isRecommended: true
  },
  {
    id: "PS-22",
    num: 22,
    isOdd: false,
    category: "Additional High-Impact",
    title: "Campus-to-Employment Opportunity Matcher",
    description: "Connect students—especially first-generation, rural, or economically disadvantaged learners—with suitable internships, jobs, and skill-development programs. Match skills to opportunities, identify skill gaps, explain recommendations, and prevent bias.",
    tags: ["Employment", "Equity", "Opportunity Matching", "High-Impact"],
    isRecommended: true
  }
];

// Helper methods
function getProblemById(id) {
  return PROBLEM_STATEMENTS.find(p => p.id === id);
}

function getOddProblems() {
  return PROBLEM_STATEMENTS.filter(p => p.isOdd);
}

function getEvenProblems() {
  return PROBLEM_STATEMENTS.filter(p => !p.isOdd);
}

function getRecommendedProblems() {
  return PROBLEM_STATEMENTS.filter(p => p.isRecommended);
}
