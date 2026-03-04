import Button from "@/components/Button";
import Input from "@/components/Input";
import Label from "@/components/Label";
import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpTimer, setOtpTimer] = useState(600);
  const [otpExpired, setOtpExpired] = useState(false);
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    document.title = "Lizeya - Forgot Password";
  }, []);

  /* -------------------- OTP Timer -------------------- */
  useEffect(() => {
    if (step === 2 && otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((p) => p - 1), 1000);
      return () => clearInterval(interval);
    } else if (otpTimer <= 0 && step === 2) {
      setOtpExpired(true);
      setMessage({
        text: "OTP expired. Please request a new one.",
        type: "error",
      });
    }
  }, [step, otpTimer]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(
        () => setMessage({ text: "", type: "" }),
        20000
      );
      return () => clearTimeout(timer);
    }
  }, [message]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    if (!value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  /* -------------------- Validation -------------------- */
  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!mobile.trim())
        newErrors.mobile = "Mobile number is required.";
      else if (!/^[0-9]{10}$/.test(mobile))
        newErrors.mobile =
          "Enter a valid 10-digit mobile number.";
    }

    if (step === 2) {
      if (otp.join("").length !== 6)
        newErrors.otp = "Please enter a valid 6-digit OTP.";
      if (otpExpired)
        newErrors.otp =
          "OTP has expired. Please request a new one.";
    }

    if (step === 3) {
      if (!newPassword.trim())
        newErrors.password = "Password is required.";
      if (!confirmPassword.trim())
        newErrors.confirmPassword =
          "Confirm password is required.";
      else if (newPassword !== confirmPassword)
        newErrors.confirmPassword =
          "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const maskMobile = (num) =>
    num.length < 4 ? "" : "XXXXXX" + num.slice(-4);

  /* -------------------- Send OTP -------------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/api/auth/forgot-password`,
        { mobile }
      );

      setMessage({
        text: `OTP sent to WhatsApp ending with ${maskMobile(
          mobile
        )}`,
        type: "success",
      });

      setStep(2);
      setOtpTimer(600);
      setOtpExpired(false);
    } catch (err) {
      setMessage({
        text:
          err?.response?.data?.message ||
          "Failed to send OTP",
        type: "error",
      });
    }

    setLoading(false);
  };

  /* -------------------- Verify OTP -------------------- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const otpValue = otp.join("");
    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/api/auth/verify-otp?otp=${otpValue}`
      );

      setResetToken(otpValue);
      setMessage({ text: "OTP verified!", type: "success" });
      setStep(3);
    } catch (err) {
      setMessage({
        text:
          err?.response?.data?.message || "Invalid OTP",
        type: "error",
      });
    }

    setLoading(false);
  };

  /* -------------------- Reset Password -------------------- */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);

    try {
      const res = await axiosInstance.post(
        "/api/auth/reset-password",
        { token: resetToken, newPassword }
      );

      setMessage({ text: res.data.message, type: "success" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({
        text:
          err?.response?.data?.message ||
          "Failed to reset password",
        type: "error",
      });
    }

    setLoading(false);
  };

  return (
    <section className="w-full h-[100vh] flex bg-[#F4F5FB]">
      <div className="max-md:relative md:block md:w-[45%] h-full" />

      <div className="max-md:absolute top-15 w-full md:w-[45%] flex justify-center items-center max-md:px-2 px-6 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg max-md:p-5 p-10 space-y-7">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold">
              {step === 1
                ? "Forgot Your Password?"
                : step === 2
                ? "Verify OTP"
                : "Reset Password"}
            </h2>

            {step === 2 && (
              <p
                className={`text-sm ${
                  otpExpired
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                Time left: {formatTime(otpTimer)}
              </p>
            )}
          </div>

          {/* All 3 step forms remain IDENTICAL (same JSX as yours) */}
            {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label>Mobile Number</Label>
                <Input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter 10-digit mobile"
                />
                {errors.mobile && (
                  <p className="text-sm text-red-600">{errors.mobile}</p>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Label>Enter OTP</Label>
              <div className="flex justify-center gap-3 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center border rounded-lg text-lg font-semibold"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    disabled={otpExpired}
                  />
                ))}
              </div>

              {errors.otp && (
                <p className="text-sm text-red-600">{errors.otp}</p>
              )}

              <Button
                className="w-full"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Label>New Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-6"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="relative">
                <Label>Confirm Password</Label>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-6"
                >
                  {showConfirmPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
          
          {/* Message */}
          {message.text && (
            <p
              className={`text-sm text-center ${
                message.type === "success"
                  ? "text-green-600"
                  : message.type === "error"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="text-center text-sm text-gray-500">
            <Link
              to="/login"
              className="text-blue-600 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}