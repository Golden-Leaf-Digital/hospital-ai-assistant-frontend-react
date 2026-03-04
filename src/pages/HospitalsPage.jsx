import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function HospitalsPage() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  useEffect(() => {
    fetch(`${BASE_URL}/organizations`)
      .then((r) => r.json())
      .then((data) => setOrgs(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#fff",
        padding: 40,
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: 32 }}>Select Hospital</h1>

      {loading && <p>Loading hospitals...</p>}

      <div style={{ display: "grid", gap: 20, marginTop: 30 }}>
        {orgs.map((org) => (
          <Link
            key={org.orgId}
            to={`/${org.orgId}/webchat`}
            style={{
              padding: 20,
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 14,
              textDecoration: "none",
              fontSize: 20,
              width: 360,
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
            }}
          >
            <div>{org.orgName}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Open AI Assistant →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}