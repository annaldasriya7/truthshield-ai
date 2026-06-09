import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/reports/my")
      .then(({ data }) => setReports(data.reports.slice(0, 5)))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  const total = reports.length;
  const highRisk = reports.filter((r) => r.prediction === "Likely Fake" || r.prediction === "Suspicious").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Hello, {user?.name}</h1>
          <p className="muted">Analyze suspicious news text and URLs from one place.</p>
        </div>
        <Link className="btn btn-primary" to="/detect">New Analysis</Link>
      </div>

      <section className="grid-3">
        <div className="stat-card"><h3>{total}</h3><p>Recent Reports</p></div>
        <div className="stat-card"><h3>{highRisk}</h3><p>High Risk Reports</p></div>
        <div className="stat-card"><h3>{user?.role}</h3><p>Your Role</p></div>
      </section>

      <section className="card mt">
        <div className="section-title">
          <h2>Recent Analysis</h2>
          <Link to="/history">View all</Link>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : reports.length === 0 ? (
          <p className="muted">No reports yet. Start your first detection.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Title</th><th>Prediction</th><th>Risk</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.title}</td>
                    <td><span className={`badge ${report.prediction.replaceAll(" ", "-").toLowerCase()}`}>{report.prediction}</span></td>
                    <td>{report.riskScore}%</td>
                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td><Link to={`/reports/${report._id}`}>Open</Link></td>
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

export default Dashboard;
