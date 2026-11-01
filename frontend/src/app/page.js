"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("leaderboard");

  const previewCandidates = [
    {
      initial: "A",
      name: "alex_fullstack_lead.pdf",
      domain: "Full Stack Developer",
      conf: "96.4%",
      score: 94.2,
      exp: "2 Years",
      projects: 8,
      status: "Shortlisted",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "CI/CD"],
    },
    {
      initial: "S",
      name: "sarah_aiml_engineer.docx",
      domain: "AI/ML Engineer",
      conf: "98.1%",
      score: 89.5,
      exp: "3 Years",
      projects: 6,
      status: "Shortlisted",
      skills: ["PyTorch", "NLP", "FastAPI", "Transformers", "Python"],
    },
    {
      initial: "D",
      name: "david_devops_cloud.pdf",
      domain: "DevOps Engineer",
      conf: "91.8%",
      score: 78.4,
      exp: "1.5 Years",
      projects: 4,
      status: "Review",
      skills: ["Kubernetes", "AWS", "Terraform", "Docker", "GitHub Actions"],
    },
    {
      initial: "V",
      name: "vikram_backend_java.docx",
      domain: "Backend Developer",
      conf: "88.5%",
      score: 64.0,
      exp: "1 Year",
      projects: 3,
      status: "Review",
      skills: ["Java", "Spring Boot", "MySQL", "REST APIs"],
    },
  ];

  return (
    <div className={styles.container}>
      {/* Top Navbar - Databricks Floating Enterprise Bar */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>◆</span>
            <span className={styles.logoText}>talentai</span>
            <span className={styles.logoBadge}>ENTERPRISE ML</span>
          </Link>
          <div className={styles.navDivider}></div>
          <div className={styles.navLinks}>
            <a href="#architecture" className={styles.navLink}>Architecture</a>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#showcase" className={styles.navLink}>Interactive Preview</a>
            <a href="#benchmarks" className={styles.navLink}>Benchmarks (30k)</a>
            <a href="#academic" className={styles.navLink}>Academic Team</a>
          </div>
        </div>

        <div className={styles.navRight}>
          <a
            href="https://github.com/SHXZ7/resume_screening"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.gitLink}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </a>
          <Link href="/dashboard" className={styles.btnLaunch}>
            <span>Launch Screener</span>
            <span className={styles.arrowIcon}>→</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Databricks Enterprise Style */}
      <section className={styles.heroSection}>
        {/* Release Pill Badge */}
        <div className={styles.announcementWrapper}>
          <Link href="/dashboard" className={styles.announcementBadge}>
            <span className={styles.badgePulse}></span>
            <span className={styles.badgeTag}>NEW ENGINE</span>
            <span className={styles.badgeText}>
              Hybrid ML v2.0 • 30k Shortlisting Decision Engine & Project Extractor
            </span>
            <span className={styles.badgeArrow}>→</span>
          </Link>
        </div>

        {/* Hero Headline */}
        <h1 className={styles.heroHeadline}>
          The Unified Data & AI Platform for <br />
          <span className={styles.heroHighlight}>Intelligent Resume Screening</span>
        </h1>

        {/* Hero Subtitle */}
        <p className={styles.heroSubhead}>
          Accelerate technical recruiting with <strong>sublinear TF-IDF vector classification</strong> (99.43% accuracy),
          deep project extraction, and a <strong>Gradient Boosting Decision Engine</strong> trained on 30,000 enterprise candidates.
        </p>

        {/* Dual High-Impact Action CTAs */}
        <div className={styles.heroActions}>
          <Link href="/dashboard" className={styles.btnPrimaryLg}>
            <span>Launch Screener Dashboard</span>
            <span className={styles.btnIcon}>→</span>
          </Link>
          <a href="#how-it-works" className={styles.btnSecondaryLg}>
            <span>Explore 3-Stage Pipeline</span>
            <span className={styles.btnArrowDown}>↓</span>
          </a>
        </div>

        {/* Enterprise Credibility Ribbon */}
        <div className={styles.techStrip}>
          <span className={styles.techStripLabel}>BUILT WITH ENTERPRISE DATA & MACHINE LEARNING ARCHITECTURE</span>
          <div className={styles.techPills}>
            <span className={styles.techPill}>⚡ Scikit-Learn</span>
            <span className={styles.techPill}>🌳 Gradient Boosting (30k)</span>
            <span className={styles.techPill}>🚀 FastAPI Asynchronous</span>
            <span className={styles.techPill}>🧠 Groq Llama 3.3 LPU</span>
            <span className={styles.techPill}>📐 Sublinear TF-IDF Bi-grams</span>
            <span className={styles.techPill}>📄 PyPDF & pdfplumber</span>
            <span className={styles.techPill}>⚡ Next.js 16 & React 19</span>
          </div>
        </div>
      </section>

      {/* Databricks-Style Interactive Product Canvas / Showcase */}
      <section id="showcase" className={styles.showcaseSection}>
        <div className={styles.canvasHeader}>
          <div className={styles.canvasTabs}>
            <button
              type="button"
              onClick={() => setActiveTab("leaderboard")}
              className={`${styles.canvasTab} ${activeTab === "leaderboard" ? styles.canvasTabActive : ""}`}
            >
              <span className={styles.tabIcon}>🏆</span>
              <span>1. Leaderboard & Fit Ranking</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`${styles.canvasTab} ${activeTab === "projects" ? styles.canvasTabActive : ""}`}
            >
              <span className={styles.tabIcon}>💼</span>
              <span>2. Deep Project & Code Extractor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("decision")}
              className={`${styles.canvasTab} ${activeTab === "decision" ? styles.canvasTabActive : ""}`}
            >
              <span className={styles.tabIcon}>🌳</span>
              <span>3. 30k Shortlisting Decision Engine</span>
            </button>
          </div>
        </div>

        {/* Canvas Display Body */}
        <div className={styles.canvasFrame}>
          {/* Top Browser Bar */}
          <div className={styles.canvasTopbar}>
            <div className={styles.canvasDots}>
              <span className={styles.dotRed}></span>
              <span className={styles.dotYellow}></span>
              <span className={styles.dotGreen}></span>
            </div>
            <div className={styles.canvasUrl}>
              <span className={styles.urlLock}>🔒</span>
              <span>talentai.ml/dashboard/decision-intelligence</span>
            </div>
            <div className={styles.canvasLiveBadge}>
              <span className={styles.livePulse}></span>
              <span>ML Inference Live</span>
            </div>
          </div>

          {/* Tab 1: Leaderboard View */}
          {activeTab === "leaderboard" && (
            <div className={styles.canvasContent}>
              <div className={styles.canvasSubHeader}>
                <div>
                  <h3 className={styles.canvasTitle}>Applicant Ranking & Domain Alignment</h3>
                  <p className={styles.canvasMeta}>
                    Evaluated against <strong>Software Engineer Intern</strong> • 27 Job Requirements extracted
                  </p>
                </div>
                <Link href="/dashboard" className={styles.miniBtn}>
                  Test Your Own Resumes →
                </Link>
              </div>

              <div className={styles.candidateTable}>
                {previewCandidates.map((c, idx) => (
                  <div key={c.name} className={styles.candidateRow}>
                    <div className={styles.rankCol}>
                      <span className={styles.rankNum}>#{idx + 1}</span>
                    </div>

                    <div className={styles.nameCol}>
                      <div className={styles.candidateAvatar}>{c.initial}</div>
                      <div>
                        <div className={styles.candidateName}>{c.name}</div>
                        <div className={styles.candidateDomainTag}>
                          <span>{c.domain}</span>
                          <span className={styles.domainConf}>({c.conf} ML Confidence)</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.featuresCol}>
                      <span className={styles.featurePill}>💼 {c.exp}</span>
                      <span className={styles.featurePill}>🚀 {c.projects} Projects</span>
                    </div>

                    <div className={styles.decisionCol}>
                      <span
                        className={`${styles.decisionBadge} ${
                          c.status === "Shortlisted" ? styles.badgeShortlist : styles.badgeReview
                        }`}
                      >
                        {c.status === "Shortlisted" ? "✓ Shortlist" : "⟲ Review"}
                      </span>
                    </div>

                    <div className={styles.scoreCol}>
                      <div className={styles.scoreVal}>{c.score}%</div>
                      <div className={styles.scoreLabel}>Fit Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Project Extractor View */}
          {activeTab === "projects" && (
            <div className={styles.canvasContent}>
              <div className={styles.canvasSubHeader}>
                <div>
                  <h3 className={styles.canvasTitle}>Deep Project & Tech Stack Extractor</h3>
                  <p className={styles.canvasMeta}>
                    Automatically isolates engineering projects, GitHub repositories, and stack pills from candidate resumes.
                  </p>
                </div>
                <span className={styles.canvasBadgePill}>
                  ✓ Evaluates Project Complexity, Not Just Skill Keywords
                </span>
              </div>

              <div className={styles.projectsGrid}>
                <div className={styles.projectCard}>
                  <div className={styles.projectCardHeader}>
                    <div>
                      <h4 className={styles.projectName}>High-Throughput Distributed File Sync</h4>
                      <span className={styles.projectCandidate}>Candidate: alex_fullstack_lead.pdf</span>
                    </div>
                    <span className={styles.verifiedTag}>Verified Project</span>
                  </div>
                  <p className={styles.projectDesc}>
                    Engineered an asynchronous file distribution daemon in Go and Rust utilizing Raft consensus, WebSockets, and Redis pub/sub with sub-10ms peer synchronization across 12 distributed nodes.
                  </p>
                  <div className={styles.projectPills}>
                    <span className={styles.techTag}>Go</span>
                    <span className={styles.techTag}>Rust</span>
                    <span className={styles.techTag}>Raft Consensus</span>
                    <span className={styles.techTag}>WebSockets</span>
                    <span className={styles.techTag}>Redis</span>
                  </div>
                </div>

                <div className={styles.projectCard}>
                  <div className={styles.projectCardHeader}>
                    <div>
                      <h4 className={styles.projectName}>Automated Resume Intelligence & Vector Ranking</h4>
                      <span className={styles.projectCandidate}>Candidate: sarah_aiml_engineer.docx</span>
                    </div>
                    <span className={styles.verifiedTag}>Verified Project</span>
                  </div>
                  <p className={styles.projectDesc}>
                    Architected NLP vectorization engine with bi-gram TF-IDF and Gradient Boosting classifier to evaluate 30k candidates across 6 predictive hiring dimensions with 90.62% decision accuracy.
                  </p>
                  <div className={styles.projectPills}>
                    <span className={styles.techTag}>Python</span>
                    <span className={styles.techTag}>PyTorch</span>
                    <span className={styles.techTag}>FastAPI</span>
                    <span className={styles.techTag}>Scikit-Learn</span>
                    <span className={styles.techTag}>Docker</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 30k Decision Engine View */}
          {activeTab === "decision" && (
            <div className={styles.canvasContent}>
              <div className={styles.canvasSubHeader}>
                <div>
                  <h3 className={styles.canvasTitle}>30,000 Candidate Shortlisting Decision Engine</h3>
                  <p className={styles.canvasMeta}>
                    Multi-variate Gradient Boosting model trained on 30k enterprise candidates from Kaggle.
                  </p>
                </div>
                <div className={styles.aucBadge}>
                  ROC-AUC: <strong>0.9665</strong> (90.62% Test Accuracy)
                </div>
              </div>

              <div className={styles.decisionVectorGrid}>
                <div className={styles.vectorCard}>
                  <div className={styles.vectorIcon}>📅</div>
                  <div className={styles.vectorTitle}>Experience Weight</div>
                  <div className={styles.vectorValue}>2.0 Years</div>
                  <div className={styles.vectorImpact}>High Positive Impact (+28%)</div>
                </div>

                <div className={styles.vectorCard}>
                  <div className={styles.vectorIcon}>🎓</div>
                  <div className={styles.vectorTitle}>Education Level</div>
                  <div className={styles.vectorValue}>Bachelors / B.Tech</div>
                  <div className={styles.vectorImpact}>Standard Baseline Match</div>
                </div>

                <div className={styles.vectorCard}>
                  <div className={styles.vectorIcon}>🚀</div>
                  <div className={styles.vectorTitle}>Detected Projects</div>
                  <div className={styles.vectorValue}>8 Projects</div>
                  <div className={styles.vectorImpact}>High Positive Impact (+34%)</div>
                </div>

                <div className={styles.vectorCard}>
                  <div className={styles.vectorIcon}>🎯</div>
                  <div className={styles.vectorTitle}>Skill Match Ratio</div>
                  <div className={styles.vectorValue}>58.3% Overlap</div>
                  <div className={styles.vectorImpact}>14 Matched Core Skills</div>
                </div>

                <div className={styles.vectorCard}>
                  <div className={styles.vectorIcon}>📝</div>
                  <div className={styles.vectorTitle}>Document Density</div>
                  <div className={styles.vectorValue}>498 Words</div>
                  <div className={styles.vectorImpact}>Optimal Resume Length</div>
                </div>

                <div className={styles.vectorCard}>
                  <div className={styles.vectorIcon}>💻</div>
                  <div className={styles.vectorTitle}>GitHub / Portfolio</div>
                  <div className={styles.vectorValue}>350 Activity Pts</div>
                  <div className={styles.vectorImpact}>Verified Code Repositories</div>
                </div>
              </div>

              <div className={styles.decisionSummaryBox}>
                <div className={styles.summaryLeft}>
                  <div className={styles.summaryVerdict}>Model Verdict: <strong>RECOMMENDED FOR SHORTLIST</strong></div>
                  <div className={styles.summaryProb}>Ensemble Probability: <strong>94.2%</strong> Shortlist Confidence</div>
                </div>
                <Link href="/dashboard" className={styles.btnLaunchMini}>
                  Open in Screener →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Databricks 4-Column Metric / Benchmark Ribbon */}
      <section id="benchmarks" className={styles.benchmarkSection}>
        <div className={styles.benchmarkGrid}>
          <div className={styles.benchmarkCard}>
            <div className={styles.benchmarkNumber}>31,154+</div>
            <div className={styles.benchmarkLabel}>Resumes Benchmarked</div>
            <div className={styles.benchmarkDetail}>30k decision dataset + 1,154 NLP profiles</div>
          </div>
          <div className={styles.benchmarkCard}>
            <div className={styles.benchmarkNumber}>30</div>
            <div className={styles.benchmarkLabel}>Modern Tech Domains</div>
            <div className={styles.benchmarkDetail}>Full Stack, AI/ML, DevOps, Cloud, & more</div>
          </div>
          <div className={styles.benchmarkCard}>
            <div className={styles.benchmarkNumber}>99.43%</div>
            <div className={styles.benchmarkLabel}>NLP Classifier Accuracy</div>
            <div className={styles.benchmarkDetail}>0.9942 F1-Score with Sublinear TF-IDF</div>
          </div>
          <div className={styles.benchmarkCard}>
            <div className={styles.benchmarkNumber}>90.62%</div>
            <div className={styles.benchmarkLabel}>30k Decision Accuracy</div>
            <div className={styles.benchmarkDetail}>0.9665 ROC-AUC Gradient Boosting Model</div>
          </div>
        </div>
      </section>

      {/* Databricks 3-Pillar Enterprise Architecture Grid */}
      <section id="architecture" className={styles.architectureSection}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionEyebrow}>UNIFIED ML PLATFORM</span>
          <h2 className={styles.sectionTitle}>Built Like an Enterprise Lakehouse</h2>
          <p className={styles.sectionSubtitle}>
            Three specialized machine learning and language layers coordinated in an asynchronous pipeline.
          </p>
        </div>

        <div className={styles.pillarsGrid}>
          {/* Pillar 1 */}
          <div className={styles.pillarCard}>
            <div className={styles.pillarTop}>
              <span className={styles.pillarTag}>PILLAR 01</span>
              <span className={styles.pillarModel}>Sublinear TF-IDF + Logistic</span>
            </div>
            <h3 className={styles.pillarTitle}>Modern NLP & Domain Categorization</h3>
            <p className={styles.pillarText}>
              Vectorizes resumes using 6,000 sublinear bigrams and predicts candidates across 30 modern engineering domains—from Full Stack and AI/ML to DevOps and Blockchain.
            </p>
            <div className={styles.pillarSpecs}>
              <span className={styles.specItem}>✓ 30 Target Roles</span>
              <span className={styles.specItem}>✓ 99.43% Accuracy</span>
              <span className={styles.specItem}>✓ 114+ Skill Taxonomy</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className={styles.pillarCard}>
            <div className={styles.pillarTop}>
              <span className={styles.pillarTag}>PILLAR 02</span>
              <span className={styles.pillarModel}>Gradient Boosting (30k Candidates)</span>
            </div>
            <h3 className={styles.pillarTitle}>Multi-Feature Shortlisting Decision Engine</h3>
            <p className={styles.pillarText}>
              Moves beyond basic word matching. Extracts 6 quantitative features (experience, projects, education, length, git score) to predict shortlisting likelihood with 90.62% accuracy.
            </p>
            <div className={styles.pillarSpecs}>
              <span className={styles.specItem}>✓ 30,000 Training Samples</span>
              <span className={styles.specItem}>✓ 0.9665 ROC-AUC Score</span>
              <span className={styles.specItem}>✓ Explainable Weights</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className={styles.pillarCard}>
            <div className={styles.pillarTop}>
              <span className={styles.pillarTag}>PILLAR 03</span>
              <span className={styles.pillarModel}>Groq LPU + Llama 3.3 Engine</span>
            </div>
            <h3 className={styles.pillarTitle}>Generative Recruiter Intelligence & Interview Guide</h3>
            <p className={styles.pillarText}>
              Automatically audits the candidate’s engineering projects, identifies real architecture strengths, and generates 3 tailored technical interview questions for hiring managers.
            </p>
            <div className={styles.pillarSpecs}>
              <span className={styles.specItem}>✓ Real Project Audits</span>
              <span className={styles.specItem}>✓ Executive Verdicts</span>
              <span className={styles.specItem}>✓ Deep Interview Questions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modernised "How TalentAI Works" Workflow Section */}
      <section id="how-it-works" className={styles.howSection}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionEyebrow}>STEP-BY-STEP WORKFLOW</span>
          <h2 className={styles.sectionTitle}>How TalentAI Works</h2>
          <p className={styles.sectionSubtitle}>
            From unstructured PDF documents to actionable candidate rankings in under one second.
          </p>
        </div>

        <div className={styles.modernStepsGrid}>
          {/* Step 1 */}
          <div className={styles.modernStepCard}>
            <div className={styles.stepTopRow}>
              <span className={styles.stepPill}>STEP 01</span>
              <span className={styles.stepLatency}>~25ms</span>
            </div>
            <h3 className={styles.modernStepTitle}>Define Role Requirements</h3>
            <p className={styles.modernStepText}>
              Paste a custom job description or choose a pre-configured template. Our NLP engine tokenizes the text, strips noise, and extracts core skill competencies.
            </p>
            {/* Visual Micro-Mockup inside Step 1 */}
            <div className={styles.microMockup}>
              <div className={styles.microHeader}>
                <span className={styles.microDot}></span>
                <span className={styles.microRole}>Full Stack Developer</span>
              </div>
              <div className={styles.microTags}>
                <span className={styles.tagYellow}>✓ React</span>
                <span className={styles.tagYellow}>✓ Node.js</span>
                <span className={styles.tagYellow}>✓ Docker</span>
                <span className={styles.tagYellow}>✓ PostgreSQL</span>
              </div>
            </div>
            <div className={styles.modernStepFooter}>
              <span>⚡ Tokenization & Regex Taxonomy</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className={styles.modernStepCard}>
            <div className={styles.stepTopRow}>
              <span className={styles.stepPill}>STEP 02</span>
              <span className={styles.stepLatency}>~140ms</span>
            </div>
            <h3 className={styles.modernStepTitle}>Multi-Format Parsing & Project Extraction</h3>
            <p className={styles.modernStepText}>
              Batch upload PDF and DOCX files. The parser extracts clean text, identifies work duration, and segments technical projects and GitHub portfolios.
            </p>
            {/* Visual Micro-Mockup inside Step 2 */}
            <div className={styles.microMockup}>
              <div className={styles.microDocRow}>
                <span className={styles.docIcon}>📄</span>
                <span className={styles.docName}>candidate_resume.pdf</span>
                <span className={styles.docStatus}>Parsed ✓</span>
              </div>
              <div className={styles.microExtracted}>
                <span>💼 2 Yrs Exp</span>
                <span>•</span>
                <span>🚀 8 Projects Found</span>
                <span>•</span>
                <span>🎓 B.Tech</span>
              </div>
            </div>
            <div className={styles.modernStepFooter}>
              <span>📂 pdfplumber, pypdf & Regex Parsers</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className={styles.modernStepCard}>
            <div className={styles.stepTopRow}>
              <span className={styles.stepPill}>STEP 03</span>
              <span className={styles.stepLatency}>~80ms</span>
            </div>
            <h3 className={styles.modernStepTitle}>ML Matching, Decision & Deep Report</h3>
            <p className={styles.modernStepText}>
              Calculates Cosine Similarity, predicts career domain, feeds 6 features into the 30k Decision Engine, and generates an LLM recruiter evaluation.
            </p>
            {/* Visual Micro-Mockup inside Step 3 */}
            <div className={styles.microMockup}>
              <div className={styles.microScoreRow}>
                <div>
                  <div className={styles.microScoreNum}>94.2%</div>
                  <div className={styles.microScoreLabel}>Match Score</div>
                </div>
                <div className={styles.microBadgeShortlist}>
                  ✓ Shortlisted (94% Conf)
                </div>
              </div>
            </div>
            <div className={styles.modernStepFooter}>
              <span>🧠 TF-IDF + Gradient Boosting + Groq</span>
            </div>
          </div>
        </div>
      </section>

      {/* Databricks Enterprise Comparison Table */}
      <section className={styles.comparisonSection}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionEyebrow}>ENTERPRISE ADVANTAGE</span>
          <h2 className={styles.sectionTitle}>Why TalentAI Outperforms Legacy ATS</h2>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.compTable}>
            <thead>
              <tr>
                <th className={styles.tableHeadFeature}>Capability</th>
                <th className={styles.tableHeadLegacy}>Traditional Keyword Filter</th>
                <th className={styles.tableHeadTalent}>TalentAI Enterprise ML</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.cellFeature}>Engineering Domain Prediction</td>
                <td className={styles.cellLegacy}>❌ None (Naive string search)</td>
                <td className={styles.cellTalent}>✓ 30 Domains (99.43% NLP Classifier)</td>
              </tr>
              <tr>
                <td className={styles.cellFeature}>Project & Portfolio Auditing</td>
                <td className={styles.cellLegacy}>❌ Ignored or unparsed</td>
                <td className={styles.cellTalent}>✓ Full technical project segmentation</td>
              </tr>
              <tr>
                <td className={styles.cellFeature}>Shortlisting Decision Engine</td>
                <td className={styles.cellLegacy}>❌ Static score threshold</td>
                <td className={styles.cellTalent}>✓ Gradient Boosting trained on 30k profiles</td>
              </tr>
              <tr>
                <td className={styles.cellFeature}>Explainability & Transparency</td>
                <td className={styles.cellLegacy}>❌ Blackbox count</td>
                <td className={styles.cellTalent}>✓ Multi-vector weights + AI Recruiter Report</td>
              </tr>
              <tr>
                <td className={styles.cellFeature}>Interview Question Generation</td>
                <td className={styles.cellLegacy}>❌ Manual recruiter task</td>
                <td className={styles.cellTalent}>✓ Project-tailored interview guide via Groq</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Databricks-Inspired High-Impact CTA Banner */}
      <div className={styles.ctaBanner}>
        <div className={styles.ctaGlow}></div>
        <div className={styles.ctaInner}>
          <span className={styles.ctaBadge}>GET STARTED IN SECONDS</span>
          <h2 className={styles.ctaHeading}>Ready to test the screening pipeline?</h2>
          <p className={styles.ctaSubtext}>
            Launch the interactive workspace to upload your custom resumes or run an immediate batch test using our pre-loaded candidate pool.
          </p>
          <div className={styles.ctaButtonGroup}>
            <Link href="/dashboard" className={styles.btnLaunchYellow}>
              Launch Screener Workspace →
            </Link>
            <a
              href="https://github.com/SHXZ7/resume_screening"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnOutlineWhite}
            >
              View GitHub Repository ↗
            </a>
          </div>
        </div>
      </div>

      {/* Enterprise Academic Footer */}
      <footer id="academic" className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerColBrand}>
            <div className={styles.logo}>
              <span className={styles.logoMark}>◆</span>
              <span className={styles.logoText}>talentai</span>
            </div>
            <p className={styles.footerTagline}>
              Intelligent Resume Screening & Decision Intelligence with Multi-Stage Machine Learning.
            </p>
          </div>
          <div className={styles.footerCol}>
            <div className={styles.footerTitle}>Platform</div>
            <Link href="/dashboard" className={styles.footerLink}>Screener Dashboard</Link>
            <a href="#how-it-works" className={styles.footerLink}>How It Works</a>
            <a href="#architecture" className={styles.footerLink}>Lakehouse Architecture</a>
            <a href="#benchmarks" className={styles.footerLink}>30k Benchmarks</a>
          </div>
          <div className={styles.footerCol}>
            <div className={styles.footerTitle}>Academic Project</div>
            <span className={styles.footerText}>B.Tech Minor in Machine Learning</span>
            <span className={styles.footerText}>Academic Year: 2025–2026</span>
            <span className={styles.footerText}>Project 1: Resume Screening</span>
          </div>
          <div className={styles.footerCol}>
            <div className={styles.footerTitle}>Student Team</div>
            <span className={styles.footerText}>Fariz Hasan (S7 ME)</span>
            <span className={styles.footerText}>Adarsh J (S7 ECE)</span>
            <span className={styles.footerText}>Mohd Shaaz (S7 ECE)</span>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2025–2026 TalentAI • B.Tech Minor Degree in Machine Learning • Open Source Research</p>
          <p className={styles.footerSub}>Department of Computer Science & Engineering</p>
        </div>
      </footer>
    </div>
  );
}