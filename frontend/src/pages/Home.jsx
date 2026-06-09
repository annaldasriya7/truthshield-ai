import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">AI + NLP + Source Credibility</p>
          <h1>Detect fake news and misinformation before sharing it.</h1>
          <p className="hero-text">
            TruthShield AI checks news text and URLs using misinformation risk scoring,
            clickbait detection, source credibility, and explainable results.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to={user ? "/detect" : "/register"}>
              Start Detection
            </Link>
            <Link className="btn btn-outline" to={user ? "/dashboard" : "/login"}>
              View Dashboard
            </Link>
          </div>
        </div>
        <div className="hero-card">
          <div className="score-circle">78%</div>
          <h3>Suspicious</h3>
          <p>Unknown source, emotional words, and exaggerated claim patterns detected.</p>
          <div className="mini-bars">
            <span style={{ width: "80%" }}></span>
            <span style={{ width: "55%" }}></span>
            <span style={{ width: "68%" }}></span>
          </div>
        </div>
      </section>

      <section className="grid-3">
        <div className="feature-card">
          <h3>Text Analysis</h3>
          <p>Paste viral messages, headlines, or article content to detect suspicious patterns.</p>
        </div>
        <div className="feature-card">
          <h3>URL Analysis</h3>
          <p>Paste a news URL and the backend extracts article content for analysis.</p>
        </div>
        <div className="feature-card">
          <h3>Admin Sources</h3>
          <p>Admin can manage trusted and suspicious domains to improve source scoring.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
