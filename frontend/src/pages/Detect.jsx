import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function getVerdict(report) {
  if (!report) return null;

  if (report.prediction === "Likely Reliable") {
    return {
      className: "verdict-reliable",
      icon: "✅",
      title: "Yes, this appears to be real news.",
      message:
        "The source and writing pattern look more reliable. Still, for important news, confirm it from official or trusted sources."
    };
  }

  if (report.prediction === "Needs Verification") {
    return {
      className: "verdict-warning",
      icon: "⚠️",
      title: "This news needs verification.",
      message:
        "The system found some points that need checking. Do not share it until you verify it from official or trusted news websites."
    };
  }

  if (report.prediction === "Suspicious") {
    return {
      className: "verdict-suspicious",
      icon: "⚠️",
      title: "This news looks suspicious.",
      message:
        "The content has signs of misinformation such as unknown source, clickbait words, exaggerated claims, or weak credibility."
    };
  }

  return {
    className: "verdict-fake",
    icon: "❌",
    title: "No, this looks fake or misleading.",
    message:
      "The system found strong suspicious signals. Do not share this news unless it is confirmed by official sources."
  };
}

function ResultBox({ report }) {
  if (!report) return null;

  const verdict = getVerdict(report);

  return (
    <div className="result-card">
      <div className={`verdict-box ${verdict.className}`}>
        <div className="verdict-icon">{verdict.icon}</div>
        <div>
          <h2>{verdict.title}</h2>
          <p>{verdict.message}</p>
        </div>
      </div>

      <div className="result-top">
        <div>
          <p className="eyebrow">Analysis Result</p>
          <h2>{report.prediction}</h2>
          <p className="muted">Confidence: {report.confidence}%</p>
        </div>

        <div
          className="risk-meter"
          style={{
            background: `conic-gradient(var(--warning) ${report.riskScore}%, #e5e7eb 0)`
          }}
        >
          <span>{report.riskScore}%</span>
          <small>Risk Score</small>
        </div>
      </div>

      <div className="result-grid">
        <div>
          <strong>Source:</strong>
          <p>{report.sourceDomain}</p>
        </div>
        <div>
          <strong>Credibility:</strong>
          <p>{report.sourceCredibility}</p>
        </div>
        <div>
          <strong>Clickbait Score:</strong>
          <p>{report.clickbaitScore}%</p>
        </div>
        <div>
          <strong>Emotion Score:</strong>
          <p>{report.emotionalScore}%</p>
        </div>
      </div>

      <h3>Why this result?</h3>
      <ul className="reason-list">
        {report.reasons.map((reason, index) => (
          <li key={index}>{reason}</li>
        ))}
      </ul>

      <div className="advice-box">
        <strong>Advice:</strong> {report.advice}
      </div>

      <Link className="btn btn-primary" to={`/reports/${report._id}`}>
        Open Full Report
      </Link>
    </div>
  );
}

function Detect() {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async (e) => {
    e.preventDefault();
    setError("");
    setReport(null);
    setLoading(true);

    try {
      const endpoint =
        mode === "text" ? "/reports/detect-text" : "/reports/detect-url";

      const payload = mode === "text" ? { title, text } : { url };

      const { data } = await API.post(endpoint, payload);
      setReport(data.report);
    } catch (error) {
      setError(error.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Detection</p>
          <h1>Check suspicious news</h1>
          <p className="muted">
            Paste a news URL or text. The system will show a clear result:
            real, needs verification, suspicious, or fake.
          </p>
        </div>
      </div>

      <div className="card detect-card">
        <div className="tabs">
          <button
            type="button"
            className={mode === "text" ? "active" : ""}
            onClick={() => {
              setMode("text");
              setReport(null);
              setError("");
            }}
          >
            Text Detection
          </button>

          <button
            type="button"
            className={mode === "url" ? "active" : ""}
            onClick={() => {
              setMode("url");
              setReport(null);
              setError("");
            }}
          >
            URL Detection
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form className="form" onSubmit={analyze}>
          {mode === "text" ? (
            <>
              <label>Optional Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Viral student scholarship news"
              />

              <label>News Text / Message</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows="9"
                placeholder="Paste suspicious news, WhatsApp forward, headline, or article text here..."
                required
              />
            </>
          ) : (
            <>
              <label>News URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/news-article"
                required
              />
            </>
          )}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Now"}
          </button>
        </form>
      </div>

      <ResultBox report={report} />
    </div>
  );
}

export default Detect;