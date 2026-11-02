# Advanced AI Campus Hackathon — Problem Statement Selection Portal

> A responsive, ready-to-deploy web portal designed for hosting on **GitHub Pages**. Allows Team Leads to log in with their Name and Roll Number, enter team member details, select an Odd or Even Problem Statement from the official catalogue, monitor selection counts (including duplicate problem picks and odd vs even balance), and export all records to **Microsoft Excel (.xlsx)** and **Google Notes / Keep**.

---

## 🌟 Key Features

1. **GitHub Pages Ready (Zero Build Step)**:
   - Built with pure HTML5, Tailwind CSS, Lucide Icons, and SheetJS.
   - No `npm build` required—simply push or upload the repository to GitHub, enable GitHub Pages, and it works immediately.

2. **Team Lead Login & Member Registration**:
   - Captures Team Name, Team Lead Full Name, Roll Number, and optional contact info.
   - Dynamic **Add / Remove Member** fields for Member 2, 3, 4, and 5 (Name & Roll Number).
   - Built-in validation prevents duplicate roll number entries across teams or within the same team.

3. **Expanded 22 Problem Statements (Extracted from Official PDF)**:
   - Full titles, descriptions, and categories for **PS-01 through PS-22**.
   - Clear visual badges for **ODD Problems** (Purple) and **EVEN Problems** (Emerald).
   - Highlights the **6 Highest-Impact Recommended Problem Statements** (PS-12, PS-14, PS-15, PS-19, PS-21, PS-22).
   - Search filter (by keyword, title, ID) and quick filter tabs (`All`, `Odd`, `Even`, `Recommended`).

4. **Odd vs Even & Same-Problem Selection Counters**:
   - **Real-Time Problem Counter**: Shows how many teams have selected each specific problem statement (e.g. `Available (0 teams)`, `Selected by 1 team`, `⚠️ Same Problem Chosen: 3 Teams`).
   - **Odd vs Even Balance Tracker**: Visual ratio bar and percentage breakdown of odd vs even problem choices.
   - **Collision Breakdown Card**: Instantly lists every problem statement chosen by 2 or more teams, displaying the team names and lead roll numbers.

5. **Direct Excel (.xlsx) & Google Notes Export**:
   - **Excel Export (.xlsx)**: Generates a multi-sheet Microsoft Excel workbook containing:
     - *Sheet 1: Team Registrations* (S.No, Timestamp, Team Name, Problem ID & Title, Problem Type, Team Lead Name & Roll No, Member 2/3/4/5 Names & Roll Nos, and Full Roster Summary).
     - *Sheet 2: Problem Distribution* (Selection counts and assigned teams per problem).
     - *Sheet 3: Summary Statistics* (Odd/Even breakdown, collision counts, participant numbers).
   - **Google Notes / Keep Export**: Formatted markdown bulleted note with one-click copy to clipboard and downloadable `.txt` note file for Google Keep / Docs.
   - **CSV Export**: Standard UTF-8 BOM CSV compatible with any spreadsheet program.

6. **Free Cloud Backend with Google Sheets (Optional)**:
   - Includes `google-apps-script.js`. Set up a free Google Sheets webhook in 2 minutes so registrations from students across different phones and laptops automatically sync into your Google Sheet live!

---

## 🚀 How to Host on GitHub Pages (Step-by-Step)

### Option A: Using Git CLI

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Hackathon Selection Portal"
   ```

2. **Create a GitHub Repository**:
   - Go to [GitHub](https://github.com/new) and create a new repository (e.g., `hackathon-portal`).

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/<your-username>/hackathon-portal.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - In your repository, go to **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Branch**:
     - Select branch: `main`
     - Select folder: `/ (root)`
     - Click **Save**.
   - Within 1–2 minutes, your website will be live at:
     ```
     https://<your-username>.github.io/hackathon-portal/
     ```

---

### Option B: Using GitHub Web Interface (No Git CLI needed)

1. Go to [github.com/new](https://github.com/new) and create a repository named `hackathon-portal`.
2. Click **"uploading an existing file"**.
3. Drag and drop all the files from this folder (`index.html`, `README.md`, `google-apps-script.js`, `css/`, `js/`).
4. Click **Commit changes**.
5. Go to **Settings** > **Pages**, set branch to `main` and folder to `/(root)`, then click **Save**.

---

## 📊 Problem Statements Index (from PDF)

| ID | Title | Type | Category | Recommended |
|---|---|---|---|---|
| **PS-01** | Student Dropout Early Warning System | **ODD** | Original | |
| **PS-02** | Intelligent Campus Disaster Response | **EVEN** | Original | |
| **PS-03** | Campus Food Demand Prediction | **ODD** | Original | |
| **PS-04** | AI Campus Accessibility Auditor | **EVEN** | Original | |
| **PS-05** | Campus Cybersecurity Threat Detection | **ODD** | Original | |
| **PS-06** | Campus Resource Allocation Optimizer | **EVEN** | Original | |
| **PS-07** | Privacy-Preserving Harassment Pattern Detection | **ODD** | Original | |
| **PS-08** | Campus Energy Optimization | **EVEN** | Original | |
| **PS-09** | Campus Misinformation Detection | **ODD** | Original | |
| **PS-10** | Emergency Medical Coordination | **EVEN** | Original | |
| **PS-11** | Campus Sustainability Decision Engine | **ODD** | Original | |
| **PS-12** | AI-Based Mental Health Support and Crisis Detection | **EVEN** | High-Impact | ⭐ Yes |
| **PS-13** | Women’s Safety and Safe Route Optimizer | **ODD** | High-Impact | |
| **PS-14** | AI Sign-Language and Speech Accessibility Assistant | **EVEN** | High-Impact | ⭐ Yes |
| **PS-15** | Assistive Navigation for Visually Impaired Students | **ODD** | High-Impact | ⭐ Yes |
| **PS-16** | Scholarship and Financial-Aid Eligibility Engine | **EVEN** | High-Impact | |
| **PS-17** | Campus Food Rescue and Redistribution Platform | **ODD** | High-Impact | |
| **PS-18** | Student Accessibility Accommodation System | **EVEN** | High-Impact | |
| **PS-19** | Human Trafficking and Exploitation Risk Awareness System | **ODD** | High-Impact | ⭐ Yes |
| **PS-20** | AI-Based Academic Integrity and Fairness Monitor | **EVEN** | High-Impact | |
| **PS-21** | Community Blood and Organ Donation Coordinator | **ODD** | High-Impact | ⭐ Yes |
| **PS-22** | Campus-to-Employment Opportunity Matcher | **EVEN** | High-Impact | ⭐ Yes |

---

## ⚡ Connecting to Google Sheets (2-Minute Free Cloud Sync)

If you want submissions from multiple students across different devices to automatically log into a live Google Sheet in real time:

1. Create a blank Google Sheet at [sheets.new](https://sheets.new).
2. Click **Extensions** > **Apps Script**.
3. Open `google-apps-script.js` from this project, copy the entire code, and paste it into the Apps Script editor.
4. Click **Deploy** > **New deployment**.
5. Select type: **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone** *(Crucial: allows team leads to submit from anywhere)*
6. Click **Deploy**, approve the permissions, and copy the **Web app URL**.
7. In the website, go to **Organizer Dashboard** > **Google Sheets Sync**, paste the URL and click **Save**.
8. All submissions will now append directly to your Google Sheet!

---

## 📁 Project Structure

```
hackathon/
├── index.html                                        # Main web application entry point
├── README.md                                         # Setup & deployment documentation
├── google-apps-script.js                             # Free live Google Sheets webhook backend
├── Campus_Hackathon_Problem_Statements_No_Ratings.pdf # Original hackathon PDF document
├── css/
│   └── style.css                                     # Custom dark-tech styles & print receipt
└── js/
    ├── data.js                                       # 22 Problem statements & PDF metadata
    ├── storage.js                                    # Persistence, validation & analytics
    ├── export.js                                     # Excel (.xlsx), Google Notes & CSV engines
    └── app.js                                        # UI controller, forms & filters
```

