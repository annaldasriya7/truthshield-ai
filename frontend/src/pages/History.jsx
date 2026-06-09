import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function History() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/reports/my")
      .then(({ data }) => setReports(data.reports))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">History</p>
          <h1>Your detection reports</h1>
        </div>
        <Link className="btn btn-primary" to="/detect">New Analysis</Link>
      </div>

      <section className="card">
        {loading ? (
          <p>Loading...</p>
        ) : reports.length === 0 ? (
          <p className="muted">No report history found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Title</th><th>Type</th><th>Prediction</th><th>Risk</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.title}</td>
                    <td>{report.inputType}</td>
                    <td><span className={`badge ${report.prediction.replaceAll(" ", "-").toLowerCase()}`}>{report.prediction}</span></td>
                    <td>{report.riskScore}%</td>
                    <td>{new Date(report.createdAt).toLocaleString()}</td>
                    <td><Link to={`/reports/${report._id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default History;
