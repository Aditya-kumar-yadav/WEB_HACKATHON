/**
 * Advanced AI Campus Hackathon — Main Application Logic
 * Coordinates UI interactions, odd/even problem counters,
 * dynamic forms, analytics, and exports.
 */

// Application State
let currentSelectedProblemId = null;
let currentProblemFilter = "all";
let currentCatalogueFilter = "all";
let currentSearchQuery = "";
let currentCatalogueSearch = "";

// Initialize App on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  // If no registrations exist yet, seed demo data for instant out-of-the-box demonstration!
  const existing = StorageManager.getRegistrations();
  if (!existing || existing.length === 0) {
    StorageManager.seedDemoData();
  }

  // Render initial views
  renderProblemsList();
  renderCatalogue();
  updateAnalyticsUI();
  renderRegistrationsTable();
  checkActiveSession();
  checkAdminDashboardView();

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Listen for storage events across tabs
  window.addEventListener("hackathon_data_updated", () => {
    renderProblemsList();
    renderCatalogue();
    updateAnalyticsUI();
    renderRegistrationsTable();
    checkActiveSession();
  });

  // Listen for admin auth change
  window.addEventListener("hackathon_admin_auth_changed", () => {
    checkAdminDashboardView();
  });
});

// ============================================================================
// TAB NAVIGATION
// ============================================================================
function switchTab(tabId) {
  const tabs = ["register", "catalogue", "dashboard"];
  tabs.forEach(tab => {
    const section = document.getElementById(`tab-${tab}`);
    const navBtn = document.getElementById(`nav-${tab}-btn`);
    if (tab === tabId) {
      section.classList.remove("hidden");
      navBtn.classList.remove("text-gray-300", "hover:text-white", "hover:bg-gray-800");
      navBtn.classList.add("bg-indigo-600", "text-white", "shadow-sm");
    } else {
      section.classList.add("hidden");
      navBtn.classList.remove("bg-indigo-600", "text-white", "shadow-sm");
      navBtn.classList.add("text-gray-300", "hover:text-white", "hover:bg-gray-800");
    }
  });

  if (tabId === "dashboard") {
    checkAdminDashboardView();
  } else if (tabId === "catalogue") {
    renderCatalogue();
  } else if (tabId === "register") {
    renderProblemsList();
  }

  if (window.lucide) window.lucide.createIcons();
}

// ============================================================================
// ORGANIZER ADMIN AUTHENTICATION (Excel & Master Roster Protection)
// ============================================================================
function checkAdminDashboardView() {
  const isAuth = AdminAuth.isAuthenticated();
  const lockedView = document.getElementById("admin-login-view");
  const unlockedView = document.getElementById("admin-authenticated-view");
  const navLockIcon = document.getElementById("nav-lock-icon");
  const navText = document.getElementById("nav-dashboard-text");
  const headerPill = document.getElementById("header-admin-pill");

  if (isAuth) {
    if (lockedView) lockedView.classList.add("hidden");
    if (unlockedView) unlockedView.classList.remove("hidden");
    if (navLockIcon) {
      navLockIcon.setAttribute("data-lucide", "unlock");
      navLockIcon.className = "w-4 h-4 text-emerald-400";
    }
    if (navText) navText.textContent = "Admin Console";
    if (headerPill) {
      headerPill.innerHTML = `
        <div class="flex items-center space-x-2">
          <span class="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
            <span class="hidden sm:inline">Organizer Active</span>
          </span>
          <button onclick="handleAdminLogout()" class="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 border border-gray-700 flex items-center space-x-1 transition-colors">
            <i data-lucide="lock" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>Lock</span>
          </button>
        </div>
      `;
    }
    updateAnalyticsUI();
    renderRegistrationsTable();
  } else {
    if (lockedView) lockedView.classList.remove("hidden");
    if (unlockedView) unlockedView.classList.add("hidden");
    if (navLockIcon) {
      navLockIcon.setAttribute("data-lucide", "lock");
      navLockIcon.className = "w-4 h-4 text-amber-400";
    }
    if (navText) navText.textContent = "Organizer Portal";
    if (headerPill) {
      headerPill.innerHTML = `
        <button onclick="switchTab('dashboard')" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800/80 text-gray-300 border border-gray-700 hover:border-gray-600 transition-all">
          <i data-lucide="lock" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>Organizer Login</span>
        </button>
      `;
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function handleAdminLogin(e) {
  if (e) e.preventDefault();
  const input = document.getElementById("admin-passcode-input");
  const errorMsg = document.getElementById("admin-login-error");
  const pass = input ? input.value : "";

  if (AdminAuth.login(pass)) {
    if (input) input.value = "";
    if (errorMsg) errorMsg.classList.add("hidden");
    checkAdminDashboardView();
  } else {
    if (errorMsg) {
      errorMsg.textContent = "❌ Incorrect password! Default is admin2026";
      errorMsg.classList.remove("hidden");
    } else {
      alert("❌ Incorrect password! Default is admin2026");
    }
    if (input) {
      input.focus();
      input.select();
    }
  }
}

function handleAdminLogout() {
  AdminAuth.logout();
  checkAdminDashboardView();
  alert("🔒 You have been logged out. The Excel export and roster are now locked.");
}

function togglePasscodeVisibility() {
  const input = document.getElementById("admin-passcode-input");
  const icon = document.getElementById("toggle-eye-icon");
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    if (icon) icon.setAttribute("data-lucide", "eye-off");
  } else {
    input.type = "password";
    if (icon) icon.setAttribute("data-lucide", "eye");
  }
  if (window.lucide) window.lucide.createIcons();
}

function openChangePasswordModal() {
  const modal = document.getElementById("change-password-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeChangePasswordModal() {
  const modal = document.getElementById("change-password-modal");
  if (modal) modal.classList.add("hidden");
}

function saveNewAdminPassword(e) {
  if (e) e.preventDefault();
  const currentInput = document.getElementById("curr-admin-pass");
  const newInput = document.getElementById("new-admin-pass");
  const confirmInput = document.getElementById("confirm-admin-pass");

  if (!AdminAuth.isAuthenticated()) {
    alert("You must be logged in as organizer to change the password.");
    return;
  }

  const currentPass = currentInput.value.trim();
  const newPass = newInput.value.trim();
  const confirmPass = confirmInput.value.trim();

  if (currentPass !== AdminAuth.getPassword()) {
    alert("Current password does not match.");
    currentInput.focus();
    return;
  }

  if (newPass.length < 4) {
    alert("New password must be at least 4 characters.");
    newInput.focus();
    return;
  }

  if (newPass !== confirmPass) {
    alert("New passwords do not match.");
    confirmInput.focus();
    return;
  }

  AdminAuth.setPassword(newPass);
  closeChangePasswordModal();
  currentInput.value = "";
  newInput.value = "";
  confirmInput.value = "";
  alert("✓ Password updated successfully! Keep this password safe.");
}

// ============================================================================
// DYNAMIC MEMBER FIELDS (STEP 1)
// ============================================================================
function addMemberField() {
  const container = document.getElementById("members-container");
  const currentCount = container.querySelectorAll(".member-row").length;

  if (currentCount >= 4) {
    alert("Maximum team size is 5 members (1 Team Lead + 4 Team Members).");
    return;
  }

  const memberNumber = currentCount + 2; // #2, #3, #4, #5
  const row = document.createElement("div");
  row.className = "member-row flex items-center gap-2 p-2 rounded-lg bg-gray-900/60 border border-gray-800 transition-all";
  row.setAttribute("data-member-index", currentCount);
  row.innerHTML = `
    <span class="text-xs font-bold text-gray-500 w-6 text-center">#${memberNumber}</span>
    <input type="text" placeholder="Member ${memberNumber} Name" class="member-name flex-1 px-2.5 py-1.5 bg-gray-800/90 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:border-indigo-500">
    <input type="text" placeholder="Roll No" class="member-roll w-28 px-2.5 py-1.5 bg-gray-800/90 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:border-indigo-500 uppercase">
    <button type="button" onclick="removeMemberField(this)" class="p-1 text-gray-500 hover:text-rose-400 transition-colors" title="Remove Member">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;
  container.appendChild(row);

  if (window.lucide) window.lucide.createIcons();
}

function removeMemberField(btn) {
  const container = document.getElementById("members-container");
  const row = btn.closest(".member-row");
  if (row) {
    row.remove();
    // Re-index remaining rows
    const rows = container.querySelectorAll(".member-row");
    rows.forEach((r, idx) => {
      const num = idx + 2;
      r.querySelector("span").textContent = `#${num}`;
      r.querySelector(".member-name").placeholder = `Member ${num} Name`;
    });
  }
}

// ============================================================================
// PROBLEM SELECTION & RENDERING (STEP 2)
// ============================================================================
function filterProblems(filterType) {
  currentProblemFilter = filterType;
  document.querySelectorAll(".filter-btn").forEach(btn => {
    if (btn.getAttribute("data-filter") === filterType) {
      btn.className = "filter-btn active px-2.5 py-1 rounded bg-indigo-600 text-white font-medium";
    } else {
      btn.className = "filter-btn px-2.5 py-1 rounded text-gray-300 hover:text-white";
    }
  });
  renderProblemsList();
}

function handleProblemSearch(query) {
  currentSearchQuery = query.toLowerCase().trim();
  renderProblemsList();
}

function renderProblemsList() {
  const container = document.getElementById("problems-grid");
  if (!container) return;

  const analytics = StorageManager.getAnalytics();
  let filtered = PROBLEM_STATEMENTS.slice();

  // Filter tab
  if (currentProblemFilter === "odd") {
    filtered = filtered.filter(p => p.isOdd);
  } else if (currentProblemFilter === "even") {
    filtered = filtered.filter(p => !p.isOdd);
  } else if (currentProblemFilter === "recommended") {
    filtered = filtered.filter(p => p.isRecommended);
  }

  // Search filter
  if (currentSearchQuery) {
    filtered = filtered.filter(p => {
      return (
        p.id.toLowerCase().includes(currentSearchQuery) ||
        p.title.toLowerCase().includes(currentSearchQuery) ||
        p.description.toLowerCase().includes(currentSearchQuery) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(currentSearchQuery)))
      );
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 glass-panel p-6 border-dashed border-gray-800">
        <i data-lucide="search-x" class="w-8 h-8 text-gray-500 mx-auto mb-2"></i>
        <p class="text-sm text-gray-400">No problem statements match your filter.</p>
        <button onclick="filterProblems('all'); document.getElementById('problem-search').value='';" class="mt-2 text-xs text-indigo-400 hover:underline">Reset Filters</button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(p => {
    const selectedTeams = analytics.problemMap[p.id] || [];
    const count = selectedTeams.length;
    const isSelected = currentSelectedProblemId === p.id;

    // Badges based on count
    let countBadgeHtml = "";
    if (count === 0) {
      countBadgeHtml = `<span class="badge-available text-[11px] px-2 py-0.5 rounded-full font-medium">Available (0 teams)</span>`;
    } else if (count === 1) {
      countBadgeHtml = `<span class="badge-single-count text-[11px] px-2 py-0.5 rounded-full font-medium">Selected by 1 team</span>`;
    } else {
      // Multiple teams chosen same problem!
      countBadgeHtml = `<span class="badge-same-count text-[11px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
        <i data-lucide="layers" class="w-3 h-3"></i>
        <span>Same Problem Chosen: ${count} Teams</span>
      </span>`;
    }

    const typeBadge = p.isOdd 
      ? `<span class="badge-odd text-[11px] px-2.5 py-0.5 rounded-full font-semibold">ODD Problem #${p.num.toString().padStart(2, '0')}</span>`
      : `<span class="badge-even text-[11px] px-2.5 py-0.5 rounded-full font-semibold">EVEN Problem #${p.num.toString().padStart(2, '0')}</span>`;

    const recommendedBadge = p.isRecommended
      ? `<span class="badge-recommended text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
          <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
          <span>Recommended High-Impact</span>
        </span>`
      : "";

    const cardClass = `problem-card glass-panel p-4 rounded-xl cursor-pointer ${p.isOdd ? 'is-odd' : 'is-even'} ${isSelected ? 'selected' : ''}`;

    return `
      <div class="${cardClass}" onclick="selectProblemStatement('${p.id}')">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="font-mono text-xs font-bold text-white bg-gray-800 px-2 py-0.5 rounded">${p.id}</span>
            ${typeBadge}
            ${recommendedBadge}
          </div>
          <div class="shrink-0">
            ${countBadgeHtml}
          </div>
        </div>

        <h3 class="text-sm font-bold text-white mb-1.5 ${isSelected ? 'text-indigo-300' : ''}">
          ${p.title}
        </h3>

        <p class="text-xs text-gray-300 leading-relaxed mb-3">
          ${p.description}
        </p>

        <div class="flex items-center justify-between pt-2 border-t border-gray-800/80">
          <div class="flex flex-wrap items-center gap-1 text-[10px] text-gray-400">
            ${(p.tags || []).map(t => `<span class="bg-gray-800/80 px-2 py-0.5 rounded">${t}</span>`).join("")}
          </div>

          <button type="button" class="text-xs font-medium px-3 py-1 rounded-lg transition-colors flex items-center space-x-1.5 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}">
            <i data-lucide="${isSelected ? 'check-circle' : 'circle'}" class="w-3.5 h-3.5"></i>
            <span>${isSelected ? 'Selected' : 'Choose This'}</span>
          </button>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();
}

function selectProblemStatement(problemId) {
  const p = getProblemById(problemId);
  if (!p) return;

  currentSelectedProblemId = problemId;
  renderProblemsList();

  // Update left preview box
  const preview = document.getElementById("selected-problem-preview");
  const typeStr = p.isOdd ? "ODD Problem" : "EVEN Problem";
  const typeClass = p.isOdd ? "text-purple-400" : "text-emerald-400";

  preview.className = "p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/50 flex items-center justify-between";
  preview.innerHTML = `
    <div class="space-y-0.5">
      <div class="flex items-center space-x-2">
        <span class="font-mono text-xs font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded">${p.id}</span>
        <span class="text-xs font-bold ${typeClass}">[${typeStr}]</span>
      </div>
      <p class="text-xs font-semibold text-white truncate max-w-[280px]">${p.title}</p>
    </div>
    <span class="text-xs px-2 py-1 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
      <i data-lucide="check" class="w-3 h-3"></i>
      <span>Selected</span>
    </span>
  `;

  if (window.lucide) window.lucide.createIcons();
}

// ============================================================================
// SUBMIT REGISTRATION
// ============================================================================
function submitTeamRegistration() {
  const teamNameInput = document.getElementById("team-name");
  const leadNameInput = document.getElementById("lead-name");
  const leadRollInput = document.getElementById("lead-roll");
  const leadEmailInput = document.getElementById("lead-email");
  const leadPhoneInput = document.getElementById("lead-phone");

  const teamName = teamNameInput.value.trim();
  const leadName = leadNameInput.value.trim();
  const leadRollNo = leadRollInput.value.trim().toUpperCase();
  const leadEmail = leadEmailInput.value.trim();
  const leadPhone = leadPhoneInput.value.trim();

  // Validation
  if (!teamName) {
    alert("Please enter your Team Name.");
    teamNameInput.focus();
    return;
  }
  if (!leadName) {
    alert("Please enter Team Lead Name.");
    leadNameInput.focus();
    return;
  }
  if (!leadRollNo) {
    alert("Please enter Team Lead Roll Number.");
    leadRollInput.focus();
    return;
  }
  if (!currentSelectedProblemId) {
    alert("Please select a Problem Statement from the right catalogue!");
    return;
  }

  // Collect team members
  const memberRows = document.querySelectorAll(".member-row");
  const members = [];
  const rollSet = new Set();
  rollSet.add(leadRollNo);

  for (const row of memberRows) {
    const mName = row.querySelector(".member-name").value.trim();
    const mRoll = row.querySelector(".member-roll").value.trim().toUpperCase();

    if (mName || mRoll) {
      if (!mName || !mRoll) {
        alert("Please provide both Name and Roll Number for all added team members.");
        return;
      }
      if (rollSet.has(mRoll)) {
        alert(`Duplicate roll number detected: ${mRoll} cannot be listed twice in the same team!`);
        return;
      }
      rollSet.add(mRoll);
      members.push({ name: mName, rollNo: mRoll });
    }
  }

  const problem = getProblemById(currentSelectedProblemId);

  const registrationData = {
    teamName,
    leadName,
    leadRollNo,
    leadEmail,
    leadPhone,
    members,
    problemId: problem.id,
    problemTitle: problem.title,
    isOddProblem: problem.isOdd
  };

  try {
    const saved = StorageManager.addRegistration(registrationData);

    // Refresh UI
    updateAnalyticsUI();
    renderRegistrationsTable();
    renderProblemsList();
    renderCatalogue();
    checkActiveSession();

    // Show Slip Modal
    openSlipModal(saved);

    // Reset Form for next if needed
    teamNameInput.value = "";
    leadNameInput.value = "";
    leadRollInput.value = "";
    leadEmailInput.value = "";
    leadPhoneInput.value = "";
    currentSelectedProblemId = null;

    const preview = document.getElementById("selected-problem-preview");
    preview.className = "p-3 rounded-lg bg-gray-900/90 border border-dashed border-gray-700 flex items-center justify-between";
    preview.innerHTML = `
      <div class="flex items-center space-x-2.5">
        <span class="w-7 h-7 rounded-md bg-gray-800 text-gray-400 flex items-center justify-center text-xs font-mono">?</span>
        <span class="text-xs text-gray-400">Please choose a problem statement from the list on the right 👉</span>
      </div>
    `;

  } catch (error) {
    alert(error.message);
  }
}

// ============================================================================
// REGISTRATION SLIP / RECEIPT MODAL
// ============================================================================
function openSlipModal(reg) {
  const modal = document.getElementById("slip-modal");
  const content = document.getElementById("slip-details-content");
  if (!modal || !content) return;

  const typeStr = reg.isOddProblem ? "ODD PROBLEM" : "EVEN PROBLEM";
  const typeBadgeClass = reg.isOddProblem ? "badge-odd" : "badge-even";
  const dateStr = new Date(reg.timestamp).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "medium"
  });

  const memberRowsHtml = (reg.members && reg.members.length > 0)
    ? reg.members.map((m, i) => `
        <div class="flex items-center justify-between py-1.5 border-b border-gray-800">
          <span class="text-gray-400">Member #${i + 2}:</span>
          <span class="font-medium text-white">${m.name} <strong class="text-indigo-400 font-mono">(${m.rollNo})</strong></span>
        </div>
      `).join("")
    : `<div class="text-gray-500 py-1 italic">Solo team (No additional members)</div>`;

  content.innerHTML = `
    <!-- Slip Meta Box -->
    <div class="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-[11px]">
      <div>
        <span class="text-gray-500 block">Registration Token:</span>
        <span class="font-mono font-bold text-white text-xs">${reg.id}</span>
      </div>
      <div>
        <span class="text-gray-500 block">Date & Time:</span>
        <span class="text-gray-300">${dateStr}</span>
      </div>
    </div>

    <!-- Chosen Problem Highlight -->
    <div class="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
      <div class="flex items-center justify-between">
        <span class="font-mono text-xs font-bold text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded">${reg.problemId}</span>
        <span class="${typeBadgeClass} text-[10px] font-bold px-2 py-0.5 rounded-full">${typeStr}</span>
      </div>
      <h4 class="text-sm font-bold text-white pt-1">${reg.problemTitle}</h4>
    </div>

    <!-- Team Details -->
    <div class="space-y-1.5 p-3 rounded-xl bg-gray-900/60 border border-gray-800">
      <div class="flex items-center justify-between py-1 border-b border-gray-800">
        <span class="text-gray-400">Team Name:</span>
        <span class="font-bold text-white text-sm">${reg.teamName}</span>
      </div>
      <div class="flex items-center justify-between py-1.5 border-b border-gray-800">
        <span class="text-gray-400">👑 Team Lead:</span>
        <span class="font-semibold text-white">${reg.leadName} <strong class="text-indigo-400 font-mono">(${reg.leadRollNo})</strong></span>
      </div>
      ${reg.leadEmail ? `
      <div class="flex items-center justify-between py-1 border-b border-gray-800">
        <span class="text-gray-400">Lead Email:</span>
        <span class="text-gray-300 font-mono">${reg.leadEmail}</span>
      </div>` : ""}
      ${memberRowsHtml}
    </div>

    <p class="text-[11px] text-gray-500 text-center">
      ✓ Team roster saved. You can print this slip or export the entire master roster into Excel.
    </p>
  `;

  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeSlipModal() {
  const modal = document.getElementById("slip-modal");
  if (modal) modal.classList.add("hidden");
}

function printTeamSlip() {
  window.print();
}

function checkActiveSession() {
  const banner = document.getElementById("active-session-banner");
  const summary = document.getElementById("active-session-summary");
  const session = StorageManager.getCurrentSession();

  if (session && banner && summary) {
    summary.textContent = `Team: ${session.teamName} | Lead: ${session.leadName} (${session.leadRollNo}) | Selected: [${session.problemId}] ${session.problemTitle}`;
    banner.classList.remove("hidden");
  } else if (banner) {
    banner.classList.add("hidden");
  }
}

function viewActiveTeamSlip() {
  const session = StorageManager.getCurrentSession();
  if (session) {
    openSlipModal(session);
  }
}

function logoutActiveSession() {
  StorageManager.clearCurrentSession();
  checkActiveSession();
}

// ============================================================================
// CATALOGUE TAB (TAB 2)
// ============================================================================
function filterCatalogue(catType) {
  currentCatalogueFilter = catType;
  document.querySelectorAll(".cat-filter").forEach(btn => {
    if (btn.getAttribute("data-cat") === catType) {
      btn.className = "cat-filter active px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white";
    } else {
      btn.className = "cat-filter px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:text-white";
    }
  });
  renderCatalogue();
}

function handleCatalogueSearch(val) {
  currentCatalogueSearch = val.toLowerCase().trim();
  renderCatalogue();
}

function renderCatalogue() {
  const container = document.getElementById("catalogue-grid");
  if (!container) return;

  const analytics = StorageManager.getAnalytics();
  let list = PROBLEM_STATEMENTS.slice();

  if (currentCatalogueFilter === "odd") {
    list = list.filter(p => p.isOdd);
  } else if (currentCatalogueFilter === "even") {
    list = list.filter(p => !p.isOdd);
  } else if (currentCatalogueFilter === "recommended") {
    list = list.filter(p => p.isRecommended);
  }

  if (currentCatalogueSearch) {
    list = list.filter(p => {
      return (
        p.id.toLowerCase().includes(currentCatalogueSearch) ||
        p.title.toLowerCase().includes(currentCatalogueSearch) ||
        p.description.toLowerCase().includes(currentCatalogueSearch)
      );
    });
  }

  container.innerHTML = list.map(p => {
    const teams = analytics.problemMap[p.id] || [];
    const count = teams.length;

    const typeBadge = p.isOdd
      ? `<span class="badge-odd text-[10px] px-2 py-0.5 rounded-full font-semibold">ODD #${p.num}</span>`
      : `<span class="badge-even text-[10px] px-2 py-0.5 rounded-full font-semibold">EVEN #${p.num}</span>`;

    const recommendedBadge = p.isRecommended
      ? `<span class="badge-recommended text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">⭐ High-Impact</span>`
      : "";

    let statusPill = "";
    if (count === 0) {
      statusPill = `<span class="text-[10px] text-gray-500">0 teams</span>`;
    } else if (count === 1) {
      statusPill = `<span class="text-[10px] text-blue-400 font-semibold">1 team chosen</span>`;
    } else {
      statusPill = `<span class="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">${count} teams (Same PS)</span>`;
    }

    return `
      <div class="glass-panel p-5 border border-gray-800 rounded-xl space-y-3 flex flex-col justify-between ${p.isOdd ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-emerald-500'}">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center space-x-1.5">
              <span class="font-mono text-xs font-bold text-white bg-gray-800 px-2 py-0.5 rounded">${p.id}</span>
              ${typeBadge}
              ${recommendedBadge}
            </div>
            ${statusPill}
          </div>

          <h3 class="text-sm font-bold text-white">${p.title}</h3>
          <p class="text-xs text-gray-400 leading-relaxed">${p.description}</p>
        </div>

        <div class="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
          <span class="text-[11px] text-gray-500">${p.category} Catalogue</span>
          <button onclick="switchTab('register'); selectProblemStatement('${p.id}');" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1">
            <span>Select This</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();
}

// ============================================================================
// DASHBOARD ANALYTICS & KPI METRICS (TAB 3)
// ============================================================================
function updateAnalyticsUI() {
  const analytics = StorageManager.getAnalytics();

  // Strip elements
  const stripOdd = document.getElementById("strip-odd-count");
  const stripEven = document.getElementById("strip-even-count");
  const stripSameText = document.getElementById("strip-same-count-text");
  const headerCountBadge = document.getElementById("header-teams-count-badge");

  if (stripOdd) stripOdd.textContent = `${analytics.oddCount} (${analytics.oddPercentage}%)`;
  if (stripEven) stripEven.textContent = `${analytics.evenCount} (${analytics.evenPercentage}%)`;
  if (stripSameText) {
    stripSameText.textContent = `Same-Problem Count: ${analytics.sameProblemSelections.length} collisions`;
  }
  if (headerCountBadge) headerCountBadge.textContent = analytics.totalTeams;

  // KPI cards
  const statTotal = document.getElementById("stat-total-teams");
  const statMembers = document.getElementById("stat-total-members");
  const statOdd = document.getElementById("stat-odd-count");
  const statOddPct = document.getElementById("stat-odd-pct");
  const statEven = document.getElementById("stat-even-count");
  const statEvenPct = document.getElementById("stat-even-pct");
  const statSame = document.getElementById("stat-same-count");

  if (statTotal) statTotal.textContent = analytics.totalTeams;
  if (statMembers) statMembers.textContent = analytics.totalMembersCount;
  if (statOdd) statOdd.textContent = analytics.oddCount;
  if (statOddPct) statOddPct.textContent = analytics.oddPercentage;
  if (statEven) statEven.textContent = analytics.evenCount;
  if (statEvenPct) statEvenPct.textContent = analytics.evenPercentage;
  if (statSame) statSame.textContent = analytics.sameProblemSelections.length;

  // Odd vs Even progress bar
  const oddBar = document.getElementById("odd-progress-bar");
  const evenBar = document.getElementById("even-progress-bar");
  const oddBarPct = document.getElementById("odd-bar-pct");
  const evenBarPct = document.getElementById("even-bar-pct");
  const balanceText = document.getElementById("balance-ratio-text");

  const total = analytics.totalTeams;
  const oddRatio = total > 0 ? (analytics.oddCount / total) * 100 : 50;
  const evenRatio = total > 0 ? (analytics.evenCount / total) * 100 : 50;

  if (oddBar) oddBar.style.width = `${oddRatio}%`;
  if (evenBar) evenBar.style.width = `${evenRatio}%`;
  if (oddBarPct) oddBarPct.textContent = `${analytics.oddPercentage}%`;
  if (evenBarPct) evenBarPct.textContent = `${analytics.evenPercentage}%`;
  if (balanceText) {
    balanceText.textContent = `Odd: ${analytics.oddCount} teams | Even: ${analytics.evenCount} teams`;
  }

  // Render Same-Problem Tracking Breakdown
  renderSameProblemsList(analytics.sameProblemSelections);
}

function renderSameProblemsList(sameProblems) {
  const container = document.getElementById("same-problems-list");
  const tag = document.getElementById("same-problems-count-tag");
  if (!container) return;

  if (tag) tag.textContent = `${sameProblems.length} Problem Collisions`;

  if (sameProblems.length === 0) {
    container.innerHTML = `
      <div class="text-xs text-gray-400 italic py-3 bg-gray-900/40 rounded-lg p-3 border border-gray-800">
        ✓ Great balance! No problem statement has been chosen by more than one team yet.
      </div>
    `;
    return;
  }

  container.innerHTML = sameProblems.map(sp => {
    const typeBadge = sp.isOdd
      ? `<span class="badge-odd text-[10px] px-2 py-0.5 rounded-full font-bold">ODD</span>`
      : `<span class="badge-even text-[10px] px-2 py-0.5 rounded-full font-bold">EVEN</span>`;

    const teamsHtml = sp.teams.map(t => `
      <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-xs text-gray-200">
        <strong class="text-white">${t.teamName}</strong>
        <span class="text-gray-400 font-mono">(Lead: ${t.leadRollNo})</span>
      </span>
    `).join("");

    return `
      <div class="p-3.5 rounded-xl bg-gray-900/80 border border-amber-500/25 space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="font-mono text-xs font-bold text-white bg-gray-800 px-2 py-0.5 rounded">${sp.id}</span>
            ${typeBadge}
            <h4 class="text-xs font-bold text-white">${sp.title}</h4>
          </div>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
            ${sp.count} Teams Selected Same Problem
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 pt-1">
          <span class="text-xs text-gray-400">Teams:</span>
          ${teamsHtml}
        </div>
      </div>
    `;
  }).join("");
}

// ============================================================================
// REGISTRATIONS TABLE
// ============================================================================
function renderRegistrationsTable() {
  const tbody = document.getElementById("registrations-table-body");
  const emptyState = document.getElementById("table-empty-state");
  const filterType = document.getElementById("table-filter-type") ? document.getElementById("table-filter-type").value : "all";
  const searchInput = document.getElementById("table-search");
  const search = searchInput ? searchInput.value.toLowerCase().trim() : "";

  if (!tbody) return;

  let registrations = StorageManager.getRegistrations();

  // Filter type
  if (filterType === "odd") {
    registrations = registrations.filter(r => r.isOddProblem);
  } else if (filterType === "even") {
    registrations = registrations.filter(r => !r.isOddProblem);
  }

  // Search filter
  if (search) {
    registrations = registrations.filter(r => {
      const teamMatch = r.teamName.toLowerCase().includes(search);
      const leadMatch = r.leadName.toLowerCase().includes(search) || r.leadRollNo.toLowerCase().includes(search);
      const probMatch = r.problemId.toLowerCase().includes(search) || r.problemTitle.toLowerCase().includes(search);
      const memberMatch = r.members && r.members.some(m => m.name.toLowerCase().includes(search) || m.rollNo.toLowerCase().includes(search));
      return teamMatch || leadMatch || probMatch || memberMatch;
    });
  }

  if (registrations.length === 0) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  tbody.innerHTML = registrations.map((r, idx) => {
    const typeBadge = r.isOddProblem
      ? `<span class="badge-odd text-[10px] px-2 py-0.5 rounded font-bold">ODD</span>`
      : `<span class="badge-even text-[10px] px-2 py-0.5 rounded font-bold">EVEN</span>`;

    const membersHtml = (r.members && r.members.length > 0)
      ? r.members.filter(m => m.name.trim()).map(m => `
          <div class="text-[11px] text-gray-300">
            • ${m.name} <span class="text-indigo-400 font-mono">(${m.rollNo})</span>
          </div>
        `).join("")
      : `<span class="text-[11px] text-gray-500 italic">None (Solo)</span>`;

    return `
      <tr class="hover:bg-gray-800/40 transition-colors">
        <td class="py-3 px-3 text-gray-500 font-mono">${idx + 1}</td>
        <td class="py-3 px-3">
          <div class="font-bold text-white text-xs">${r.teamName}</div>
          <div class="text-[10px] text-gray-500 font-mono">${r.id}</div>
        </td>
        <td class="py-3 px-3 max-w-[200px]">
          <div class="font-mono text-[11px] text-indigo-300 font-semibold">${r.problemId}</div>
          <div class="text-xs text-gray-300 truncate" title="${r.problemTitle}">${r.problemTitle}</div>
        </td>
        <td class="py-3 px-3">${typeBadge}</td>
        <td class="py-3 px-3">
          <div class="font-medium text-white text-xs">${r.leadName}</div>
          <div class="text-indigo-400 font-mono text-[11px] font-semibold">${r.leadRollNo}</div>
        </td>
        <td class="py-3 px-3">${membersHtml}</td>
        <td class="py-3 px-3 text-right">
          <div class="flex items-center justify-end space-x-1.5">
            <button onclick="viewSlipById('${r.id}')" title="View Team Slip" class="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded transition-colors">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
            <button onclick="deleteRegistration('${r.id}')" title="Delete Team" class="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded transition-colors">
              <i data-lucide="trash" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();
}

function viewSlipById(id) {
  const list = StorageManager.getRegistrations();
  const reg = list.find(r => r.id === id);
  if (reg) {
    openSlipModal(reg);
  }
}

function deleteRegistration(id) {
  if (confirm("Are you sure you want to remove this team registration?")) {
    StorageManager.deleteRegistration(id);
    updateAnalyticsUI();
    renderRegistrationsTable();
    renderProblemsList();
    renderCatalogue();
  }
}

// ============================================================================
// GOOGLE NOTES / KEEP MODAL
// ============================================================================
function openGoogleNotesModal() {
  const modal = document.getElementById("notes-modal");
  const textarea = document.getElementById("notes-preview-textarea");
  if (!modal || !textarea) return;

  const text = ExportManager.generateGoogleNotesText();
  textarea.value = text;
  modal.classList.remove("hidden");

  const copyBtnText = document.getElementById("copy-notes-text");
  if (copyBtnText) copyBtnText.textContent = "Copy to Clipboard";
}

function closeNotesModal() {
  const modal = document.getElementById("notes-modal");
  if (modal) modal.classList.add("hidden");
}

async function copyNotesFromModal() {
  await ExportManager.copyGoogleNotesToClipboard();
  const copyBtnText = document.getElementById("copy-notes-text");
  if (copyBtnText) {
    copyBtnText.textContent = "✓ Copied to Clipboard!";
    setTimeout(() => {
      copyBtnText.textContent = "Copy to Clipboard";
    }, 2500);
  }
}

// ============================================================================
// GOOGLE SHEETS SETTINGS MODAL
// ============================================================================
function quickOpenSettings() {
  const modal = document.getElementById("settings-modal");
  const input = document.getElementById("setting-sheets-url");
  const settings = StorageManager.getSettings();

  if (input) input.value = settings.sheetsWebhookUrl || "";
  if (modal) modal.classList.remove("hidden");
}

function closeSettingsModal() {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.classList.add("hidden");
}

function saveSettingsFromModal() {
  const input = document.getElementById("setting-sheets-url");
  const url = input ? input.value.trim() : "";
  const settings = StorageManager.getSettings();
  settings.sheetsWebhookUrl = url;
  StorageManager.saveSettings(settings);
  closeSettingsModal();
  alert("Google Sheets Webhook URL saved successfully!");
}

// ============================================================================
// SEED DEMO DATA & CLEAR ALL DATA
// ============================================================================
function seedDemoTeams() {
  if (confirm("Load 8 realistic demo teams with odd/even problems to showcase selection counts and Excel export?")) {
    StorageManager.seedDemoData();
    updateAnalyticsUI();
    renderRegistrationsTable();
    renderProblemsList();
    renderCatalogue();
    checkActiveSession();
    alert("Demo teams loaded successfully! Check the KPI cards and Same-Problem counts.");
  }
}

function confirmClearData() {
  if (confirm("Warning: Are you sure you want to clear all team registrations? This action cannot be undone.")) {
    StorageManager.clearAllData();
    updateAnalyticsUI();
    renderRegistrationsTable();
    renderProblemsList();
    renderCatalogue();
    checkActiveSession();
    alert("All registration data has been cleared.");
  }
}

