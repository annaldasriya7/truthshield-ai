import { useEffect, useState } from "react";
import API from "../api/axios";

function Sources() {
  const [sources, setSources] = useState([]);
  const [form, setForm] = useState({ name: "", domain: "", credibility: "High", category: "News", notes: "" });
  const [message, setMessage] = useState("");

  const loadSources = () => {
    API.get("/sources").then(({ data }) => setSources(data.sources));
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSource = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/sources", form);
      setForm({ name: "", domain: "", credibility: "High", category: "News", notes: "" });
      setMessage("Source added successfully");
      loadSources();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not add source");
    }
  };

  const deleteSource = async (id) => {
    await API.delete(`/sources/${id}`);
    loadSources();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin Sources</p>
          <h1>Manage source credibility</h1>
          <p className="muted">Add trusted, medium, low, or very low credibility domains.</p>
        </div>
      </div>

      <section className="card">
        <h2>Add Source</h2>
        {message && <div className="alert info">{message}</div>}
        <form className="form grid-form" onSubmit={addSource}>
          <div>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Reuters" required />
          </div>
          <div>
            <label>Domain</label>
            <input name="domain" value={form.domain} onChange={handleChange} placeholder="reuters.com" required />
          </div>
          <div>
            <label>Credibility</label>
            <select name="credibility" value={form.credibility} onChange={handleChange}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
              <option>Very Low</option>
              <option>Unknown</option>
            </select>
          </div>
          <div>
            <label>Category</label>
            <input name="category" value={form.category} onChange={handleChange} />
          </div>
          <div className="wide">
            <label>Notes</label>
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes" />
          </div>
          <button className="btn btn-primary">Add Source</button>
        </form>
      </section>

      <section className="card mt">
        <h2>Saved Sources</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Domain</th><th>Credibility</th><th>Category</th><th></th></tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source._id}>
                  <td>{source.name}</td>
                  <td>{source.domain}</td>
                  <td>{source.credibility}</td>
                  <td>{source.category}</td>
                  <td><button className="btn btn-small btn-danger" onClick={() => deleteSource(source._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Sources;
