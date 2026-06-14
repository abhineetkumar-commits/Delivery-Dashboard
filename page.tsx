"use client";

import React, { useMemo, useState } from "react";

// --- SYSTEM CONFIGURATIONS & COMPONENT DESIGN TOKENS ---
const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  "DONE": { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  "POST GO-LIVE": { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  "IN PROGRESS": { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  "YET TO START": { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  "TO DO": { bg: "#eff6ff", text: "#1e40af", dot: "#3b82f6" },
};

const statuses = ["YET TO START", "IN PROGRESS", "DONE", "TO DO"];

const onboardingTemplate = [
  "Kick-Off", "Pre-release / Preparation", "UAT1", "Internal QA",
  "CU Staff Testing - UAT 1", "UAT2", "Internal QA", "CU Staff Testing - UAT 2",
  "PILOT 1", "Internal QA", "CU Staff Testing - PILOT 1", "Feedback - Pilot 1",
  "PILOT 2", "Internal QA", "CU Staff Testing - PILOT 2", "Feedback - Pilot 2",
  "CODE FREEZE", "GO-LIVE PREPARATION", "GO-LIVE", "POST GO LIVE SUPPORT"
];

const coreTemplate = [
  "Kick-Off", "Pre-release / Preparation", "UAT1", "INTERNAL TESTING",
  "CU Staff Testing - UAT1", "UAT 2 + BB", "INTERNAL TESTING", "CU Staff Testing - UAT2 + BB",
  "PILOT 1", "INTERNAL TESTING", "CU Staff Testing - PILOT 1", "PILOT 2",
  "INTERNAL TESTING", "CU Staff Testing - PILOT 2", "GO-LIVE PREPARATION", "GO-LIVE",
  "POST GO LIVE SUPPORT"
];

const featureTemplate = [
  "Preparation", "UAT1", "QA Testing", "CU Staff Testing - UAT 1", "Feedback",
  "PILOT", "CU Staff Testing - PILOT", "Feedback", "GO-LIVE PREPARATION",
  "GO-LIVE", "POST GO LIVE SUPPORT"
];

const segmentAccents: Record<string, string> = {
  onboarding: "#6366f1",
  core: "#0ea5e9",
  feature: "#f59e0b",
  summaryTab: "#8b5cf6"
};

const roleAccessDescriptors: Record<string, string> = {
  "Admin": "Full Write / Root Access",
  "Manager": "Partial Write / Edit Access",
  "Viewer": "Strict Read-Only Access"
};

function createRows(template: string[], owner = "TBD") {
  return template.map((item, i) => ({
    id: Date.now() + i + Math.random(),
    activity: item,
    owner,
    status: "YET TO START",
    from: "",
    to: "",
  }));
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

interface RowItem {
  id: number;
  activity: string;
  owner: string;
  status: string;
  from: string;
  to: string;
}

interface Project {
  id: number;
  customer: string;
  activity: string;
  completed: boolean;
  createdAt: string;
  rows: RowItem[];
  type?: string;
}

interface ExecutiveSummaryItem {
  id: number;
  owners: string;
  cuName: string;
  coreSummary: string;
  targetDate: string;
  status: string;
}

const initialExecutiveSummaryData: ExecutiveSummaryItem[] = [
  { id: 1, owners: "Alison Jones", cuName: "STAR ONE CU", coreSummary: "Star One | Finboa | XP2", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 2, owners: "Mangesh Ratnalikar", cuName: "EXPEDITION  CU", coreSummary: "Expedition CU | Plaid Xchange | Corelation", targetDate: "2026-06-30", status: "DONE" },
  { id: 3, owners: "Alison Jones;Anoosha Tatikonda", cuName: "Palmetto Citizens Credit Union", coreSummary: "Palmetto Citizens FCU | C1 >> nFinia Consumer & Business | Corelation", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 4, owners: "John Bonenberger", cuName: "CC BANK", coreSummary: "CCBank | BioCatch | FIS Horizon", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 5, owners: "Alison Jones", cuName: "SELFRELIANCE FEDERAL CU", coreSummary: "SelfReliance | Velera CC API | Corelation", targetDate: "2026-06-30", status: "DONE" },
  { id: 6, owners: "Anoosha Tatikonda", cuName: "PIONEER FEDERAL CREDIT UNION", coreSummary: "Pioneer FCU | 1 | Origence CUDL (LOS & NAO) SSO | Episys", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 7, owners: "Chandhar Singh", cuName: "EXPEDITION  CU", coreSummary: "Expedition | Meridian Link | Corelation", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 8, owners: "Ajesh S", cuName: "Gold Coast", coreSummary: "Gold Coast FCU | QCash | Fiserv XP2", targetDate: "2026-06-30", status: "DONE" },
  { id: 9, owners: "Ajesh S", cuName: "Gold Coast", coreSummary: "Gold Coast FCU | FinGoal | Fiserv XP2", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 10, owners: "Ajesh S", cuName: "Gold Coast", coreSummary: "Gold Coast FCU | Eltropy | Fiserv XP2", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 11, owners: "Anoosha Tatikonda", cuName: "CHEVRON FCU", coreSummary: "Chevron FCU | CDA | Episys", targetDate: "2026-06-30", status: "DONE" },
  { id: 12, owners: "Alison Jones", cuName: "PIONEER FEDERAL CREDIT UNION", coreSummary: "Pioneer FCU | 3 | Nuuvia Family Banking | Symitar", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 13, owners: "Mangesh Ratnalikar", cuName: "GATHER FCU", coreSummary: "Gather FCU | nFinia Consumer & Business | Symitar EASE", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 14, owners: "Chandhar Singh", cuName: "Diamond Credit Union", coreSummary: "Diamond CU | Business Banking Phase 2 | Corelation", targetDate: "2026-06-30", status: "DONE" },
  { id: 15, owners: "Ajesh S;John Bonenberger", cuName: "St. Paul Federal Credit Union", coreSummary: "St Paul FCU | C1 >> nFinia Consumer | UltraData", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 16, owners: "Anoosha Tatikonda", cuName: "PIONEER FEDERAL CREDIT UNION", coreSummary: "Pioneer FCU | 2 | VISA Digital Issuance | Episys", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 17, owners: "Anoosha Tatikonda", cuName: "PIONEER FEDERAL CREDIT UNION", coreSummary: "Pioneer FCU | 5 | VEEP | Episys", targetDate: "2026-06-30", status: "DONE" },
  { id: 18, owners: "Abhineet Kumar;John Bonenberger", cuName: "Partners 1st Federal Credit Union", coreSummary: "Partners 1st FCU | C1 >> nFinia Consumer & Business | DNA", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 19, owners: "Anoosha Tatikonda", cuName: "CHEVRON FCU", coreSummary: "Chevron FCU | Debit Card Enhancements | Episys", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 20, owners: "Anoosha Tatikonda", cuName: "PIONEER FEDERAL CREDIT UNION", coreSummary: "Pioneer FCU | Deep Linking | Episys", targetDate: "2026-06-30", status: "DONE" },
  { id: 21, owners: "Ajesh S", cuName: "CALTECH EMPLOYEES FCU", coreSummary: "Caltech | nFinia Consumer | Spectrum", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 22, owners: "John Bonenberger", cuName: "CC BANK", coreSummary: "CC Bank | Rebranding | FiS Horizon", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 23, owners: "Chandhar Singh", cuName: "NUMERICA CU", coreSummary: "Numerica | VISA Push Provisioning (#4 Priority) | Episys", targetDate: "2026-06-30", status: "DONE" },
  { id: 24, owners: "Chandhar Singh", cuName: "NUMERICA CU", coreSummary: "Numerica | VISA Digital Card Art Display (#5 Priority) | Episys", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 25, owners: "Chandhar Singh", cuName: "Diamond Credit Union", coreSummary: "Diamond CU | Velera Phase 3 | Corelation", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 26, owners: "Sachin Harsur", cuName: "PIONEER FEDERAL CREDIT UNION", coreSummary: "Pioneer FCU | 4 | nFinia Business Banking | Symitar Episys", targetDate: "2026-06-30", status: "DONE" },
  { id: 27, owners: "Anoosha Tatikonda", cuName: "CHEVRON FCU", coreSummary: "Chevron FCU | Data Visor | Episys", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 28, owners: "Mary Arellano;Mangesh Ratnalikar", cuName: "iTHINK Financial", coreSummary: "iTHINK CU | C1 >> nFinia Consumer (Business follows) | Corelation", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 29, owners: "Alison Jones;Mangesh Ratnalikar", cuName: "O BEE CU", coreSummary: "O Bee CU | Consumer & Business | Symitar", targetDate: "2026-06-30", status: "DONE" },
  { id: 30, owners: "Anoosha Tatikonda", cuName: "CHEVRON FCU", coreSummary: "Chevron FCU | Elan Credit Card (Balance + SSO) | Episys", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 31, owners: "Jennifer Harrison", cuName: "TBD", coreSummary: "Oregonians | Eltropy", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 32, owners: "Jennifer Harrison", cuName: "TBD", coreSummary: "Chevron FCU | Digital Issuance", targetDate: "2026-06-30", status: "DONE" },
  { id: 33, owners: "Jennifer Harrison", cuName: "TBD", coreSummary: "Presitge Community | Paid Exchange API", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 34, owners: "Jennifer Harrison", cuName: "Diamond Credit Union", coreSummary: "Diamond CU | Nuuvia", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 35, owners: "Jennifer Harrison", cuName: "TBD", coreSummary: "Oregonians CU | BioCatch SDK", targetDate: "2026-06-30", status: "DONE" },
  { id: 36, owners: "Jennifer Harrison", cuName: "TBD", coreSummary: "Presitge Community | Ensenta Additional Files - 2", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 37, owners: "Jennifer Harrison", cuName: "TBD", coreSummary: "Sunwest FCU | Palid Exchange API", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 38, owners: "Jennifer Harrison", cuName: "TBD", coreSummary: "CCBank - Prisma Active User", targetDate: "2026-06-30", status: "DONE" },
  { id: 39, owners: "Jennifer Harrison", cuName: "TBD", coreSummary: "Oregonians CU | Yodlee IAV", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 40, owners: "Jennifer Harrison", cuName: "TBD", coreSummary: "Oregonians | Native A2A", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 41, owners: "John Bonenberger", cuName: "CC BANK", coreSummary: "CCBank | nFinia Business Banking | FiS Horizon", targetDate: "2026-06-30", status: "DONE" },
  { id: 42, owners: "Jennifer Harrison", cuName: "STAR ONE CU", coreSummary: "Star One | Card Services: VTC- Phase II | ", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 43, owners: "Alison Jones;Sachin Harsur", cuName: "SunWest FCU", coreSummary: "SunWest FCU | Penni AI | PGL deliverable", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 44, owners: "Jennifer Harrison", cuName: "TBD", coreSummary: "Test Opp", targetDate: "2026-06-30", status: "DONE" },
  { id: 45, owners: "Ajesh S", cuName: "STAR ONE CU", coreSummary: "Star One CU | Fiserv WireXchange | Fiserv XP2", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 46, owners: "Jennifer Harrison", cuName: "MAROON FINANCIAL", coreSummary: "Maroon FCU | CDA | Episys", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 47, owners: "Jennifer Harrison", cuName: "STAR ONE CU", coreSummary: "Star One CU | Zelle Support + Mandate | XP2", targetDate: "2026-06-30", status: "DONE" },
  { id: 48, owners: "Jennifer Harrison", cuName: "STAR ONE CU", coreSummary: "Star One | Zelle Unified Identity Platform (UIP) | XP2", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 49, owners: "Jennifer Harrison", cuName: "STAR ONE CU", coreSummary: "Star One | Zelle Tag | XP2", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 50, owners: "Jennifer Harrison", cuName: "STAR ONE CU", coreSummary: "Star One | Cool-off Restrictions Phase 2 | XP2", targetDate: "2026-06-30", status: "DONE" },
  { id: 51, owners: "Jennifer Harrison", cuName: "STAR ONE CU", coreSummary: "Star One | Block Recipient UX Onboarding - Zelle | XP2", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 52, owners: "Alison Jones;Mangesh Ratnalikar", cuName: "SELFRELIANCE FEDERAL CU", coreSummary: "Selfreliance | Business Banking | Corelation", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 53, owners: "Ajesh S", cuName: "CONNECTION CU", coreSummary: "Connection CU | SavvyMoney | ESP", targetDate: "2026-06-30", status: "DONE" },
  { id: 54, owners: "Alison Jones", cuName: "SunWest FCU", coreSummary: "SunWest FCU | Nuuvia | Fiserv XP2", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 55, owners: "Mangesh Ratnalikar", cuName: "EXPEDITION  CU", coreSummary: "Expedition CU | Verafin | Corelation", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 56, owners: "Mangesh Ratnalikar", cuName: "CONNECT IDAHO", coreSummary: "Connections CU (Idaho) | COOP Cards | ESP", targetDate: "2026-06-30", status: "DONE" },
  { id: 57, owners: "Anoosha Tatikonda", cuName: "CHEVRON FCU", coreSummary: "Chevron FCU | Biometric Authentication | Episys", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 58, owners: "Sachin Harsur", cuName: "PSCCU", coreSummary: "Puget Sound Cooperative CU | Fiserv CardHub | CUnify", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 59, owners: "Anoosha Tatikonda", cuName: "CHEVRON FCU", coreSummary: "Chevron FCU | CD Management | Episys", targetDate: "2026-06-30", status: "DONE" },
  { id: 60, owners: "John Bonenberger", cuName: "CC BANK", coreSummary: "CCBank | Quick-Pay | Horizon", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 61, owners: "Anoosha Tatikonda", cuName: "PRESTIGE COMMUNITY CU", coreSummary: "Prestige Community CU | nFinia Consumer | CUnify", targetDate: "2026-06-30", status: "IN PROGRESS" },
  { id: 62, owners: "Ajesh S", cuName: "OREGONIANS CU", coreSummary: "Oregonians CU | CDA | CUnify", targetDate: "2026-06-30", status: "DONE" },
  { id: 63, owners: "Alison Jones;Sachin Harsur", cuName: "SunWest FCU", coreSummary: "SunWest FCU | nFinia Consumer & Business | Fiserv XP2", targetDate: "2026-06-30", status: "YET TO START" },
  { id: 64, owners: "John Bonenberger", cuName: "CC BANK", coreSummary: "CCBank | nFinia Retail (Business & IPX Later) | FiS Horizon", targetDate: "2026-06-30", status: "IN PROGRESS" },
];

function ProgressBar({ rows, isDark }: { rows: RowItem[]; isDark: boolean }) {
  const done = rows.filter(r => r.status === "DONE").length;
  const inProgress = rows.filter(r => r.status === "IN PROGRESS").length;
  const total = rows.length;
  const donePct = total ? Math.round((done / total) * 100) : 0;
  const inPct = total ? Math.round((inProgress / total) * 100) : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
      <div style={{ flex: 1, height: 8, borderRadius: 99, background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)", overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${donePct}%`, background: "#10b981", transition: "width .4s ease" }} />
        <div style={{ width: `${inPct}%`, background: "#f59e0b", transition: "width .4s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: "600", color: isDark ? "rgba(255,255,255,0.8)" : "#475569", whiteSpace: "nowrap" }}>{donePct}% done</span>
    </div>
  );
}

function StatCard({ value, label, accent, isDark }: { value: number; label: string; accent: string; isDark: boolean }) {
  return (
    <div style={{
      background: isDark ? "#1e293b" : "#fff",
      borderRadius: 16, padding: "20px",
      border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
      borderTop: `4px solid ${accent}`,
      display: "flex", flexDirection: "column", gap: 6,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: isDark ? "#f8fafc" : "#1e293b", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}

function renderProjects(
  projects: Project[], 
  type: string, 
  darkMode: boolean, 
  ownersList: string[], 
  exportToCSV: (t: string) => void, 
  handleBulkCSVUpload: (e: React.ChangeEvent<HTMLInputElement>, t: string) => void,
  addCustomer: (t: string) => void,
  updateProject: (t: string, id: number, f: string, v: string) => void,
  updateCompletion: (t: string, id: number, v: boolean) => void,
  deleteCustomer: (t: string, id: number) => void,
  updateRow: (t: string, pId: number, rId: number, f: string, v: string) => void,
  deleteRowFromProject: (t: string, pId: number, rId: number) => void,
  addRowToProject: (t: string, id: number) => void
) {
  const accent = segmentAccents[type] || "#6366f1";
  const isAllDone = (p: Project) => p.rows.length > 0 && p.rows.every(r => r.status === "DONE");
  
  const sortedActiveScopedList = [...projects].filter(p => !p.completed).sort((a, b) => {
    const aDone = isAllDone(a) ? 1 : 0;
    const bDone = isAllDone(b) ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone; 
    return b.id - a.id; 
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: darkMode ? "#1e293b" : "#fff", padding: "14px 24px", borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: darkMode ? "#f8fafc" : "#0f172a", textTransform: "capitalize" }}>{type} Operational Tracker Pipelines</h2>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label style={{ background: "transparent", color: darkMode ? "#cbd5e1" : "#475569", border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, padding: "10px 18px", borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", gap: 6 }}>
            📤 Bulk Upload CSV
            <input type="file" accept=".csv" onChange={(e) => handleBulkCSVUpload(e, type)} style={{ display: "none" }} />
          </label>
          <button onClick={() => exportToCSV(type)} style={{ background: "transparent", color: darkMode ? "#cbd5e1" : "#475569", border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, padding: "10px 18px", borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>📥 Export CSV</button>
          <button onClick={() => addCustomer(type)} style={{ background: accent, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: `0 4px 14px ${accent}40` }}>+ Add Customer Account</button>
        </div>
      </div>
      {sortedActiveScopedList.length === 0 ? (
        <div style={{ padding: "40px", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.05em", textAlign: "center", background: darkMode ? "#1e293b" : "#fff", borderRadius: 16, color: "#64748b" }}>No Active Projects running under this classification.</div>
      ) : sortedActiveScopedList.map(project => {
        const isProjectDone = isAllDone(project);
        return (
          <div key={project.id} style={{
            borderRadius: 20, overflow: "hidden",
            border: isProjectDone ? "2px solid #10b981" : `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
            background: darkMode ? "#1e293b" : "#fff",
            opacity: isProjectDone ? 0.8 : 1,
            boxShadow: `0 10px 25px -5px rgba(0,0,0,0.02)`,
          }}>
            <div style={{ background: isProjectDone ? "#064e3b" : `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`, padding: "20px 24px", borderBottom: `3px solid ${isProjectDone ? "#10b981" : accent}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <input value={project.customer} onChange={e => updateProject(type, project.id, "customer", e.target.value)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontWeight: 800, fontSize: 15, minWidth: 180 }} />
                <input value={project.activity} onChange={e => updateProject(type, project.id, "activity", e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", color: "rgba(255,255,255,0.8)", fontSize: 13, flex: 1, minWidth: 200 }} />
                {isProjectDone && <span style={{ background: "#10b981", color: "#fff", fontSize: 11, fontWeight: 800, padding: "6px 12px", borderRadius: 6, marginRight: 4 }}>✓ STACK COMPLETION MET</span>}
                <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "4px 8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      <input type="checkbox" checked={project.completed} onChange={e => updateCompletion(type, project.id, e.target.checked)} style={{ width: 15, height: 15, accentColor: "#10b981" }} /> Archive Milestone Log
                    </label>
                  </div>
                  <button onClick={() => deleteCustomer(type, project.id)} style={{ background: "rgba(239,68,68,0.15)", border: "none", color: "#fca5a5", padding: "8px 14px", borderRadius: 10, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Delete</button>
                </div>
              </div>
              <div style={{ marginTop: 16 }}><ProgressBar rows={project.rows} isDark={true} /></div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: darkMode ? "#0f172a" : "#f8fafc", borderBottom: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}` }}>
                    {["Activity Label", "Task Owner", "Status Flag", "Start Date", "Target Date", ""].map((h, i) => (
                      <th key={i} style={{ padding: "12px 20px", textAlign: "left", fontWeight: 700, color: darkMode ? "#94a3b8" : "#64748b", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {project.rows.map((row, idx) => {
                    const colConf = statusColors[row.status.toUpperCase()] || { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" };
                    return (
                      <tr key={row.id} style={{ borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, background: darkMode ? (idx % 2 === 0 ? "#1e293b" : "#161e2b") : (idx % 2 === 0 ? "#fff" : "#fafbfc") }}>
                        <td style={{ padding: "10px 20px", minWidth: 260 }}><input value={row.activity} onChange={e => updateRow(type, project.id, row.id, "activity", e.target.value)} style={{ width: "100%", border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 8, padding: "6px 12px", background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#f8fafc" : "#334155" }} /></td>
                        <td style={{ padding: "10px 20px" }}><select value={row.owner} onChange={e => updateRow(type, project.id, row.id, "owner", e.target.value)} style={{ border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 8, padding: "6px 12px", background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#f8fafc" : "#334155", minWidth: "130px" }}>
                          {ownersList.map(o => <option key={o} value={o}>{o}</option>)}</select></td>
                        <td style={{ padding: "10px 20px" }}><select value={row.status} onChange={e => updateRow(type, project.id, row.id, "status", e.target.value)} style={{ border: `1px solid ${colConf.dot}`, borderRadius: 8, padding: "6px 12px", fontWeight: 700, background: colConf.bg, color: colConf.text }}>
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                        <td style={{ padding: "10px 20px" }}><input type="date" value={row.from} onChange={e => updateRow(type, project.id, row.id, "from", e.target.value)} style={{ border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 8, padding: "6px 12px", background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#f8fafc" : "#334155" }} /></td>
                        <td style={{ padding: "10px 20px" }}><input type="date" value={row.to} onChange={e => updateRow(type, project.id, row.id, "to", e.target.value)} style={{ border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 8, padding: "6px 12px", background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#f8fafc" : "#334155" }} /></td>
                        <td style={{ padding: "10px 20px", textAlign: "center" }}><button onClick={() => deleteRowFromProject(type, project.id, row.id)} style={{ background: "transparent", color: "#ef4444", border: "none", fontSize: 16, cursor: "pointer", fontWeight: "bold" }}>✕</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "12px 20px", background: darkMode ? "#161e2b" : "#fafbfc" }}><button onClick={() => addRowToProject(type, project.id)} style={{ background: "transparent", color: accent, border: `1px dashed ${accent}`, borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%" }}>+ Append Custom Milestone Row Element</button></div>
          </div>
        );
      })}
    </div>
  );
}

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);

  const [filters, setFilters] = useState({
    owners: "",
    cuName: "",
    coreSummary: "",
    targetDate: "",
    status: ""
  });

  const [ownersList, setOwnersList] = useState(["Sandeep", "Rajesh", "Naveen", "Raja", "Murahari", "Avinash", "Dinesh", "Neelmani", "Ashok", "Gayatri", "Arasan", "Bijaya", "Ganesh", "Prasad", "Anoosha Tatikonda", "Sachin Harsur", "Chandhar Singh", "John Bonenberger", "Alison Jones", "Mangesh Ratnalikar", "Ajesh S", "Jennifer Harrison", "Abhineet Kumar", "Mary Arellano", "TBD"]);
  const [newOwnerInput, setNewOwnerInput] = useState("");
  
  const [userDirectory, setUserDirectory] = useState([
    { id: 1, name: "Sandeep Kumar", email: "sandeep@tyfone.com", role: "Admin" },
    { id: 2, name: "Naveen Raj", email: "naveen.r@tyfone.com", role: "Manager" },
    { id: 3, name: "Raja Sekhar", email: "raja.s@tyfone.com", role: "Viewer" }
  ]);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Viewer" });
  
  const [onboardingProjects, setOnboardingProjects] = useState<Project[]>([
    { id: 1, customer: "SUMMERVILLE", activity: "Digital Banking Plan", completed: false, createdAt: getToday(), rows: createRows(onboardingTemplate, "Sandeep") }
  ]);
  const [coreProjects, setCoreProjects] = useState<Project[]>([
    { id: 2, customer: "BRONCO", activity: "DIGITAL BANKING CORE MIGRATION", completed: false, createdAt: getToday(), rows: createRows(coreTemplate, "Naveen") }
  ]);
  const [featureProjects, setFeatureProjects] = useState<Project[]>([
    { id: 3, customer: "UBI", activity: "Feature SOW Scope", completed: false, createdAt: getToday(), rows: createRows(featureTemplate, "Raja") }
  ]);

  const [execSummaryFeed, setExecSummaryFeed] = useState<ExecutiveSummaryItem[]>(initialExecutiveSummaryData);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.email.includes("@tyfone.com")) {
      setAuthError("Access restricted. Please supply a valid corporate @tyfone.com domain account.");
      return;
    }

    const matchedProfile = userDirectory.find(u => u.email.trim().toLowerCase() === authForm.email.trim().toLowerCase());
    const matchedRole = matchedProfile ? matchedProfile.role : "Viewer"; 

    if (matchedRole === "Admin" || matchedRole === "Manager") {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!strongPasswordRegex.test(authForm.password)) {
        setAuthError("Elevated Privilege Policy Error: Admins/Managers require a minimum of 8 positions containing an uppercase letter, lowercase letter, number, and special character.");
        return; 
      }
    } else {
      if (authForm.password.length < 4) {
        setAuthError("Security policy validation failure: Standard password key length must contain 4+ positions.");
        return; 
      }
    }

    setAuthError("");
    setIsAuthenticated(true);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerInput.trim()) return;
    if (ownersList.includes(newOwnerInput.trim())) {
      alert("Owner name already exists.");
      return;
    }
    setOwnersList([...ownersList, newOwnerInput.trim()]);
    setNewOwnerInput("");
  };

  const handleDeleteOwner = (nameToRemove: string) => {
    if (nameToRemove === "TBD") return alert("Cannot delete standard fallback owner.");
    setOwnersList(ownersList.filter(o => o !== nameToRemove));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    setUserDirectory([...userDirectory, { ...newUser, id: Date.now() }]);
    setNewUser({ name: "", email: "", role: "Viewer" });
  };

  const handleDeleteUser = (id: number) => {
    setUserDirectory(userDirectory.filter(u => u.id !== id));
  };

  const handleUpdateUserRole = (id: number, updatedRole: string) => {
    setUserDirectory(prev => prev.map(u => u.id === id ? { ...u, role: updatedRole } : u));
  };

  const checkIsProjectFullyDone = (project: Project) => {
    if (project.rows.length === 0) return false;
    return project.rows.every(r => r.status === "DONE");
  };

  const completedProjects = useMemo(() => {
    return [
      ...onboardingProjects.map(p => ({ ...p, type: "onboarding" })),
      ...coreProjects.map(p => ({ ...p, type: "core" })),
      ...featureProjects.map(p => ({ ...p, type: "feature" })),
    ].filter(p => p.completed || checkIsProjectFullyDone(p));
  }, [onboardingProjects, coreProjects, featureProjects]);

  const summary = {
    onboarding: onboardingProjects.filter(p => !p.completed && !checkIsProjectFullyDone(p)).length,
    core: coreProjects.filter(p => !p.completed && !checkIsProjectFullyDone(p)).length,
    feature: featureProjects.filter(p => !p.completed && !checkIsProjectFullyDone(p)).length,
    completed: completedProjects.length,
    execSummary: execSummaryFeed.length,
  };

  const allActive = [
    ...onboardingProjects.filter(p => !p.completed).map(p => ({ ...p, type: "Onboarding" })),
    ...coreProjects.filter(p => !p.completed).map(p => ({ ...p, type: "Core Migration" })),
    ...featureProjects.filter(p => !p.completed).map(p => ({ ...p, type: "Feature SOW" })),
  ];

  const allStatusCounts = useMemo(() => {
    const rows = [...onboardingProjects, ...coreProjects, ...featureProjects].flatMap(p => p.rows);
    return {
      done: rows.filter(r => r.status === "DONE").length,
      inProgress: rows.filter(r => r.status === "IN PROGRESS").length,
      yet: rows.filter(r => r.status === "YET TO START").length,
    };
  }, [onboardingProjects, coreProjects, featureProjects]);

  const trackerStreamsProjectsPerOwner = useMemo(() => {
    const counts: Record<string, number> = {};
    ownersList.forEach(owner => { counts[owner] = 0; });
    
    [...onboardingProjects, ...coreProjects, ...featureProjects].flatMap(p => p.rows).forEach(row => {
      if (row.status !== "DONE") {
        counts[row.owner] = (counts[row.owner] || 0) + 1;
      }
    });

    return Object.entries(counts).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  }, [onboardingProjects, coreProjects, featureProjects, ownersList]);

  const chartMetrics = useMemo(() => {
    const onboardingTasks = onboardingProjects.filter(p => !p.completed).flatMap(p => p.rows).length;
    const coreTasks = coreProjects.filter(p => !p.completed).flatMap(p => p.rows).length;
    const featureTasks = featureProjects.filter(p => !p.completed).flatMap(p => p.rows).length;
    const maxVal = Math.max(onboardingTasks, coreTasks, featureTasks, 10);
    return { onboardingTasks, coreTasks, featureTasks, maxVal };
  }, [onboardingProjects, coreProjects, featureProjects]);

  const filteredExecSummary = useMemo(() => {
    return execSummaryFeed.filter(item => {
      const matchOwner = item.owners.toLowerCase().includes(filters.owners.toLowerCase());
      const matchCU = item.cuName.toLowerCase().includes(filters.cuName.toLowerCase());
      const matchSummary = item.coreSummary.toLowerCase().includes(filters.coreSummary.toLowerCase());
      const matchDate = filters.targetDate ? item.targetDate === filters.targetDate : true;
      const matchStatus = filters.status ? item.status.toUpperCase() === filters.status.toUpperCase() : true;

      return matchOwner && matchCU && matchSummary && matchDate && matchStatus;
    });
  }, [execSummaryFeed, filters]);

  const updateExecSummaryCell = (id: number, field: keyof ExecutiveSummaryItem, value: string) => {
    setExecSummaryFeed(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const deleteExecSummaryRow = (id: number) => {
    if (confirm("Delete this executive summary milestone row permanently?")) {
      setExecSummaryFeed(prev => prev.filter(item => item.id !== id));
    }
  };

  const appendExecSummaryRow = () => {
    const newId = Date.now();
    const placeholderRow: ExecutiveSummaryItem = {
      id: newId,
      owners: "TBD",
      cuName: "NEW CREDIT UNION INSTITUTION",
      coreSummary: "Core Platform | Feature Target Specifications",
      targetDate: getToday(),
      status: "YET TO START"
    };
    setExecSummaryFeed(prev => [...prev, placeholderRow]);
  };

  const handleBulkCSVUpload = (e: React.ChangeEvent<HTMLInputElement>, targetTab: string) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length <= 1) {
        alert("Upload parsing exception: Checked CSV layout has no data row records.");
        return;
      }

      const cleanField = (f: string) => f ? f.replace(/^["']|["']$/g, '').trim() : "";

      if (targetTab === "execSummary") {
        const parsedItems: ExecutiveSummaryItem[] = [];
        lines.slice(1).forEach((line, index) => {
          const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (columns.length >= 3) {
            parsedItems.push({
              id: Date.now() + index + Math.random(),
              owners: cleanField(columns[0]) || "TBD",
              cuName: cleanField(columns[1]) || "NEW ACCOUNT",
              coreSummary: cleanField(columns[2]) || "",
              targetDate: cleanField(columns[3]) || getToday(),
              status: columns[4] ? cleanField(columns[4]).toUpperCase() : "YET TO START"
            });
          }
        });
        setExecSummaryFeed(prev => [...parsedItems, ...prev]);
        alert(`Success: ${parsedItems.length} records appended to Executive Ledger Workspace.`);
      } else {
        const projectGroups: Record<string, { activity: string; rows: RowItem[] }> = {};
        
        lines.slice(1).forEach((line, index) => {
          const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (columns.length >= 3) {
            const customerName = cleanField(columns[0]) || "UPLOADED CU ACCOUNT";
            const projectActivity = cleanField(columns[1]) || "Operational Pipeline Tracker";
            
            if (!projectGroups[customerName]) {
              projectGroups[customerName] = { activity: projectActivity, rows: [] };
            }

            projectGroups[customerName].rows.push({
              id: Date.now() + index + Math.random(),
              activity: cleanField(columns[2]) || "Milestone Deployment Task",
              owner: cleanField(columns[3]) || "TBD",
              status: columns[4] ? cleanField(columns[4]).toUpperCase() : "YET TO START",
              from: cleanField(columns[5]) || "",
              to: cleanField(columns[6]) || ""
            });
          }
        });

        const freshlyGeneratedProjectCards = Object.entries(projectGroups).map(([cust, data]) => ({
          id: Date.now() + Math.random(),
          customer: cust,
          activity: data.activity,
          completed: false,
          createdAt: getToday(),
          rows: data.rows
        }));

        if (targetTab === "onboarding") setOnboardingProjects(prev => [...freshlyGeneratedProjectCards, ...prev]);
        if (targetTab === "core") setCoreProjects(prev => [...freshlyGeneratedProjectCards, ...prev]);
        if (targetTab === "feature") setFeatureProjects(prev => [...freshlyGeneratedProjectCards, ...prev]);

        alert(`Success: Parsed and injected ${freshlyGeneratedProjectCards.length} Customer Track Cards.`);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; 
  };

  const exportToCSV = (targetType: string) => {
    let sourcePool: Project[] = [];
    if (targetType === "onboarding") sourcePool = onboardingProjects;
    else if (targetType === "core") sourcePool = coreProjects;
    else if (targetType === "feature") sourcePool = featureProjects;
    else sourcePool = [...onboardingProjects, ...coreProjects, ...featureProjects];

    if (sourcePool.length === 0 && targetType !== "execSummary") {
      alert("No data available to export.");
      return;
    }

    let csvContent = "";
    if (targetType === "execSummary") {
      csvContent = "data:text/csv;charset=utf-8,Owner(s),Customer Name,Summary,Target Date,Status\n";
      execSummaryFeed.forEach(item => {
        const line = [`"${item.owners.replace(/"/g, '""')}"`, `"${item.cuName.replace(/"/g, '""')}"`, `"${item.coreSummary.replace(/"/g, '""')}"`, `"${item.targetDate}"`, `"${item.status}"`].join(",");
        csvContent += line + "\n";
      });
    } else {
      csvContent = "data:text/csv;charset=utf-8,Customer,Project Activity,Task Activity,Owner,Status,Start Date,End Date\n";
      sourcePool.forEach(project => {
        project.rows.forEach(row => {
          const line = [`"${project.customer.replace(/"/g, '""')}"`, `"${project.activity.replace(/"/g, '""')}"`, `"${row.activity.replace(/"/g, '""')}"`, `"${row.owner}"`, `"${row.status}"`, `"${row.from || ""}"`, `"${row.to || ""}"`].join(",");
          csvContent += line + "\n";
        });
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${targetType}_tracker_${getToday()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateProjectHandler = (type: string, id: number, field: string, value: string) => {
    const u = (ps: Project[]) => ps.map(p => p.id === id ? { ...p, [field]: value } : p);
    if (type === "onboarding") setOnboardingProjects(u);
    if (type === "core") setCoreProjects(u);
    if (type === "feature") setFeatureProjects(u);
  };

  const updateCompletionHandler = (type: string, id: number, value: boolean) => {
    const u = (ps: Project[]) => ps.map(p => p.id === id ? { ...p, completed: value } : p);
    if (type === "onboarding") setOnboardingProjects(u);
    if (type === "core") setCoreProjects(u);
    if (type === "feature") setFeatureProjects(u);
  };

  const deleteCustomerHandler = (type: string, id: number) => {
    if (!confirm("Delete this customer and all data permanently?")) return;
    const u = (ps: Project[]) => ps.filter(p => p.id !== id);
    if (type === "onboarding") setOnboardingProjects(u);
    if (type === "core") setCoreProjects(u);
    if (type === "feature") setFeatureProjects(u);
  };

  const addCustomerHandler = (type: string) => {
    const project: Project = {
      id: Date.now(),
      customer: "NEW CUSTOMER ACCOUNT",
      activity: type === "core" ? "DIGITAL BANKING CORE MIGRATION" : type === "feature" ? "Feature SOW" : "Digital Banking",
      completed: false,
      createdAt: getToday(),
      rows: type === "core" ? createRows(coreTemplate) : type === "feature" ? createRows(featureTemplate) : createRows(onboardingTemplate),
    };
    if (type === "onboarding") setOnboardingProjects(p => [project, ...p]);
    if (type === "core") setCoreProjects(p => [project, ...p]);
    if (type === "feature") setFeatureProjects(p => [project, ...p]);
  };

  const updateRowHandler = (type: string, projectId: number, rowId: number, field: string, value: string) => {
    const u = (ps: Project[]) => ps.map(p => p.id === projectId ? { ...p, rows: p.rows.map(r => r.id === rowId ? { ...r, [field]: value } : r) } : p);
    if (type === "onboarding") setOnboardingProjects(u);
    if (type === "core") setCoreProjects(u);
    if (type === "feature") setFeatureProjects(u);
  };

  const addRowToProjectHandler = (type: string, projectId: number) => {
    const newRow = { id: Date.now() + Math.random(), activity: "New Implementation Step", owner: "TBD", status: "YET TO START", from: "", to: "" };
    const u = (ps: Project[]) => ps.map(p => p.id === projectId ? { ...p, rows: [...p.rows, newRow] } : p);
    if (type === "onboarding") setOnboardingProjects(u);
    if (type === "core") setCoreProjects(u);
    if (type === "feature") setFeatureProjects(u);
  };

  const deleteRowFromProjectHandler = (type: string, projectId: number, rowId: number) => {
    const u = (ps: Project[]) => ps.map(p => p.id === projectId ? { ...p, rows: p.rows.filter(r => r.id !== rowId) } : p);
    if (type === "onboarding") setOnboardingProjects(u);
    if (type === "core") setCoreProjects(u);
    if (type === "feature") setFeatureProjects(u);
  };

  // --- RESTORED SECURE LOCK: GATEWAY CONDITIONAL BLOCKS READ FIRST ---
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", background: "#0f172a", color: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ flex: 1, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: 64, borderRight: "1px solid #1e293b" }}>
          <div style={{ maxWidth: 480 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}><div style={{ width: 16, height: 16, borderRadius: 4, background: "#2563eb" }} /><span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "0.08em" }}>ENTERPRISE SECURE ARCHITECTURE</span></div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: "#ffffff", marginBottom: 16, lineHeight: 1.1, letterSpacing: "-0.03em" }}>Delivery Track & Execution Hub.</h1>
            <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6 }}>Powered by Tyfone—Monitoring deployment telemetry, digital banking core metrics, and live launch configurations.</p>
          </div>
        </div>
        <div style={{ width: 520, display: "flex", flexDirection: "column", justifyContent: "center", background: "#0b0f19", padding: 64 }}>
          <div style={{ width: "100%", maxWidth: 360, margin: "0 auto" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>Welcome Back</h2>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px 0" }}>Provide internal credentials to access deployment matrices</p>
            {authError && (<div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: 8, padding: "12px 14px", color: "#fca5a5", fontSize: 12, fontWeight: 500, marginBottom: 20 }}>⚠️ {authError}</div>)}
            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: 6 }}>Corporate Email Address</label>
                <input type="email" placeholder="username@tyfone.com" required value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} style={{ width: "100%", background: "#161e2b", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#ffffff", fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: 6 }}>Security Key Access Pin</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" required value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} style={{ width: "100%", background: "#161e2b", border: "1px solid #334155", borderRadius: 8, padding: "10px 42px 10px 14px", color: "#ffffff", fontSize: 13 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14 }}>{showPassword ? "👁️" : "🙈"}</button>
                </div>
              </div>
              <button type="submit" style={{ width: "100%", background: "#2563eb", color: "#ffffff", border: "none", padding: 12, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 4 }}>Sign In to Workspace</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: darkMode ? "#0f172a" : "#f8fafc", color: darkMode ? "#f8fafc" : "#0f172a", fontFamily: "system-ui, sans-serif" }}>
      {/* --- HIGH CONTEXT STICKY NAV LAYER --- */}
      <div style={{ background: darkMode ? "#1e293b" : "#0f172a", borderBottom: `1px solid ${darkMode ? "#334155" : "#1e293b"}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: "bold" }}>◈</div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "0.05em", textTransform: "uppercase" }}>Project Space</span>
          </div>
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: 12 }}>
            {[
              { key: "dashboard", label: "Dashboard" },
              { key: "onboarding", label: "Onboarding" },
              { key: "core", label: "Core Migration" },
              { key: "feature", label: "Feature SOW" },
              { key: "completed", label: "Completed" },
              { key: "execSummary", label: "Executive Summary 📄" },
              { key: "admin", label: "Admin Panel ⚙️" }
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: activeTab === tab.key ? "#6366f1" : "transparent", color: activeTab === tab.key ? "#fff" : "#94a3b8"
              }}>
                <span>{tab.label}</span>
                {tab.key !== "dashboard" && tab.key !== "completed" && tab.key !== "execSummary" && tab.key !== "admin" && (
                  <span style={{ marginLeft: 6, background: activeTab === tab.key ? "rgba(255,255,255,0.2)" : "#1e293b", color: "#fff", borderRadius: 99, padding: "2px 6px", fontSize: 11 }}>
                    {tab.key === "onboarding" ? summary.onboarding : tab.key === "core" ? summary.core : summary.feature}
                  </span>
                )}
                {tab.key === "execSummary" && (
                  <span style={{ marginLeft: 6, background: "#8b5cf6", color: "#fff", borderRadius: 99, padding: "2px 6px", fontSize: 11 }}>{summary.execSummary}</span>
                )}
                {tab.key === "completed" && summary.completed > 0 && (
                  <span style={{ marginLeft: 6, background: "#10b981", color: "#fff", borderRadius: 99, padding: "2px 6px", fontSize: 11 }}>{summary.completed}</span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: darkMode ? "#fff" : "#1e293b", color: darkMode ? "#1e293b" : "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}</button>
            <button onClick={() => setIsAuthenticated(false)} style={{ background: "transparent", color: "#ef4444", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>LOGOUT</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "40px 24px" }}>
        {/* --- EXECUTIVE MONITOR VIEWPORT --- */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Executive Dashboard Overview</h1>
                <p style={{ color: "#64748b", fontSize: 14, margin: "6px 0 0" }}>Real-time core system deployment telemetry monitoring</p>
              </div>
              <button onClick={() => exportToCSV("all")} style={{ background: darkMode ? "#6366f1" : "#0f172a", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>📥 Export Entire Dataset (CSV)</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <StatCard value={summary.onboarding} label="Onboarding Deliveries" accent="#6366f1" isDark={darkMode} />
              <StatCard value={summary.core} label="Core Migrations" accent="#0ea5e9" isDark={darkMode} />
              <StatCard value={summary.feature} label="Feature SOWs" accent="#f59e0b" isDark={darkMode} />
              <StatCard value={summary.completed} label="Archived Safe" accent="#10b981" isDark={darkMode} />
              <StatCard value={allStatusCounts.done} label="Total Tasks Done" accent="#10b981" isDark={darkMode} />
              <StatCard value={allStatusCounts.inProgress} label="In Progress Ops" accent="#f59e0b" isDark={darkMode} />
              <StatCard value={allStatusCounts.yet} label="Pipeline Backlog" accent="#94a3b8" isDark={darkMode} />
            </div>

            {/* --- DASHBOARD MONITOR TRACKER GRAPHS --- */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
              <div style={{ background: darkMode ? "#1e293b" : "#fff", padding: "24px", borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700 }}>Active Stream Workloads Per Owner</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "280px", overflowY: "auto", paddingRight: 6 }}>
                  {trackerStreamsProjectsPerOwner.map(([ownerName, count]) => {
                    const maxVal = Math.max(...trackerStreamsProjectsPerOwner.map(([_, c]) => c), 1);
                    return (
                      <div key={ownerName}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600 }}>👤 {ownerName}</span>
                          <strong>{count} Steps Pending</strong>
                        </div>
                        <div style={{ height: 10, background: darkMode ? "#0f172a" : "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #0ea5e9)", width: `${(count / maxVal) * 100}%`, borderRadius: 99 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: darkMode ? "#1e293b" : "#fff", padding: "24px", borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700 }}>Task Load Volume Distribution</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span>Onboarding Channel</span><span>{chartMetrics.onboardingTasks} Tasks</span></div>
                    <div style={{ height: 12, background: darkMode ? "#0f172a" : "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#6366f1", width: `${(chartMetrics.onboardingTasks / chartMetrics.maxVal) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span>Core Migration Stream</span><span>{chartMetrics.coreTasks} Tasks</span></div>
                    <div style={{ height: 12, background: darkMode ? "#0f172a" : "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#0ea5e9", width: `${(chartMetrics.coreTasks / chartMetrics.maxVal) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Streams Registry Matrix Grid */}
            <div style={{ background: darkMode ? "#1e293b" : "#fff", borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: darkMode ? "#0f172a" : "#f8fafc" }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>ACTIVE PORTFOLIO STREAMS</span>
                <span style={{ fontSize: 12, background: darkMode ? "#334155" : "#e2e8f0", padding: "3px 10px", borderRadius: 99 }}>{allActive.length} Active Accounts</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
                    {["Customer Institution", "Active SOW Scope", "Stream Classification", "Migration Progress"].map(h => (
                      <th key={h} style={{ padding: "14px 24px", textAlign: "left", color: "#64748b" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allActive.map(p => {
                    const done = p.rows.filter(r => r.status === "DONE").length;
                    const pct = Math.round((done / p.rows.length) * 100);
                    const ac = p.type === "Onboarding" ? "#6366f1" : p.type === "Core Migration" ? "#0ea5e9" : "#f59e0b";
                    return (
                      <tr key={p.id} onClick={() => setActiveTab(p.type === "Onboarding" ? "onboarding" : p.type === "Core Migration" ? "core" : "feature")} style={{ borderTop: `1px solid ${darkMode ? "#334155" : "#f1f5f9"}`, cursor: "pointer" }}>
                        <td style={{ padding: "14px 24px", fontWeight: 700 }}>{p.customer}</td>
                        <td style={{ padding: "14px 24px" }}>{p.activity}</td>
                        <td style={{ padding: "14px 24px" }}><span style={{ background: `${ac}15`, color: ac, padding: "4px 10px", borderRadius: 8, fontWeight: 700 }}>{p.type}</span></td>
                        <td style={{ padding: "14px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 99, background: darkMode ? "#334155" : "#e2e8f0" }}><div style={{ width: `${pct}%`, height: "100%", background: ac, borderRadius: 99 }} /></div>
                            <span>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TRACKER ROUTING PANELS --- */}
        {activeTab === "onboarding" && renderProjects(onboardingProjects, "onboarding", darkMode, ownersList, exportToCSV, handleBulkCSVUpload, addCustomerHandler, updateProjectHandler, updateCompletionHandler, deleteCustomerHandler, updateRowHandler, deleteRowFromProjectHandler, addRowToProjectHandler)}
        {activeTab === "core" && renderProjects(coreProjects, "core", darkMode, ownersList, exportToCSV, handleBulkCSVUpload, addCustomerHandler, updateProjectHandler, updateCompletionHandler, deleteCustomerHandler, updateRowHandler, deleteRowFromProjectHandler, addRowToProjectHandler)}
        {activeTab === "feature" && renderProjects(featureProjects, "feature", darkMode, ownersList, exportToCSV, handleBulkCSVUpload, addCustomerHandler, updateProjectHandler, updateCompletionHandler, deleteCustomerHandler, updateRowHandler, deleteRowFromProjectHandler, addRowToProjectHandler)}

        {/* --- TAB VIEWPORT: EXECUTIVE SUMMARY --- */}
        {activeTab === "execSummary" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Executive Summary Ledger Matrix</h2>
                <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>Synchronized mapping parameters compiled directly from baseline archive log records inside Executive Summary.csv</p>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <label style={{ background: "#8b5cf6", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13, display: "inline-flex", gap: 6 }}>
                  📤 Bulk Upload CSV
                  <input type="file" accept=".csv" onChange={(e) => handleBulkCSVUpload(e, "execSummary")} style={{ display: "none" }} />
                </label>
                <button onClick={() => exportToCSV("execSummary")} style={{ background: "#8b5cf6", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>📥 Export Ledger CSV</button>
              </div>
            </div>

            {/* --- MULTI-FIELD COLUMNS FILTER MATRIX TOOLBAR CONTROLS --- */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
              gap: 12, 
              marginBottom: 20,
              padding: 16,
              background: darkMode ? "#1e293b" : "#fff",
              borderRadius: 12,
              border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`
            }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4, opacity: 0.8 }}>Filter Owner(s)</label>
                <input type="text" placeholder="Search Owners..." value={filters.owners} onChange={e => setFilters({...filters, owners: e.target.value})} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#fff" : "#000", fontSize: 13 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4, opacity: 0.8 }}>Filter Credit Union</label>
                <input type="text" placeholder="Search CU Name..." value={filters.cuName} onChange={e => setFilters({...filters, cuName: e.target.value})} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#fff" : "#000", fontSize: 13 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4, opacity: 0.8 }}>Filter Core Summary</label>
                <input type="text" placeholder="Search Core/Summary..." value={filters.coreSummary} onChange={e => setFilters({...filters, coreSummary: e.target.value})} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#fff" : "#000", fontSize: 13 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4, opacity: 0.8 }}>Filter Target Date</label>
                <input type="date" value={filters.targetDate} onChange={e => setFilters({...filters, targetDate: e.target.value})} style={{ width: "100%", padding: "7px 12px", borderRadius: 6, border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#fff" : "#000", fontSize: 13 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4, opacity: 0.8 }}>Filter Status</label>
                <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#fff" : "#000", fontSize: 13 }}>
                  <option value="">-- All Statuses --</option>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ background: darkMode ? "#1e293b" : "#ffffff", borderRadius: 12, border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ overflowX: "auto", maxHeight: "650px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, whiteSpace: "nowrap" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <tr style={{ background: darkMode ? "#0f172a" : "#f8fafc", borderBottom: `2px solid ${darkMode ? "#475569" : "#cbd5e1"}` }}>
                      {["Owner(s) Assignment", "Credit Union (CU) Name", "Core / Integration Summary", "Target Sync Date", "Status", ""].map(h => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: "#475569", textTransform: "uppercase", fontSize: 11, fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExecSummary.map((item, idx) => {
                      const matchedColor = statusColors[item.status.toUpperCase()] || { bg: "#eff6ff", text: "#1e40af", dot: "#3b82f6" };
                      return (
                        <tr key={item.id} style={{ borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, background: darkMode ? (idx % 2 === 0 ? "#1e293b" : "#161e2b") : (idx % 2 === 0 ? "#fff" : "#fafbfc") }}>
                          <td style={{ padding: "10px 20px", minWidth: 220 }}>
                            <input value={item.owners} onChange={e => updateExecSummaryCell(item.id, "owners", e.target.value)} style={{ background: "transparent", border: `1px dashed ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 4, padding: "6px 10px", width: "100%", color: darkMode ? "#fff" : "#000", fontWeight: 600 }} />
                          </td>
                          <td style={{ padding: "10px 20px", minWidth: 240 }}>
                            <input value={item.cuName} onChange={e => updateExecSummaryCell(item.id, "cuName", e.target.value)} style={{ background: "transparent", border: `1px dashed ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 4, padding: "6px 10px", width: "100%", color: darkMode ? "#fff" : "#000", fontWeight: 700 }} />
                          </td>
                          <td style={{ padding: "10px 20px", whiteSpace: "normal", minWidth: 360 }}>
                            <input value={item.coreSummary} onChange={e => updateExecSummaryCell(item.id, "coreSummary", e.target.value)} style={{ background: "transparent", border: `1px dashed ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 4, padding: "6px 10px", width: "100%", color: darkMode ? "#cbd5e1" : "#475569", fontSize: 12 }} />
                          </td>
                          <td style={{ padding: "10px 20px" }}>
                            <input type="date" value={item.targetDate} onChange={e => updateExecSummaryCell(item.id, "targetDate", e.target.value)} style={{ border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 6, padding: "6px 10px", background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#fff" : "#000", fontSize: 12 }} />
                          </td>
                          <td style={{ padding: "10px 20px" }}>
                            <select value={item.status} onChange={e => updateExecSummaryCell(item.id, "status", e.target.value)} style={{ border: `1px solid ${matchedColor.dot}`, borderRadius: 6, padding: "6px 10px", background: matchedColor.bg, color: matchedColor.text, fontWeight: "700", fontSize: 11 }}>
                              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: "10px 20px" }}>
                            <button onClick={() => deleteExecSummaryRow(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <button onClick={appendExecSummaryRow} style={{ width: "100%", background: "#8b5cf6", border: "none", color: "#fff", padding: "12px", borderRadius: 8, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)" }}>+ Inject New Custom Executive Summary Account Line</button>
          </div>
        )}

        {/* --- TAB VIEWPORT: COMPLETED --- */}
        {activeTab === "completed" && (
          <div>
            <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Completed Safe Milestones Logs</h1>
                <p style={{ color: "#64748b", fontSize: 14, margin: "6px 0 0" }}>Archived historical records of successfully launched configurations</p>
              </div>
              <button onClick={() => exportToCSV("completed")} style={{ background: "#10b981", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, fontSize: 13, fontWeight: 700 }}>Export Complete Set (CSV)</button>
            </div>
            <div style={{ background: darkMode ? "#1e293b" : "#fff", borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: darkMode ? "#112e20" : "#f0fdf4", borderBottom: `2px solid ${darkMode ? "#166534" : "#bbf7d0"}` }}>
                    {["Financial Institution", "Deployment Type", "Executed Work Scope", "Active Operations"].map(h => (
                      <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: "#166534" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {completedProjects.map((p, i) => {
                    const ac = segmentAccents[p.type || "onboarding"] || "#6366f1";
                    return (
                      <tr key={p.id} style={{ background: darkMode ? (i % 2 === 0 ? "#1e293b" : "#161e2b") : "#fff" }}>
                        <td style={{ padding: "14px 20px", fontWeight: 700 }}>{p.customer}</td>
                        <td style={{ padding: "14px 20px", fontWeight: 600, textTransform: "capitalize", color: ac }}>{p.type}</td>
                        <td style={{ padding: "14px 20px" }}>{p.activity}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <button onClick={() => updateCompletionHandler(p.type || "onboarding", p.id, false)} style={{ background: "#0284c7", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>🔄 Restore to Active</button>
                        </td>
                      </tr>
                    );
                  })}
                  {completedProjects.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>No items present in verification warehouse archive logs.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ADMINISTRATIVE ACCESS MATRIX MANAGEMENT --- */}
        {activeTab === "admin" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>System Administrative Suite</h2>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>Manage resource routing properties and role-based privilege parameters.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 32 }}>
              <div style={{ background: darkMode ? "#1e293b" : "#ffffff", borderRadius: 12, padding: 24, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
                <h3 style={{ margin: "0 0 14px 0", fontSize: 14, fontWeight: 700 }}>Identity Access & Granular Permissions Directory</h3>
                <form onSubmit={handleAddUser} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 20 }}>
                  <input type="text" placeholder="Full Employee Name" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} style={{ border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 6, padding: "8px 12px", background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#f8fafc" : "#0f172a", fontSize: 13 }} />
                  <input type="email" placeholder="tyfone.com account" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={{ border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 6, padding: "8px 12px", background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#f8fafc" : "#0f172a", fontSize: 13 }} />
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 6, padding: "8px 12px", background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#f8fafc" : "#0f172a", fontSize: 13 }}>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button type="submit" style={{ gridColumn: "1 / -1", background: "#2563eb", color: "#fff", border: "none", padding: "10px", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Commit Profile Record Entry</button>
                </form>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {userDirectory.map(u => {
                    const accessTypeDescription = roleAccessDescriptors[u.role] || "Strict Read-Only Access";
                    return (
                      <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: darkMode ? "#0f172a" : "#f8fafc", borderRadius: 8, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{u.email}</div>
                          <div style={{ fontSize: 11, color: "#8b5cf6", marginTop: 2, fontWeight: 600 }}>🛡️ Security Access Profile: <span style={{ textDecoration: "underline" }}>{accessTypeDescription}</span></div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <select value={u.role} onChange={e => handleUpdateUserRole(u.id, e.target.value)} style={{ border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 6, padding: "4px 8px", background: darkMode ? "#1e293b" : "#fff", color: darkMode ? "#f8fafc" : "#0f172a", fontSize: 12 }}>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                          <button onClick={() => handleDeleteUser(u.id)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Revoke</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: darkMode ? "#1e293b" : "#ffffff", borderRadius: 12, padding: 24, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, display: "flex", columnGap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 700 }}>Task Assignment Resource Keys</h3>
                  <form onSubmit={handleCreateResource} style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                    <input type="text" placeholder="Add unique resource name string..." value={newOwnerInput} onChange={e => setNewOwnerInput(e.target.value)} style={{ flex: 1, border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`, borderRadius: 6, padding: "8px 12px", background: darkMode ? "#0f172a" : "#fff", color: darkMode ? "#f8fafc" : "#0f172a", fontSize: 13 }} />
                    <button type="submit" style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Inject Key</button>
                  </form>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: "280px", overflowY: "auto" }}>
                    {ownersList.map(owner => (
                      <span key={owner} style={{ background: darkMode ? "#0f172a" : "#f1f5f9", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>👤 {owner} {owner !== "TBD" && <button onClick={() => handleDeleteOwner(owner)} style={{ border: "none", background: "transparent", color: "#ef4444", cursor: "pointer" }}>×</button>}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}