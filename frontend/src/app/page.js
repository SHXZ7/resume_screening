import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  const previewCandidates = [
    {
      initial: "A",
      name: "alex_data_scientist.pdf",
      domain: "Data Science",
      conf: "38%",
      score: 94,
      words: 110,
      skills: ["machine learning", "deep learning", "nlp"],
    },
    {
      initial: "S",
      name: "sample_ml_resume.docx",
      domain: "Data Science",
      conf: "46%",
      score: 88,
      words: 70,
      skills: ["nlp", "docker", "machine learning"],
    },
    {
      initial: "D",
      name: "david_devops.pdf",
      domain: "DevOps Engineer",
      conf: "16%",
      score: 74,
      words: 105,
      skills: ["docker", "aws"],
    },
    {
      initial: "V",
      name: "vikram_java_developer.docx",
      domain: "Java Developer",
      conf: "23%",
      score: 52,
      words: 111,
      skills: ["git", "sql"],
    },
  ];

  return (
    <div className={styles.container}>
      {/* Top Navbar */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span>talentai</span>
          <span className={styles.logoDot}></span>
        </Link>

        <div className={styles.navLinks}>
          <a href="#how-it-works" className={styles.navLink}>How It Works</a>
          <a href="#metrics" className={styles.navLink}>Dataset & Metrics</a>
          <a href="#academic" className={styles.navLink}>Project Details</a>
        </div>

        <Link href="/dashboard" className={styles.btnBlack}>
          Launch Screener →
        </Link>
      </nav>

      {/* Hero Split Section */}
      <section className={styles.heroSplit}>
        {/* Left Column: Headline & Intro */}
        <div>
          <span className={styles.eyebrow}>NLP & MACHINE LEARNING • B.TECH MINOR 2025–26</span>
          <h1 className={styles.heroHeading}>
            Stop screening resumes manually. <br />
            <span className="highlight">Rank every applicant</span> in seconds.
          </h1>
          <p className={styles.heroDescription}>
            TalentAI automatically parses candidate PDF & DOCX resumes, extracts technical skills, and matches applicants against your job requirements using Cosine Similarity and Supervised Machine Learning.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="/dashboard" className={styles.btnBlack}>
              Launch Screener Dashboard →
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Mockup (Matching Jobply) */}
        <div className={styles.mockupWrapper}>
          <div className={styles.floatingBadgeTop}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }}></span>
            <span>Fresh Matches</span>
          </div>

          <div className={styles.browserCard}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDots}>
                <span className={styles.dotRed}></span>
                <span className={styles.dotYellow}></span>
                <span className={styles.dotGreen}></span>
              </div>
              <div className={styles.browserUrl}>
                <span>🔒</span> talentai.ml/dashboard/candidates
              </div>
            </div>

            <div className={styles.browserBody}>
              <div className={styles.bodyTop}>
                <div className={styles.matchCount}>
                  Best Matches • <span>4 candidate preview</span>
                </div>
                <Link href="/dashboard" style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-black)", textDecoration: "none" }}>
                  View Full Leaderboard →
                </Link>
              </div>

              <div>
                {previewCandidates.map((c) => (
                  <div key={c.name} className={styles.candidateItem}>
                    <div className={styles.candidateLeft}>
                      <div className={styles.candidateAvatar}>{c.initial}</div>
                      <div>
                        <div className={styles.candidateTitle}>{c.name}</div>
                        <div className={styles.candidateMeta}>
                          <span>{c.domain}</span>
                          <span>•</span>
                          <span>{c.words} words</span>
                          <span>•</span>
                          <span style={{ color: "var(--text-black)", fontWeight: 600 }}>{c.conf} conf</span>
                        </div>
                      </div>
                    </div>

                    <div className={`${styles.candidateScoreCircle} ${c.score >= 80 ? styles.scoreHigh : styles.scoreMid}`}>
                      {c.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.floatingCardBottom}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Before shortlisting</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-black)" }}>
              <span style={{ color: "var(--primary-yellow)" }}>✔</span> You make the final hiring decision
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats Bar */}
      <div id="metrics" className={styles.proofBar}>
        <div className={styles.proofItem}>
          <div className={styles.proofNumber}>31,154+</div>
          <div className={styles.proofLabel}>Resumes Trained</div>
        </div>
        <div className={styles.proofItem}>
          <div className={styles.proofNumber}>30</div>
          <div className={styles.proofLabel}>Modern Engineering Domains</div>
        </div>
        <div className={styles.proofItem}>
          <div className={styles.proofNumber}>99.4%</div>
          <div className={styles.proofLabel}>NLP Classifier Accuracy</div>
        </div>
        <div className={styles.proofItem}>
          <div className={styles.proofNumber}>0.2s</div>
          <div className={styles.proofLabel}>Ranking & Decision Speed</div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className={styles.howSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>AUTOMATED RECRUITMENT PIPELINE</span>
          <h2 className={styles.sectionTitle}>How TalentAI Works</h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "520px", margin: "8px auto 0", lineHeight: 1.6 }}>
            From unstructured documents to ranked, recruiter-verified engineering portfolios in three automated stages.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {/* Step 1 */}
          <div className={styles.stepCard}>
            <div className={styles.stepCardTop}>
              <div className={styles.stepNumberPill}>STEP 01</div>
              <span className={styles.stepIconBadge}>✨</span>
            </div>
            <h3 className={styles.stepTitle}>Target JD & AI Skill Extraction</h3>
            <p className={styles.stepText}>
              Type any role name or upload an existing Job Description. Groq LLM and our NLP engine dynamically structure requirements, extract core technical competencies, and allow instant keyword customization.
            </p>

            <div className={styles.miniPreviewBox}>
              <div className={styles.miniPreviewHeader}>
                <span className={styles.miniPreviewTitle}>Full Stack Software Engineer</span>
                <span className={styles.miniPreviewBadge}>✨ AI Enhanced</span>
              </div>
              <div className={styles.miniPillsRow}>
                <span className={styles.miniPill}>✓ React</span>
                <span className={styles.miniPill}>✓ Next.js</span>
                <span className={styles.miniPill}>✓ FastAPI</span>
                <span className={styles.miniPill}>✓ PostgreSQL</span>
              </div>
            </div>

            <div className={styles.stepBadge}>
              <span>✨</span> Groq LLM + 114+ Taxonomy
            </div>
          </div>

          {/* Step 2 */}
          <div className={styles.stepCard}>
            <div className={styles.stepCardTop}>
              <div className={styles.stepNumberPill}>STEP 02</div>
              <span className={styles.stepIconBadge}>⚡</span>
            </div>
            <h3 className={styles.stepTitle}>Multi-Format & Project Parsing</h3>
            <p className={styles.stepText}>
              Upload candidate resumes in batch (.pdf, .docx, or .txt). The system extracts work history, engineering project portfolios, GitHub activity scores, and multi-dimensional recruitment features.
            </p>

            <div className={styles.miniPreviewBox}>
              <div className={styles.miniPreviewHeader}>
                <span className={styles.miniPreviewTitle}>📄 Shaaz_FullStack.pdf</span>
                <span className={styles.miniPreviewTag}>Parsed in 0.2s</span>
              </div>
              <div className={styles.miniStatGrid}>
                <div className={styles.miniStatItem}>
                  <span className={styles.miniStatLabel}>Projects</span>
                  <span className={styles.miniStatVal}>8 Detected</span>
                </div>
                <div className={styles.miniStatItem}>
                  <span className={styles.miniStatLabel}>Experience</span>
                  <span className={styles.miniStatVal}>2+ Years</span>
                </div>
                <div className={styles.miniStatItem}>
                  <span className={styles.miniStatLabel}>GitHub Score</span>
                  <span className={styles.miniStatVal}>500 pts</span>
                </div>
              </div>
            </div>

            <div className={styles.stepBadge}>
              <span>⚡</span> PyPDF, DOCX & Project Extractor
            </div>
          </div>

          {/* Step 3 */}
          <div className={styles.stepCard}>
            <div className={styles.stepCardTop}>
              <div className={styles.stepNumberPill}>STEP 03</div>
              <span className={styles.stepIconBadge}>🏆</span>
            </div>
            <h3 className={styles.stepTitle}>Two-Stage ML Decision & Ranking</h3>
            <p className={styles.stepText}>
              Ranks applicants using 6,000-feature TF-IDF Cosine Similarity, modern 30-class domain prediction, and a 30,000-candidate Gradient Boosting shortlisting engine with interview probing questions.
            </p>

            <div className={styles.miniPreviewBox}>
              <div className={styles.miniPreviewHeader}>
                <span className={styles.miniPreviewTitle}>#1 Candidate Fit</span>
                <span className={styles.miniDecisionBadge}>✓ Shortlisted (92%)</span>
              </div>
              <div className={styles.miniBarContainer}>
                <div className={styles.miniBarFill} style={{ width: "88%" }}></div>
              </div>
              <div className={styles.miniFooterText}>
                <span>Cosine: <b>86.4%</b></span>
                <span>Skills Match: <b>91.2%</b></span>
              </div>
            </div>

            <div className={styles.stepBadge}>
              <span>🏆</span> Gradient Boosting (30k) + TF-IDF (99.4%)
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <div className={styles.ctaBanner}>
        <h2 className={styles.ctaHeading}>Ready to test the screening pipeline?</h2>
        <p className={styles.ctaSubtext}>
          Open the screener workspace to upload your own resumes or run a 1-click test with our preloaded candidate files.
        </p>
        <Link href="/dashboard" className={styles.btnYellow}>
          Launch Screener Dashboard →
        </Link>
      </div>

      {/* Footer */}
      <footer id="academic" className={styles.footer}>
        <p>B.Tech Minor Degree in Machine Learning • Department of Computer Science • Academic Year 2025–26</p>
        <p>Team Members: Fariz Hasan (S7 ME) • Adarsh J (S7 ECE) • Mohd Shaaz (S7 ECE)</p>
      </footer>
    </div>
  );
}
