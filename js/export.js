/**
 * Hackathon Export Engine
 * Generates:
 * 1. Microsoft Excel (.xlsx) using SheetJS with multiple sheets & formatted columns
 * 2. Google Notes / Keep formatted text & markdown note download
 * 3. Standard CSV with UTF-8 BOM
 */

const ExportManager = {
  // 1. EXPORT TO MICROSOFT EXCEL (.xlsx)
  exportToExcel() {
    const registrations = StorageManager.getRegistrations();
    if (registrations.length === 0) {
      alert("No registrations found to export! Please add teams or load demo data first.");
      return false;
    }

    if (typeof XLSX === "undefined") {
      alert("Excel library is loading, falling back to CSV export...");
      return this.exportToCSV();
    }

    // Build Sheet 1: Team Registrations
    const teamRows = registrations.map((r, idx) => {
      const m2 = r.members && r.members[0] ? r.members[0] : { name: "", rollNo: "" };
      const m3 = r.members && r.members[1] ? r.members[1] : { name: "", rollNo: "" };
      const m4 = r.members && r.members[2] ? r.members[2] : { name: "", rollNo: "" };
      const m5 = r.members && r.members[3] ? r.members[3] : { name: "", rollNo: "" };

      // Build member summary string
      const memberSummaries = [
        `Lead: ${r.leadName} (${r.leadRollNo})`
      ];
      if (r.members) {
        r.members.forEach((m, i) => {
          if (m.name.trim()) {
            memberSummaries.push(`M${i + 2}: ${m.name} (${m.rollNo})`);
          }
        });
      }

      const totalMembers = 1 + (r.members ? r.members.filter(m => m.name.trim() !== "").length : 0);
      const dateFormatted = new Date(r.timestamp).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      });

      return {
        "S.No": idx + 1,
        "Registration ID": r.id,
        "Timestamp": dateFormatted,
        "Team Name": r.teamName,
        "Problem ID": r.problemId,
        "Problem Title": r.problemTitle,
        "Problem Type": r.isOddProblem ? "ODD" : "EVEN",
        "Team Size": totalMembers,
        "Team Lead Name": r.leadName,
        "Team Lead Roll No": r.leadRollNo,
        "Lead Email": r.leadEmail || "N/A",
        "Lead Phone": r.leadPhone || "N/A",
        "Member 2 Name": m2.name,
        "Member 2 Roll No": m2.rollNo,
        "Member 3 Name": m3.name,
        "Member 3 Roll No": m3.rollNo,
        "Member 4 Name": m4.name,
        "Member 4 Roll No": m4.rollNo,
        "Member 5 Name": m5.name,
        "Member 5 Roll No": m5.rollNo,
        "Full Team Roster": memberSummaries.join(" | ")
      };
    });

    // Build Sheet 2: Problem Statement Distribution & Odd/Even Summary
    const analytics = StorageManager.getAnalytics();
    const problemSummaryRows = PROBLEM_STATEMENTS.map(ps => {
      const teams = analytics.problemMap[ps.id] || [];
      const teamNames = teams.map(t => `${t.teamName} [Lead: ${t.leadRollNo}]`).join("; ");
      return {
        "Problem ID": ps.id,
        "Problem Title": ps.title,
        "Problem Type": ps.isOdd ? "ODD" : "EVEN",
        "Teams Selected Count": teams.length,
        "Status": teams.length === 0 ? "Not Selected" : teams.length === 1 ? "Single Team" : `Same Problem Selected (${teams.length} Teams)`,
        "Teams Assigned": teamNames || "None"
      };
    });

    // Build Sheet 3: Overall Summary Stats
    const statsRows = [
      { "Metric": "Total Teams Registered", "Value": analytics.totalTeams },
      { "Metric": "Total Student Participants", "Value": analytics.totalMembersCount },
      { "Metric": "Odd-Numbered Problems Chosen", "Value": `${analytics.oddCount} (${analytics.oddPercentage}%)` },
      { "Metric": "Even-Numbered Problems Chosen", "Value": `${analytics.evenCount} (${analytics.evenPercentage}%)` },
      { "Metric": "Unique Problems Selected (out of 22)", "Value": analytics.uniqueProblemsChosenCount },
      { "Metric": "Most Popular Problem", "Value": analytics.mostPopularProblem ? `${analytics.mostPopularProblem.id} - ${analytics.mostPopularProblem.title} (${analytics.mostPopularProblem.count} teams)` : "N/A" },
      { "Metric": "Problems with Multiple Teams (Duplicate Selections)", "Value": analytics.sameProblemSelections.length }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1
    const ws1 = XLSX.utils.json_to_sheet(teamRows);
    ws1["!cols"] = [
      { wch: 6 },  // S.No
      { wch: 14 }, // Reg ID
      { wch: 20 }, // Timestamp
      { wch: 22 }, // Team Name
      { wch: 12 }, // Problem ID
      { wch: 38 }, // Problem Title
      { wch: 14 }, // Problem Type
      { wch: 10 }, // Team Size
      { wch: 22 }, // Lead Name
      { wch: 18 }, // Lead Roll No
      { wch: 26 }, // Email
      { wch: 16 }, // Phone
      { wch: 20 }, // M2 Name
      { wch: 16 }, // M2 Roll
      { wch: 20 }, // M3 Name
      { wch: 16 }, // M3 Roll
      { wch: 20 }, // M4 Name
      { wch: 16 }, // M4 Roll
      { wch: 20 }, // M5 Name
      { wch: 16 }, // M5 Roll
      { wch: 50 }  // Summary
    ];
    XLSX.utils.book_append_sheet(wb, ws1, "Team Registrations");

    // Sheet 2
    const ws2 = XLSX.utils.json_to_sheet(problemSummaryRows);
    ws2["!cols"] = [
      { wch: 12 }, // Problem ID
      { wch: 42 }, // Problem Title
      { wch: 14 }, // Problem Type
      { wch: 22 }, // Teams Selected Count
      { wch: 30 }, // Status
      { wch: 60 }  // Teams Assigned
    ];
    XLSX.utils.book_append_sheet(wb, ws2, "Problem Distribution");

    // Sheet 3
    const ws3 = XLSX.utils.json_to_sheet(statsRows);
    ws3["!cols"] = [
      { wch: 45 },
      { wch: 35 }
    ];
    XLSX.utils.book_append_sheet(wb, ws3, "Summary Statistics");

    // Generate filename with timestamp
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Campus_Hackathon_Teams_and_Problems_${dateStr}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fileName);
    return true;
  },

  // 2. EXPORT TO CSV
  exportToCSV() {
    const registrations = StorageManager.getRegistrations();
    if (registrations.length === 0) {
      alert("No registrations found to export!");
      return false;
    }

    const headers = [
      "S.No",
      "Registration ID",
      "Timestamp",
      "Team Name",
      "Problem ID",
      "Problem Title",
      "Problem Type",
      "Team Lead Name",
      "Team Lead Roll No",
      "Lead Email",
      "Lead Phone",
      "Member 2 Name",
      "Member 2 Roll No",
      "Member 3 Name",
      "Member 3 Roll No",
      "Member 4 Name",
      "Member 4 Roll No",
      "All Team Members"
    ];

    const rows = registrations.map((r, idx) => {
      const m2 = r.members && r.members[0] ? r.members[0] : { name: "", rollNo: "" };
      const m3 = r.members && r.members[1] ? r.members[1] : { name: "", rollNo: "" };
      const m4 = r.members && r.members[2] ? r.members[2] : { name: "", rollNo: "" };

      const memberListStr = [
        `${r.leadName} (${r.leadRollNo}) [Lead]`,
        ...(r.members || []).filter(m => m.name.trim()).map((m, i) => `${m.name} (${m.rollNo})`)
      ].join(" | ");

      const escapeCSV = (val) => {
        const str = String(val == null ? "" : val);
        if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        idx + 1,
        escapeCSV(r.id),
        escapeCSV(r.timestamp),
        escapeCSV(r.teamName),
        escapeCSV(r.problemId),
        escapeCSV(r.problemTitle),
        escapeCSV(r.isOddProblem ? "ODD" : "EVEN"),
        escapeCSV(r.leadName),
        escapeCSV(r.leadRollNo),
        escapeCSV(r.leadEmail || ""),
        escapeCSV(r.leadPhone || ""),
        escapeCSV(m2.name),
        escapeCSV(m2.rollNo),
        escapeCSV(m3.name),
        escapeCSV(m3.rollNo),
        escapeCSV(m4.name),
        escapeCSV(m4.rollNo),
        escapeCSV(memberListStr)
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `Campus_Hackathon_Teams_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },

  // 3. GENERATE GOOGLE NOTES / KEEP FORMATTED CONTENT
  generateGoogleNotesText() {
    const registrations = StorageManager.getRegistrations();
    const analytics = StorageManager.getAnalytics();
    const dateStr = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    let note = `📝 ADVANCED AI CAMPUS HACKATHON — TEAM & PROBLEM ROSTER\n`;
    note += `Generated on: ${dateStr}\n`;
    note += `--------------------------------------------------------\n\n`;

    // Analytics summary
    note += `📊 EXECUTIVE SUMMARY\n`;
    note += `• Total Teams: ${analytics.totalTeams}\n`;
    note += `• Total Participants: ${analytics.totalMembersCount}\n`;
    note += `• Odd-Numbered Problems Chosen: ${analytics.oddCount} (${analytics.oddPercentage}%)\n`;
    note += `• Even-Numbered Problems Chosen: ${analytics.evenCount} (${analytics.evenPercentage}%)\n`;
    note += `• Unique Problems Selected: ${analytics.uniqueProblemsChosenCount} / 22\n\n`;

    // Problem statements with duplicate choices alert
    if (analytics.sameProblemSelections.length > 0) {
      note += `⚠️ PROBLEMS CHOSEN BY MULTIPLE TEAMS (SAME PROBLEM COUNT):\n`;
      analytics.sameProblemSelections.forEach(sp => {
        const typeStr = sp.isOdd ? "[ODD]" : "[EVEN]";
        note += `• ${sp.id} ${typeStr}: ${sp.title} (${sp.count} TEAMS)\n`;
        sp.teams.forEach(t => {
          note += `   ↳ Team: ${t.teamName} (Lead Roll: ${t.leadRollNo})\n`;
        });
      });
      note += `\n`;
    }

    // Full Team Listing
    note += `👥 REGISTERED TEAMS & MEMBERS\n`;
    registrations.forEach((r, idx) => {
      const typeStr = r.isOddProblem ? "ODD" : "EVEN";
      note += `\n[Team #${idx + 1}] ${r.teamName.toUpperCase()}\n`;
      note += `🎯 Problem: [${r.problemId}] ${r.problemTitle} (${typeStr})\n`;
      note += `👑 Team Lead: ${r.leadName} | Roll No: ${r.leadRollNo}\n`;
      if (r.leadEmail || r.leadPhone) {
        note += `   Contact: ${r.leadEmail || "N/A"} | ${r.leadPhone || "N/A"}\n`;
      }
      note += `🤝 Team Members:\n`;
      if (r.members && r.members.length > 0) {
        let count = 0;
        r.members.forEach(m => {
          if (m.name.trim()) {
            count++;
            note += `   • ${m.name} (Roll No: ${m.rollNo})\n`;
          }
        });
        if (count === 0) {
          note += `   • Solo registration (No additional members)\n`;
        }
      } else {
        note += `   • Solo registration\n`;
      }
    });

    note += `\n--------------------------------------------------------\n`;
    note += `Tip: Copy and paste this directly into Google Keep (keep.google.com) or Google Docs for instant team notes!\n`;

    return note;
  },

  // 4. DOWNLOAD GOOGLE NOTES AS TEXT / MARKDOWN FILE
  downloadGoogleNotesFile() {
    const text = this.generateGoogleNotesText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `Google_Notes_Hackathon_Roster_${dateStr}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },

  // 5. COPY GOOGLE NOTES TO CLIPBOARD
  async copyGoogleNotesToClipboard() {
    const text = this.generateGoogleNotesText();
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    }
  }
};

