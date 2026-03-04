import DashboardNavbar from "@/components/DashboardNavbar";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

function frontendBaseUrl() {
  return window.location.origin || "http://localhost:3000";
}

export default function QrPage() {
  const [dataUrl, setDataUrl] = useState("");
  const { orgId } = useParams();

  const chatUrl = useMemo(
    () => `${frontendBaseUrl()}/${orgId}/webchat`,
    [orgId]
  );

  useEffect(() => {
    (async () => {
      const url = await QRCode.toDataURL(chatUrl, {
        margin: 1,
        width: 320,
      });
      setDataUrl(url);
    })();
  }, [chatUrl]);

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            QR Code
          </h1>
          <p className="text-gray-500 text-sm">
            Scan to open Hospital AI Assistant
          </p>
        </div>

        <DashboardNavbar />
      </div>

      {/* QR Card */}
      <div className="bg-white shadow rounded-xl p-8 max-w-3xl">

        <div className="flex flex-col md:flex-row gap-8 items-center">

          {/* QR */}
          <div className="bg-gray-100 p-6 rounded-xl">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="QR Code"
                className="w-72 h-72"
              />
            ) : (
              <p>Generating QR...</p>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">

            <h2 className="text-xl font-semibold mb-3">
              Hospital AI Assistant
            </h2>

            <p className="text-gray-600 mb-4">
              Patients can scan this QR code to start chatting
              with the AI assistant and book appointments.
            </p>

            <div className="bg-gray-100 p-3 rounded-lg text-sm break-all">
              {chatUrl}
            </div>

            <p className="text-gray-500 text-sm mt-3">
              Supports Marathi, Hindi and English.
            </p>

            <Link to={`/${orgId}/webchat`}>
              <button className="mt-5 bg-[#FF4242] hover:bg-red-600 text-white px-5 py-2 rounded-lg">
                Open Chat
              </button>
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}