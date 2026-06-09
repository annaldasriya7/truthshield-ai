import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";

function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    API.get(`/reports/${id}`)
      .then(({ data }) => setReport(data.report))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [id]);

  const giveFeedback = async (feedback) => {
    const { data } = await API.put(`/reports/${id}/feedback`, { feedback });
    setReport(data.report);
  };

  const printReport = () => {
    window.print();
  };

  if (loading) return <p>Loading...</p>;
  if (!report) return <div className="card"><h2>Report not found</h2><Link to="/history">Back to history</Link></div>;

  return (
    <div>
      <div className="page-header no-print">
        <div>
          <p className="eyebrow">Full Report</p>
          <h1>{report.title}</h1>
        </div>
        <button className="btn btn-primary" onClick={printReport}>Print / Save PDF</button>
      </div>

      <section className="card report-paper" ref={reportRef}>
        <div className="report-title">
          <h2>TruthShield AI Report</h2>
          <p>Generated on {new Date(report.createdAt).toLocaleString()}</p>
        </div>

        <div className="result-top">
          <div>
            <p className="eyebrow">Prediction</p>
            <h2>{report.prediction}</h2>
            <p className="muted">Confidence: {report.confidence}%</p>
          </div>
          <div className="risk-meter">
            <span>{report.riskScore}%</span>
            <small>Risk Score</small>
          </div>
        </div>

        <div className="result-grid">
          <div><strong>Input Type:</strong><p>{report.inputType}</p></div>
          <div><strong>Source Domain:</strong><p>{report.sourceDomain}</p></div>
          <div><strong>Source Credibility:</strong><p>{report.sourceCredibility}</p></div>
          <div><strong>User Feedback:</strong><p>{report.userFeedback}</p></div>
        </div>

        <h3>Reasons</h3>
        <ul className="reason-list">
          {report.reasons.map((reason, index) => <li key={index}>{reason}</li>)}
        </ul>

        <div className="advice-box"><strong>Advice:</strong> {report.advice}</div>

        <h3>Original Input</h3>
        <div className="text-box">{report.originalInput}</div>

        {report.extractedText && (
          <>
            <h3>Extracted Text</h3>
            <div className="text-box">{report.extractedText}</div>
          </>
        )}
      </section>

      <div className="card no-print">
        <h3>Was this result helpful?</h3>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => giveFeedback("helpful")}>Helpful</button>
          <button className="btn btn-outline" onClick={() => giveFeedback("not_helpful")}>Not Helpful</button>
        </div>
      </div>
    </div>
  );
}

export default ReportDetails;
