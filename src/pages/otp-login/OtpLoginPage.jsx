import Button from "@/components/Button";
import Input from "@/components/Input";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

export default function OtpLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orgId } = useParams();
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = mobile , 2 = otp
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const redirectPath = location.state?.redirectTo || "/";
  /* -------------------- Validate Mobile -------------------- */
  const validateMobile = () => {
    const errs = {};

    if (!mobile.trim()) errs.mobile = "Mobile number is required.";
    else if (!/^[6-9]\d{9}$/.test(mobile))
      errs.mobile = "Enter valid 10 digit mobile number.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    if (orgId) {
      localStorage.setItem("orgId", orgId);
    }
  }, [orgId]);

  /* -------------------- Send OTP -------------------- */
  const sendOtp = async () => {
    setMessage("");

    if (!validateMobile()) return;

    setLoading(true);

    try {
      await axios.post(`${BASE_URL}/api/auth/patient/send-otp`, {
        phone: mobile,
      });

      setStep(2);
      setMessage("OTP sent successfully");
    } catch (err) {
      setMessage("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Verify OTP -------------------- */
  const verifyOtp = async () => {
    if (!otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/patient/verify-otp`, {
        phone: mobile,
        otp: otp,
      });

      const token = res.data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("patientPhone", mobile);

      const isHttps = window.location.protocol === "https:";
      document.cookie = `token=${token}; path=/; ${
        isHttps ? "secure;" : ""
      } samesite=Lax`;

      setMessage("Login successful");

      setTimeout(() => {
        const savedOrg = localStorage.getItem("orgId");
        navigate(`/${savedOrg}/webchat`, { replace: true });
      }, 800);
    } catch (err) {
      setMessage("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full h-screen flex bg-[#F4F5FB]">
      <div className="max-md:relative md:block md:w-[45%] h-full" />

      <div className="max-md:absolute top-30 w-full md:w-[45%] flex justify-center items-center max-md:px-2 px-6">
        <div className="w-full max-w-md bg-white max-md:p-5 p-10 rounded-xl shadow">
          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-6">
            <Link
              to={`/${orgId}/login`}
              className="px-10 py-3 rounded-lg border border-[#FF4242] text-[#FF4242] font-semibold"
            >
              Login
            </Link>

            <button className="px-10 py-3 rounded-lg bg-[#FF4242] text-white font-semibold shadow">
              Log In (Patient)
            </button>
          </div>

          {/* Mobile Input */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="font-medium text-gray-700 text-sm">
                  Mobile Number*
                </label>

                <div className="mt-2">
                  <Input
                    type="text"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value);
                      setErrors({});
                    }}
                    className="py-6 border border-gray-300 rounded-lg"
                  />
                </div>

                {errors.mobile && (
                  <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>

              {message && <p className="text-sm text-red-600">{message}</p>}

              <Button
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-[#FF4242] text-white py-4 text-lg rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </div>
          )}

          {/* OTP Input */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="font-medium text-gray-700 text-sm">
                  Enter OTP
                </label>

                <Input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setErrors({});
                  }}
                  className="py-6 border border-gray-300 rounded-lg mt-2"
                />

                {errors.otp && (
                  <p className="text-red-600 text-sm mt-1">{errors.otp}</p>
                )}
              </div>

              {message && (
                <p
                  className={`text-sm ${
                    message.includes("successful")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <Button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full bg-[#FF4242] text-white py-4 text-lg rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-[#FF4242]"
              >
                Change Mobile Number
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
