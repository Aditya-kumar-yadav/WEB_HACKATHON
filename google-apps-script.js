/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT FOR CAMPUS HACKATHON
 * ==============================================================================
 * This script connects your GitHub-hosted Hackathon website directly to Google Sheets!
 * When any team registers on your website, it instantly logs the team lead,
 * roll number, team members, and problem statement into your Google Sheet.
 * 
 * ------------------------------------------------------------------------------
 * STEP-BY-STEP SETUP INSTRUCTIONS (Takes only 2 minutes):
 * ------------------------------------------------------------------------------
 * 1. Open Google Sheets (https://sheets.new) and create a new blank spreadsheet.
 * 2. Name your spreadsheet: "Campus Hackathon Registrations 2026".
 * 3. In the top menu, click: Extensions > Apps Script.
 * 4. Delete any code inside Code.gs, and PASTE THIS ENTIRE SCRIPT.
 * 5. Click the "Save" (disk) icon.
 * 6. Click the blue "Deploy" button (top right) -> Select "New deployment".
 * 7. Click the gear icon next to "Select type" and choose "Web app".
 * 8. Set the fields:
 *      - Description: "Hackathon Registration Webhook"
 *      - Execute as: "Me (your email)"
 *      - Who has access: "Anyone" (IMPORTANT: allows students from anywhere to submit)
 * 9. Click "Deploy" -> Click "Authorize access" -> Choose your Google Account ->
 *    Click "Advanced" -> Click "Go to Untitled project (unsafe)" -> Click "Allow".
 * 10. Copy the "Web app URL" (it ends with /exec).
 * 11. Open your Hackathon website, click "Admin Dashboard" -> "Google Sheets Sync",
 *     paste your URL and click Save! That's it!
 * ==============================================================================
 */

// Handle incoming POST requests from the website
function doPost(e) {
  try {
    var sheet = getOrCreateRegistrationSheet();
    var contents = JSON.parse(e.postData.contents);
    var data = contents.data;

    if (!data) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No data payload" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var m2 = (data.members && data.members[0]) ? data.members[0] : { name: "", rollNo: "" };
    var m3 = (data.members && data.members[1]) ? data.members[1] : { name: "", rollNo: "" };
    var m4 = (data.members && data.members[2]) ? data.members[2] : { name: "", rollNo: "" };
    var m5 = (data.members && data.members[3]) ? data.members[3] : { name: "", rollNo: "" };

    var membersSummary = "Lead: " + data.leadName + " (" + data.leadRollNo + ")";
    if (data.members) {
      data.members.forEach(function(m, i) {
        if (m.name) {
          membersSummary += " | M" + (i + 2) + ": " + m.name + " (" + m.rollNo + ")";
        }
      });
    }

    var row = [
      data.id || ("REG-" + Utilities.getUuid().substring(0, 6).toUpperCase()),
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.teamName || "",
      data.problemId || "",
      data.problemTitle || "",
      data.isOddProblem ? "ODD" : "EVEN",
      data.leadName || "",
      data.leadRollNo || "",
      data.leadEmail || "",
      data.leadPhone || "",
      m2.name || "",
      m2.rollNo || "",
      m3.name || "",
      m3.rollNo || "",
      m4.name || "",
      m4.rollNo || "",
      m5.name || "",
      m5.rollNo || "",
      membersSummary
    ];

    sheet.appendRow(row);

    // Format new row styling
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, row.length).setVerticalAlignment("middle");
    if (data.isOddProblem) {
      sheet.getRange(lastRow, 6).setBackground("#ede9fe").setFontColor("#5b21b6"); // Light purple for Odd
    } else {
      sheet.getRange(lastRow, 6).setBackground("#ecfdf5").setFontColor("#065f46"); // Light green for Even
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Registration saved" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (returns summary of registrations if fetched)
function doGet(e) {
  try {
    var sheet = getOrCreateRegistrationSheet();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ registrations: [], count: 0 }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var headers = data[0];
    var registrations = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      registrations.push({
        id: row[0],
        timestamp: row[1],
        teamName: row[2],
        problemId: row[3],
        problemTitle: row[4],
        isOddProblem: row[5] === "ODD",
        leadName: row[6],
        leadRollNo: row[7],
        leadEmail: row[8],
        leadPhone: row[9]
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      registrations: registrations,
      count: registrations.length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper to set up sheet with headers and formatting
function getOrCreateRegistrationSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Registrations");

  if (!sheet) {
    sheet = ss.insertSheet("Registrations", 0);
    var headers = [
      "Reg ID",
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
      "Member 5 Name",
      "Member 5 Roll No",
      "Full Team Roster"
    ];

    sheet.appendRow(headers);

    // Style the header row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e293b")
               .setFontColor("#ffffff")
               .setFontWeight("bold")
               .setHorizontalAlignment("center")
               .setWrap(true);
    sheet.setFrozenRows(1);

    // Auto-adjust column widths
    for (var col = 1; col <= headers.length; col++) {
      sheet.autoResizeColumn(col);
    }
  }

  return sheet;
}
