import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import API from "../api/axios";

function Admin() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    API.get("/reports/stats").then(({ data }) => setStats(data.stats));
    API.get("/reports/all").then(({ data }) => setReports(data.reports));
  }, []);

  const chartData = stats ? [
    { name: "Reliable", value: stats.likelyReliable },
    { name: "Verify", value: stats.needsVerification },
    { name: "Suspicious", value: stats.suspicious },
    { name: "Fake", value: stats.likelyFake }
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h1>System analytics</h1>
        </div>
      </div>

      {stats && (
        <section className="grid-3">
          <div className="stat-card"><h3>{stats.totalReports}</h3><p>Total Reports</p></div>
          <div className="stat-card"><h3>{stats.averageRisk}%</h3><p>Average Risk</p></div>
          <div className="stat-card"><h3>{stats.likelyFake + stats.suspicious}</h3><p>High Risk</p></div>
        </section>
      )}

      <section className="card mt">
        <h2>Report Category Chart</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3f62ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card mt">
        <h2>All User Reports</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>User</th><th>Title</th><th>Prediction</th><th>Risk</th><th>Feedback</th><th>Date</th></tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  <td>{report.user?.name || "Unknown"}</td>
                  <td>{report.title}</td>
                  <td><span className={`badge ${report.prediction.replaceAll(" ", "-").toLowerCase()}`}>{report.prediction}</span></td>
                  <td>{report.riskScore}%</td>
                  <td>{report.userFeedback}</td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Admin;
