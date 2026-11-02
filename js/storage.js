/**
 * Hackathon Storage & Persistence Engine
 * Supports LocalStorage, optional Google Sheets sync, demo seeds, and analytics.
 */

const STORAGE_KEY = "HACKATHON_REGISTRATIONS_V2";
const SETTINGS_KEY = "HACKATHON_SETTINGS_V2";
const CURRENT_LEAD_SESSION_KEY = "HACKATHON_CURRENT_LEAD_SESSION";

const StorageManager = {
  // Get all registrations
  getRegistrations() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse registrations:", e);
      return [];
    }
  },

  // Save full registrations array
  saveAllRegistrations(registrations) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
      window.dispatchEvent(new CustomEvent("hackathon_data_updated"));
      return true;
    } catch (e) {
      console.error("Failed to save registrations:", e);
      return false;
    }
  },

  // Add a new registration
  addRegistration(registration) {
    const list = this.getRegistrations();

    // Check if team lead roll number is already used
    const leadRoll = registration.leadRollNo.trim().toUpperCase();
    const existing = list.find(r => r.leadRollNo.trim().toUpperCase() === leadRoll);
    if (existing) {
      throw new Error(`Roll number ${leadRoll} is already registered under Team "${existing.teamName}"!`);
    }

    // Check member roll numbers
    for (const member of registration.members) {
      const mRoll = member.rollNo.trim().toUpperCase();
      if (!mRoll) continue;
      const conflict = list.find(r => {
        if (r.leadRollNo.trim().toUpperCase() === mRoll) return true;
        return r.members.some(m => m.rollNo.trim().toUpperCase() === mRoll);
      });
      if (conflict) {
        throw new Error(`Member roll number ${mRoll} (${member.name}) is already registered with Team "${conflict.teamName}"!`);
      }
    }

    // Assign unique ID and timestamp if not present
    const newEntry = {
      id: "REG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      timestamp: new Date().toISOString(),
      ...registration
    };

    list.unshift(newEntry);
    this.saveAllRegistrations(list);

    // Save active lead session
    this.setCurrentSession(newEntry);

    // Async sync to Google Sheets if configured
    this.syncToGoogleSheets(newEntry).catch(err => {
      console.warn("Google Sheets auto-sync notification:", err);
    });

    return newEntry;
  },

  // Delete registration by ID
  deleteRegistration(id) {
    const list = this.getRegistrations();
    const filtered = list.filter(r => r.id !== id);
    this.saveAllRegistrations(filtered);
    return true;
  },

  // Active Team Lead Session (for easy review on reload)
  getCurrentSession() {
    try {
      const data = localStorage.getItem(CURRENT_LEAD_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentSession(data) {
    if (!data) {
      localStorage.removeItem(CURRENT_LEAD_SESSION_KEY);
    } else {
      localStorage.setItem(CURRENT_LEAD_SESSION_KEY, JSON.stringify(data));
    }
  },

  clearCurrentSession() {
    localStorage.removeItem(CURRENT_LEAD_SESSION_KEY);
  },

  // Settings: Google Sheets webhook URL, etc.
  getSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : { sheetsWebhookUrl: "", hackathonName: "Advanced AI Campus Hackathon" };
    } catch (e) {
      return { sheetsWebhookUrl: "", hackathonName: "Advanced AI Campus Hackathon" };
    }
  },

  saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  // Send registration to Google Sheets via Webhook
  async syncToGoogleSheets(registration) {
    const settings = this.getSettings();
    const url = settings.sheetsWebhookUrl && settings.sheetsWebhookUrl.trim();
    if (!url) return false;

    try {
      // Send as POST JSON payload to Google Apps Script Web App
      await fetch(url, {
        method: "POST",
        mode: "no-cors", // Google Apps Script redirects trigger CORS in browser, no-cors allows safe execution
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "registerTeam",
          data: registration
        })
      });
      return true;
    } catch (e) {
      console.warn("Sheets webhook send error:", e);
      return false;
    }
  },

  // Comprehensive analytics calculation
  getAnalytics() {
    const registrations = this.getRegistrations();
    const totalTeams = registrations.length;

    let oddCount = 0;
    let evenCount = 0;
    let totalMembersCount = 0;

    // Map problem ID to array of team names/IDs
    const problemMap = {};
    for (const p of PROBLEM_STATEMENTS) {
      problemMap[p.id] = [];
    }

    for (const reg of registrations) {
      // Calculate total participants (Lead + Members)
      totalMembersCount += 1 + (reg.members ? reg.members.filter(m => m.name.trim() !== "").length : 0);

      const pId = reg.problemId;
      if (problemMap[pId]) {
        problemMap[pId].push(reg);
      } else {
        problemMap[pId] = [reg];
      }

      if (reg.isOddProblem) {
        oddCount++;
      } else {
        evenCount++;
      }
    }

    const oddPercentage = totalTeams > 0 ? Math.round((oddCount / totalTeams) * 100) : 0;
    const evenPercentage = totalTeams > 0 ? Math.round((evenCount / totalTeams) * 100) : 0;

    // Detect duplicate / multiple choices (Same Problem chosen by > 1 team)
    const sameProblemSelections = [];
    let uniqueProblemsChosenCount = 0;
    let mostPopularProblem = null;
    let maxSelections = 0;

    for (const [pId, teams] of Object.entries(problemMap)) {
      const problemInfo = getProblemById(pId);
      if (teams.length > 0) {
        uniqueProblemsChosenCount++;
      }
      if (teams.length > maxSelections) {
        maxSelections = teams.length;
        mostPopularProblem = {
          id: pId,
          title: problemInfo ? problemInfo.title : pId,
          count: teams.length,
          isOdd: problemInfo ? problemInfo.isOdd : false
        };
      }
      if (teams.length > 1) {
        sameProblemSelections.push({
          id: pId,
          title: problemInfo ? problemInfo.title : pId,
          count: teams.length,
          teams: teams.map(t => ({ teamName: t.teamName, leadRollNo: t.leadRollNo })),
          isOdd: problemInfo ? problemInfo.isOdd : false
        });
      }
    }

    // Sort same problems descending by count
    sameProblemSelections.sort((a, b) => b.count - a.count);

    return {
      totalTeams,
      totalMembersCount,
      oddCount,
      evenCount,
      oddPercentage,
      evenPercentage,
      problemMap, // map of PS-ID -> list of teams
      sameProblemSelections, // problems selected by 2 or more teams
      uniqueProblemsChosenCount,
      mostPopularProblem,
      maxSelections
    };
  },

  // Seed sample realistic teams for demonstration
  seedDemoData() {
    const demoTeams = [
      {
        id: "REG-DEMO01",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        teamName: "Neural Nexus",
        leadName: "Aditya Sharma",
        leadRollNo: "21CS101",
        leadEmail: "aditya.sharma@campus.edu",
        leadPhone: "9876543201",
        problemId: "PS-01",
        problemTitle: "Student Dropout Early Warning System",
        isOddProblem: true,
        members: [
          { name: "Rohit Verma", rollNo: "21CS102" },
          { name: "Kavya Iyer", rollNo: "21CS103" },
          { name: "Arjun Nair", rollNo: "21CS104" }
        ]
      },
      {
        id: "REG-DEMO02",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        teamName: "Cyber Sentinels",
        leadName: "Bhavna Krishnan",
        leadRollNo: "21IT045",
        leadEmail: "bhavna.k@campus.edu",
        leadPhone: "9876543202",
        problemId: "PS-05",
        problemTitle: "Campus Cybersecurity Threat Detection",
        isOddProblem: true,
        members: [
          { name: "Deepak Menon", rollNo: "21IT046" },
          { name: "Farhan Ali", rollNo: "21IT047" }
        ]
      },
      {
        id: "REG-DEMO03",
        timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        teamName: "ByteShield",
        leadName: "Chirag Singhania",
        leadRollNo: "21CS205",
        leadEmail: "chirag.s@campus.edu",
        leadPhone: "9876543203",
        problemId: "PS-05", // Same problem as Cyber Sentinels (Demonstrates same-problem counter!)
        problemTitle: "Campus Cybersecurity Threat Detection",
        isOddProblem: true,
        members: [
          { name: "Tanvi Saxena", rollNo: "21CS206" },
          { name: "Vikas Rao", rollNo: "21CS207" },
          { name: "Ananya Sen", rollNo: "21CS208" }
        ]
      },
      {
        id: "REG-DEMO04",
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        teamName: "Crisis Resolvers",
        leadName: "Divya Balaji",
        leadRollNo: "21EC088",
        leadEmail: "divya.b@campus.edu",
        leadPhone: "9876543204",
        problemId: "PS-02",
        problemTitle: "Intelligent Campus Disaster Response",
        isOddProblem: false,
        members: [
          { name: "Eshan Ghosh", rollNo: "21EC089" },
          { name: "Gautam Pillai", rollNo: "21EC090" }
        ]
      },
      {
        id: "REG-DEMO05",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        teamName: "MindCare AI",
        leadName: "Harshil Mehra",
        leadRollNo: "21AI012",
        leadEmail: "harshil.m@campus.edu",
        leadPhone: "9876543205",
        problemId: "PS-12",
        problemTitle: "AI-Based Mental Health Support and Crisis Detection",
        isOddProblem: false,
        members: [
          { name: "Ishani Gupta", rollNo: "21AI013" },
          { name: "Jatin Sethi", rollNo: "21AI014" },
          { name: "Kritika Roy", rollNo: "21AI015" }
        ]
      },
      {
        id: "REG-DEMO06",
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        teamName: "SafeSteps Campus",
        leadName: "Lavanya Sundaram",
        leadRollNo: "21CS310",
        leadEmail: "lavanya.s@campus.edu",
        leadPhone: "9876543206",
        problemId: "PS-13",
        problemTitle: "Women’s Safety and Safe Route Optimizer",
        isOddProblem: true,
        members: [
          { name: "Manish Reddy", rollNo: "21CS311" },
          { name: "Nisha Agarwal", rollNo: "21CS312" }
        ]
      },
      {
        id: "REG-DEMO07",
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        teamName: "VoiceVision",
        leadName: "Ojas Kulkarni",
        leadRollNo: "21EE077",
        leadEmail: "ojas.k@campus.edu",
        leadPhone: "9876543207",
        problemId: "PS-14",
        problemTitle: "AI Sign-Language and Speech Accessibility Assistant",
        isOddProblem: false,
        members: [
          { name: "Pranav Joshi", rollNo: "21EE078" },
          { name: "Rhea Chawla", rollNo: "21EE079" }
        ]
      },
      {
        id: "REG-DEMO08",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        teamName: "SignBridge",
        leadName: "Sameer Deshmukh",
        leadRollNo: "21CS440",
        leadEmail: "sameer.d@campus.edu",
        leadPhone: "9876543208",
        problemId: "PS-14", // Also PS-14 (Demonstrates even problem same-choice count)
        problemTitle: "AI Sign-Language and Speech Accessibility Assistant",
        isOddProblem: false,
        members: [
          { name: "Trisha Mukherjee", rollNo: "21CS441" },
          { name: "Utkarsh Bhat", rollNo: "21CS442" },
          { name: "Varun Kapoor", rollNo: "21CS443" }
        ]
      }
    ];

    this.saveAllRegistrations(demoTeams);
    return demoTeams;
  },

  // Clear all data
  clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_LEAD_SESSION_KEY);
    window.dispatchEvent(new CustomEvent("hackathon_data_updated"));
  }
};
