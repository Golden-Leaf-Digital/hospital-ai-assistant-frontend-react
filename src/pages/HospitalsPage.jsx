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
    <div className="min-h-screen bg-gray-50 p-10">

      {/* Page Title */}
      <div className="max-w-5xl mx-auto mb-10">
        <h1 className="text-3xl font-bold">
          Select Hospital
        </h1>

        <p className="text-gray-500 mt-1">
          Choose your hospital to start chatting with the AI assistant
        </p>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto">

        {loading && (
          <p className="text-gray-500">Loading hospitals...</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {orgs.map((org) => (
            <Link
  key={org.orgId}
  to={`/${org.orgId}/webchat`}
  className="bg-white shadow rounded-xl p-6 border transition 
             hover:border-red-500 hover:shadow-xl hover:scale-[1.02] 
             group"
>
  <div className="text-xl font-semibold group-hover:text-red-500">
    {org.orgName}
  </div>

  <p className="text-gray-500 text-sm mt-2 group-hover:text-red-400">
    Open AI Assistant →
  </p>
</Link>
          ))}

        </div>

      </div>

    </div>
  );
}