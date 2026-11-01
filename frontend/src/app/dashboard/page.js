"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function ScreenerDashboard() {
  const [jobDescription, setJobDescription] = useState("");
  const [jdAnalysis, setJdAnalysis] = useState(null);
  const [isAnalyzingJd, setIsAnalyzingJd] = useState(false);
  const [isEnhancingJd, setIsEnhancingJd] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isScreening, setIsScreening] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [activeModalCandidate, setActiveModalCandidate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // JD Editing Modal State
  const [isEditJdModalOpen, setIsEditJdModalOpen] = useState(false);
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editDomain, setEditDomain] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editSkills, setEditSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState("");

  // Detailed Candidate Projects & Recruiter Report State
  const [candidateModalTab, setCandidateModalTab] = useState("overview"); // "overview" | "projects" | "report"
  const [deepReportData, setDeepReportData] = useState({});
  const [isLoadingDeepReport, setIsLoadingDeepReport] = useState(false);

  const fetchDeepReport = async (candidate) => {
    if (!candidate) return;
    if (deepReportData[candidate.filename]) {
      setCandidateModalTab("report");
      return;
    }
    setIsLoadingDeepReport(true);
    setCandidateModalTab("report");
    try {
      const formData = new FormData();
      formData.append("resume_text", candidate.raw_text || "");
      formData.append("job_description", jobDescription || "");
      formData.append("filename", candidate.filename);

      const res = await fetch(`${API_BASE}/api/candidate-deep-report`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setDeepReportData((prev) => ({
          ...prev,
          [candidate.filename]: data,
        }));
      }
    } catch (e) {
      console.error("Deep report fetch error:", e);
    } finally {
      setIsLoadingDeepReport(false);
    }
  };

  const openEditJdModal = () => {
    if (!jdAnalysis) return;
    setEditRoleTitle(jdAnalysis.role_title || "");
    setEditDomain(jdAnalysis.detected_domain || "");
    setEditSummary(jdAnalysis.summary || "");
    setEditSkills([...(jdAnalysis.skills || [])]);
    setNewSkillInput("");
    setIsEditJdModalOpen(true);
  };

  const handleAddEditSkill = () => {
    const val = newSkillInput.trim().toLowerCase();
    if (val && !editSkills.includes(val)) {
      setEditSkills([...editSkills, val]);
      setNewSkillInput("");
    }
  };

  const handleRemoveEditSkill = (skillToRemove) => {
    setEditSkills(editSkills.filter((s) => s !== skillToRemove));
  };

  const handleSaveJdEdits = () => {
    if (jdAnalysis) {
      setJdAnalysis({
        ...jdAnalysis,
        role_title: editRoleTitle.trim() || jdAnalysis.role_title,
        detected_domain: editDomain.trim() || jdAnalysis.detected_domain,
        summary: editSummary.trim(),
        skills: editSkills,
      });
    }
    setIsEditJdModalOpen(false);
  };

  // Quick remove directly from the card
  const handleDirectRemoveSkill = (skillToRemove) => {
    if (!jdAnalysis || !jdAnalysis.skills) return;
    setJdAnalysis({
      ...jdAnalysis,
      skills: jdAnalysis.skills.filter((s) => s !== skillToRemove),
    });
  };

  // Backend Health
  useEffect(() => {
    async function init() {
      try {
        const health = await fetch(`${API_BASE}/api/health`);
        if (health.ok) setBackendStatus("online");
        else setBackendStatus("offline");
      } catch (e) {
        setBackendStatus("offline");
      }
    }
    init();
  }, []);

  // Function to analyze JD via API (called on text blur or file upload)
  const runJdAnalysis = async (text, file = null) => {
    if (!text && !file) return;
    setIsAnalyzingJd(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else if (text) {
        formData.append("text", text);
      }

      const res = await fetch(`${API_BASE}/api/analyze-jd`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setJdAnalysis(data);
        if (data.jd_text && !jobDescription) {
          setJobDescription(data.jd_text);
        }
      }
    } catch (e) {
      console.error("JD analysis error:", e);
    } finally {
      setIsAnalyzingJd(false);
    }
  };

  // Handle uploading a JD File (.pdf, .docx, .txt)
  const handleJdFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      runJdAnalysis(null, file);
    }
  };

  // Enhance generic role / brief JD using Groq LLM
  const handleEnhanceJd = async () => {
    const textToEnhance = jobDescription.trim() || (jdAnalysis ? jdAnalysis.role_title : "");
    if (!textToEnhance) {
      setError("Please type a role name or job description to enhance.");
      return;
    }

    setIsEnhancingJd(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("text", textToEnhance);
      const res = await fetch(`${API_BASE}/api/enhance-jd`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Enhancement failed");
      const data = await res.json();
      setJobDescription(data.enhanced_jd_text);
      setJdAnalysis({
        role_title: data.role_title,
        detected_domain: data.category,
        confidence: 96.0,
        skills: data.skills,
        summary: data.summary,
        jd_text: data.enhanced_jd_text,
        word_count: data.enhanced_jd_text.split(/\s+/).length,
        is_enhanced: true
      });
    } catch (e) {
      console.error(e);
      setError("Could not enhance job description with Groq.");
    } finally {
      setIsEnhancingJd(false);
    }
  };

  // Handle Candidate Resume Uploads
  const handleResumeInput = (e) => {
    if (e.target.files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
      setError("");
    }
  };

  const handleResumeDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
      setError("");
    }
  };

  const handleRemoveResume = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Run Candidate Screening
  const handleScreenCandidates = async () => {
    const jdText = jobDescription.trim() || (jdAnalysis ? jdAnalysis.jd_text : "");
    if (!jdText) {
      setError("Please paste or upload a Job Description first.");
      return;
    }
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one candidate resume file (.pdf, .docx, or .txt).");
      return;
    }

    setIsScreening(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("job_description", jdText);
      if (jdAnalysis && jdAnalysis.skills && jdAnalysis.skills.length > 0) {
        formData.append("explicit_skills", JSON.stringify(jdAnalysis.skills));
      }
      uploadedFiles.forEach((f) => formData.append("files", f));

      const res = await fetch(`${API_BASE}/api/screen`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Screening failed.");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message || "Screening error.");
    } finally {
      setIsScreening(false);
    }
  };

  // Export Shortlist CSV
  const handleExportCSV = () => {
    if (!results || !results.candidates) return;

    const headers = ["Rank", "Candidate File", "Fit Score (%)", "Domain", "Confidence", "Cosine Sim (%)", "Skill Overlap (%)", "Matched Skills"];
    const rows = results.candidates.map((c) => [
      c.rank,
      `"${c.filename}"`,
      c.fit_score,
      `"${c.predicted_domain}"`,
      `"${c.confidence}%"`,
      c.text_similarity,
      c.skill_match_percentage,
      `"${c.matched_skills.join(", ")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `shortlisted_candidates_${jdAnalysis ? jdAnalysis.role_title.replace(/\s+/g, "_") : "role"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const candidatesToShow = results
    ? results.candidates.filter(
        (c) =>
          c.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.predicted_domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.matched_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className={styles.container}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" className={styles.logo} style={{ textDecoration: "none" }}>
            <span>talentai</span>
            <span className={styles.logoDot}></span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500, marginLeft: "4px" }}>
              / screener
            </span>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {results && (
            <button className={styles.btnSecondary} onClick={handleExportCSV}>
              📥 Export CSV
            </button>
          )}
        </div>
      </header>

      {/* 1 and 2 Parallel Layout */}
      <div className={styles.inputsParallelGrid}>
        {/* 1. Job Description Ingestion */}
        <div className={styles.panelCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>1. Target Job Description</h2>
            <div className={styles.cardHeaderActions}>
              <input
                id="jd-file-input"
                type="file"
                accept=".pdf,.docx,.txt"
                style={{ display: "none" }}
                onChange={handleJdFileUpload}
              />
              <button
                className={styles.uploadJdBtn}
                onClick={() => document.getElementById("jd-file-input").click()}
                title="Upload JD file (PDF, Word, or Text)"
              >
                📁 Upload JD File
              </button>
              <button
                className={styles.enhanceJdBtn}
                onClick={handleEnhanceJd}
                disabled={isEnhancingJd || !jobDescription.trim()}
              >
                {isEnhancingJd ? "Improving..." : "Improve JD"}
              </button>
            </div>
          </div>

          <textarea
            className={styles.textarea}
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              if (!e.target.value.trim()) setJdAnalysis(null);
            }}
            onBlur={() => {
              if (jobDescription.trim().length > 30) {
                runJdAnalysis(jobDescription.trim());
              }
            }}
            placeholder="Type a role name (e.g. 'Software Engineer') or paste/upload a full Job Description..."
          />

          {/* Dynamic AI Analysis Banner */}
          {isAnalyzingJd && (
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", fontStyle: "italic" }}>
              Analyzing job role and extracting skills with ML & Groq...
            </div>
          )}

          {jdAnalysis && (
            <div className={styles.roleBanner}>
              <div className={styles.roleTitleRow}>
                <div className={styles.roleTitle}>
                  🏷️ {jdAnalysis.role_title}
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {jdAnalysis.is_enhanced && (
                    <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "9999px", border: "1px solid #FDE68A" }}>
                      Improved
                    </span>
                  )}
                  <div className={styles.domainTag}>
                    ML Domain: {jdAnalysis.detected_domain}
                  </div>
                  <button
                    type="button"
                    className={styles.editJdBtn}
                    onClick={openEditJdModal}
                    title="Edit role title, domain & keywords"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>

              {jdAnalysis.summary && (
                <div className={styles.roleSummary}>
                  "{jdAnalysis.summary}"
                </div>
              )}

              {jdAnalysis.skills && jdAnalysis.skills.length > 0 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
                      Detected Requirements ({jdAnalysis.skills.length}):
                    </div>
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
                      click ✕ to remove or ✏️ Edit
                    </span>
                  </div>
                  <div className={styles.detectedSkills}>
                    {jdAnalysis.skills.map((s) => (
                      <span key={s} className={styles.detectedSkillChip}>
                        <span>✓ {s}</span>
                        <span
                          className={styles.chipRemoveCross}
                          onClick={() => handleDirectRemoveSkill(s)}
                          title={`Remove ${s}`}
                        >
                          ✕
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Upload Candidate Resumes */}
        <div className={styles.panelCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>2. Upload Candidate Resumes</h2>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>PDF / DOCX</span>
          </div>

          <div
            className={styles.dropzone}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleResumeDrop}
            onClick={() => document.getElementById("candidate-file-picker").click()}
          >
            <input
              id="candidate-file-picker"
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              style={{ display: "none" }}
              onChange={handleResumeInput}
            />
            <div className={styles.dropzoneIcon}>📂</div>
            <div className={styles.dropzoneTitle}>
              Tap or drag & drop candidate resumes
            </div>
            <div className={styles.dropzoneSubtitle}>
              Supports batch upload of multiple files simultaneously
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className={styles.fileChips}>
              {uploadedFiles.map((f, i) => (
                <div key={i} className={styles.fileChip}>
                  <span>📄 {f.name} ({(f.size / 1024).toFixed(0)} KB)</span>
                  <button onClick={() => handleRemoveResume(i)} className={styles.chipRemove}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginTop: "18px" }}>
            <button
              className={styles.btnBlack}
              style={{ width: "100%", justifyContent: "center", padding: "12px 20px", fontSize: "14px" }}
              onClick={handleScreenCandidates}
              disabled={isScreening}
            >
              {isScreening ? "Processing NLP Models..." : "Screen Resumes"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Ranked Results Leaderboard Underneath (Full Width) */}
      <div className={styles.resultsSectionFullWidth}>
        <div className={styles.resultsCard}>
            <div className={styles.resultsHeader}>
              <div>
                <h2 className={styles.cardTitle}>
                  3. Ranked Leaderboard {results ? `(${results.candidates.length})` : ""}
                </h2>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {results
                    ? `Role: ${jdAnalysis ? jdAnalysis.role_title : "Target Role"} • 50% Text Cosine + 50% Skill Match`
                    : "Upload resumes and click 'Screen Resumes' to view ranked candidates"}
                </p>
              </div>

              {results && (
                <input
                  type="text"
                  placeholder="Filter by name or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              )}
            </div>

            {results ? (
              <div className={styles.candidateList}>
                {candidatesToShow.map((c) => {
                  const initial = c.filename.charAt(0).toUpperCase();
                  const scoreClass =
                    c.fit_score >= 40 ? styles.scoreHigh : c.fit_score >= 20 ? styles.scoreMid : styles.scoreLow;

                  return (
                    <div
                      key={c.filename}
                      className={styles.candidateItem}
                      onClick={() => setActiveModalCandidate(c)}
                    >
                      <div className={styles.candidateLeft}>
                        <div className={styles.candidateAvatar}>{initial}</div>
                        <div className={styles.candidateBody}>
                          <div className={styles.candidateTitleRow}>
                            <span className={styles.candidateName}>#{c.rank} • {c.filename}</span>
                            {c.is_shortlisted !== undefined && (
                              <span className={c.is_shortlisted ? styles.shortlistBadgeYes : styles.shortlistBadgeNo}>
                                {c.is_shortlisted ? `✓ Shortlisted (${c.shortlist_probability}%)` : `Review (${c.shortlist_probability}%)`}
                              </span>
                            )}
                          </div>
                          <div className={styles.candidateMeta}>
                            <span style={{ fontWeight: 600, color: "var(--text-black)" }}>
                              🏷️ {c.predicted_domain} ({c.confidence}% conf)
                            </span>
                            <span>•</span>
                            <span>{c.word_count} words</span>
                            <span>•</span>
                            <span>Cosine: {c.text_similarity}%</span>
                          </div>

                          <div className={styles.skillsPills}>
                            {c.matched_skills.map((s) => (
                              <span key={s} className={styles.matchedBadge}>
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className={`${styles.scoreCircle} ${scoreClass}`}>
                        {Math.round(c.fit_score)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>📄</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-black)" }}>
                  No candidates screened yet
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "380px", margin: "8px auto 0", lineHeight: 1.6 }}>
                  Upload candidate resumes (PDF or DOCX) in the panel on the left and click <strong>Screen Resumes</strong> to evaluate candidate match.
                </p>
              </div>
            )}
          </div>
        </div>

      {/* Candidate Profile Modal */}
      {activeModalCandidate && (
        <div className={styles.modalBackdrop} onClick={() => setActiveModalCandidate(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800 }}>{activeModalCandidate.filename}</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Rank #{activeModalCandidate.rank} • Fit Score: {activeModalCandidate.fit_score}% • {activeModalCandidate.predicted_domain}
                </span>
              </div>
              <button className={styles.closeBtn} onClick={() => setActiveModalCandidate(null)}>
                ✕
              </button>
            </div>

            {/* Segmented Navigation Tabs */}
            <div className={styles.modalTabs}>
              <button
                type="button"
                className={`${styles.modalTab} ${candidateModalTab === "overview" ? styles.modalTabActive : ""}`}
                onClick={() => setCandidateModalTab("overview")}
              >
                📊 Overview
              </button>
              <button
                type="button"
                className={`${styles.modalTab} ${candidateModalTab === "projects" ? styles.modalTabActive : ""}`}
                onClick={() => setCandidateModalTab("projects")}
              >
                💼 Projects ({activeModalCandidate.projects?.length || 0})
              </button>
              <button
                type="button"
                className={`${styles.modalTab} ${candidateModalTab === "report" ? styles.modalTabActive : ""}`}
                onClick={() => {
                  setCandidateModalTab("report");
                  if (!deepReportData[activeModalCandidate.filename] && !isLoadingDeepReport) {
                    fetchDeepReport(activeModalCandidate);
                  }
                }}
              >
                🧠 AI Report
              </button>
            </div>

            {/* TAB 1: OVERVIEW & SKILLS */}
            {candidateModalTab === "overview" && (
              <div>
                <div className={styles.modalMetricsRow}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Rank</div>
                    <div style={{ fontSize: "18px", fontWeight: 800 }}>#{activeModalCandidate.rank}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Fit Score</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#065F46" }}>{activeModalCandidate.fit_score}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Predicted Domain</div>
                    <div style={{ fontSize: "13px", fontWeight: 700 }}>{activeModalCandidate.predicted_domain} ({activeModalCandidate.confidence}%)</div>
                  </div>
                  {activeModalCandidate.shortlist_probability !== undefined && (
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>AI Shortlist Decision</div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: activeModalCandidate.is_shortlisted ? "#15803D" : "#6B7280" }}>
                        {activeModalCandidate.decision} ({activeModalCandidate.shortlist_probability}%)
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate Extracted Features (30k Candidate ML Decision Model) */}
                {activeModalCandidate.features && (
                  <div className={styles.featureGrid}>
                    <div className={styles.featureItem}>
                      <span className={styles.featureLabel}>Experience</span>
                      <span className={styles.featureValue}>{activeModalCandidate.features.years_experience} Years</span>
                    </div>
                    <div className={styles.featureItem}>
                      <span className={styles.featureLabel}>Education</span>
                      <span className={styles.featureValue}>{activeModalCandidate.features.education_level}</span>
                    </div>
                    <div className={styles.featureItem}>
                      <span className={styles.featureLabel}>Projects</span>
                      <span className={styles.featureValue}>{activeModalCandidate.features.project_count} Detected</span>
                    </div>
                    <div className={styles.featureItem}>
                      <span className={styles.featureLabel}>Skills Match</span>
                      <span className={styles.featureValue}>{activeModalCandidate.features.skills_match_score}%</span>
                    </div>
                    <div className={styles.featureItem}>
                      <span className={styles.featureLabel}>Resume Length</span>
                      <span className={styles.featureValue}>{activeModalCandidate.features.resume_length} words</span>
                    </div>
                    <div className={styles.featureItem}>
                      <span className={styles.featureLabel}>GitHub Activity</span>
                      <span className={styles.featureValue}>{activeModalCandidate.features.github_activity} pts</span>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                    Matched Skills ({activeModalCandidate.matched_skills.length}):
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {activeModalCandidate.matched_skills.map((s) => (
                      <span key={s} className={styles.matchedBadge}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                    Missing Skills:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {activeModalCandidate.missing_skills.map((s) => (
                      <span key={s} className={styles.missingBadge}>
                        ✕ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>Text Cosine Sim: <b>{activeModalCandidate.text_similarity}%</b></span>
                  <span>Skill Match: <b>{activeModalCandidate.skill_match_percentage}%</b></span>
                </div>
              </div>
            )}

            {/* TAB 2: DETAILED PROJECTS & EXPERIENCE */}
            {candidateModalTab === "projects" && (
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <div className={styles.reportSectionTitle}>
                    🛠️ Candidate Engineering Projects ({activeModalCandidate.projects?.length || 0})
                  </div>
                  {activeModalCandidate.projects && activeModalCandidate.projects.length > 0 ? (
                    <div>
                      {activeModalCandidate.projects.map((proj, idx) => (
                        <div key={idx} className={styles.projectCard}>
                          <div className={styles.projectTitleRow}>
                            <span className={styles.projectTitle}>{proj.title}</span>
                          </div>
                          {proj.tech_stack && proj.tech_stack.length > 0 && (
                            <div className={styles.projectTechs}>
                              {proj.tech_stack.map((t, ti) => (
                                <span key={ti} className={styles.projectTechChip}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          {proj.description && (
                            <p className={styles.projectDesc}>{proj.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "12px", background: "#FAF8F5", borderRadius: "8px" }}>
                      No structured project headers detected. Switch to "AI Recruiter Report" to analyze candidate work.
                    </div>
                  )}
                </div>

                {activeModalCandidate.work_experience && activeModalCandidate.work_experience.length > 0 && (
                  <div>
                    <div className={styles.reportSectionTitle}>
                      💼 Work Experience & Internships ({activeModalCandidate.work_experience.length})
                    </div>
                    {activeModalCandidate.work_experience.map((exp, idx) => (
                      <div key={idx} className={styles.experienceCard}>
                        <div className={styles.experienceHeader}>
                          <span className={styles.experienceRole}>{exp.role || exp.title}</span>
                          {exp.company && (
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
                              {exp.company}
                            </span>
                          )}
                        </div>
                        {exp.summary && (
                          <p style={{ fontSize: "12px", color: "var(--text-dark)", lineHeight: 1.5, marginTop: "4px" }}>
                            {exp.summary}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DEEP AI RECRUITER REPORT */}
            {candidateModalTab === "report" && (
              <div className={styles.reportBox}>
                {isLoadingDeepReport ? (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ fontSize: "28px", marginBottom: "10px" }}>⏳</div>
                    <div style={{ fontSize: "14px", fontWeight: 700 }}>Generating Detailed Recruiter Assessment...</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Evaluating project architecture, engineering strengths, and crafting interview questions with Groq LLM.
                    </div>
                  </div>
                ) : deepReportData[activeModalCandidate.filename] ? (
                  <div>
                    {/* Executive Verdict */}
                    {deepReportData[activeModalCandidate.filename].recruiter_evaluation?.overall_verdict && (
                      <div style={{ marginBottom: "14px" }}>
                        <div className={styles.reportSectionTitle}>Executive Recruiter Verdict</div>
                        <div className={styles.verdictBanner}>
                          {deepReportData[activeModalCandidate.filename].recruiter_evaluation.overall_verdict}
                        </div>
                      </div>
                    )}

                    {/* Key Strengths */}
                    {deepReportData[activeModalCandidate.filename].recruiter_evaluation?.key_strengths && (
                      <div style={{ marginBottom: "14px" }}>
                        <div className={styles.reportSectionTitle}>Key Engineering Strengths</div>
                        <div className={styles.strengthList}>
                          {deepReportData[activeModalCandidate.filename].recruiter_evaluation.key_strengths.map((str, i) => (
                            <div key={i} className={styles.strengthItem}>
                              <span style={{ color: "#16A34A", fontWeight: 800 }}>✓</span>
                              <span>{str}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Project Alignment Analysis */}
                    {deepReportData[activeModalCandidate.filename].recruiter_evaluation?.project_alignment_analysis && (
                      <div style={{ marginBottom: "14px" }}>
                        <div className={styles.reportSectionTitle}>Project & JD Alignment Analysis</div>
                        <div style={{ background: "#FAF8F5", border: "1px solid #ECE6D8", borderRadius: "8px", padding: "10px 14px", fontSize: "12.5px", lineHeight: 1.55 }}>
                          {deepReportData[activeModalCandidate.filename].recruiter_evaluation.project_alignment_analysis}
                        </div>
                      </div>
                    )}

                    {/* Technical Interview Questions to Probe Projects */}
                    {deepReportData[activeModalCandidate.filename].recruiter_evaluation?.technical_interview_questions && (
                      <div style={{ marginBottom: "14px" }}>
                        <div className={styles.reportSectionTitle}>Recommended Interview Questions to Probe Their Projects</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {deepReportData[activeModalCandidate.filename].recruiter_evaluation.technical_interview_questions.map((q, i) => (
                            <div key={i} className={styles.questionItem}>
                              <span style={{ fontWeight: 800 }}>Q{i + 1}:</span>
                              <span>{q}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "30px 16px" }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>📋</div>
                    <div style={{ fontSize: "14px", fontWeight: 800, marginBottom: "4px" }}>
                      Deep Project & Recruiter Assessment
                    </div>
                    <p style={{ fontSize: "12.5px", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 16px", lineHeight: 1.5 }}>
                      Run full LLM analysis across {activeModalCandidate.filename}'s projects, technical architecture, and generate interview probing questions.
                    </p>
                    <button
                      type="button"
                      className={styles.generateReportBtn}
                      onClick={() => fetchDeepReport(activeModalCandidate)}
                    >
                      ✨ Generate In-Depth Assessment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Interactive JD Requirements & Keywords Edit Modal */}
      {isEditJdModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsEditJdModalOpen(false)}>
          <div className={styles.editModalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.editFormGroup}>
              <label className={styles.editLabel}>Target Job Title</label>
              <input
                type="text"
                className={styles.editInput}
                value={editRoleTitle}
                onChange={(e) => setEditRoleTitle(e.target.value)}
                placeholder="e.g. Full Stack Software Engineer"
              />
            </div>

            <div className={styles.editFormGroup}>
              <label className={styles.editLabel}>Target Engineering Domain</label>
              <input
                type="text"
                className={styles.editInput}
                value={editDomain}
                onChange={(e) => setEditDomain(e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Engineer"
              />
            </div>

            <div className={styles.editFormGroup}>
              <label className={styles.editLabel}>Role Summary</label>
              <textarea
                className={styles.editTextarea}
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                placeholder="Brief summary of the role objectives..."
              />
            </div>

            <div className={styles.editFormGroup}>
              <label className={styles.editLabel}>
                Required Skills & Keywords ({editSkills.length})
              </label>
              <div className={styles.skillsEditorBox}>
                <div className={styles.addSkillRow}>
                  <input
                    type="text"
                    className={styles.editInput}
                    placeholder="Type a skill (e.g. 'redis', 'graphql', 'jest') and press Enter..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEditSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.addSkillBtn}
                    onClick={handleAddEditSkill}
                    title="Add skill"
                  >
                    +
                  </button>
                </div>

                <div className={styles.editableSkillsContainer}>
                  {editSkills.map((s) => (
                    <span key={s} className={styles.editableSkillChip}>
                      <span>✓ {s}</span>
                      <button
                        type="button"
                        className={styles.removeSkillBtn}
                        onClick={() => handleRemoveEditSkill(s)}
                        title={`Remove ${s}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {editSkills.length === 0 && (
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", padding: "6px" }}>
                      No keywords specified. Add some keywords above.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalActionButtons}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setIsEditJdModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalSaveBtn}
                onClick={handleSaveJdEdits}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
