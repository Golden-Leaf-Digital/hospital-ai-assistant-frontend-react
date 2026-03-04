import Button from "@/components/Button";
import Input from "@/components/Input";
import Label from "@/components/Label";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(600);
  const [otpExpired, setOtpExpired] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const maskedEmail = form.email
    ? form.email.replace(
        /(.{1})(.*)(?=@)/,
        (_, a, b) => `${a}${"*".repeat(b.length)}`
      )
    : "";

  const maskedMobile = form.mobile
    ? "XXXXXXX" + form.mobile.slice(-3)
    : "";

  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  useEffect(() => {
    document.title = "Lizeya - Sign Up";
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [e.target.id]: "",
    }));
  };

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  /* OTP Timer */
  useEffect(() => {
    if (step === 2 && otpTimer > 0) {
      const interval = setInterval(
        () => setOtpTimer((p) => p - 1),
        1000
      );
      return () => clearInterval(interval);
    } else if (otpTimer <= 0 && step === 2) {
      setOtpExpired(true);
      setMessage({
        text: "OTP expired. Please request a new one.",
        type: "error",
      });
    }
  }, [step, otpTimer]);

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const newErrors = {};

    if (step === 1) {
      if (!form.fullName.trim())
        newErrors.fullName = "Full name is required.";
      if (!form.email.trim())
        newErrors.email = "Email is required.";
      if (!form.mobile.trim())
        newErrors.mobile = "Mobile is required.";
    }

    if (step === 3 && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      if (step === 1) {
        await axios.post(
          `${BASE_URL}/api/auth/register`,
          form
        );

        setStep(2);
        setOtpTimer(600);
        setOtpExpired(false);

        setMessage({
          text: "OTP sent successfully!",
          type: "success",
        });
      } else if (step === 2) {
        const otpValue = otp.join("");

        await axios.post(
          `${BASE_URL}/api/auth/verify-otp?otp=${otpValue}`
        );

        setStep(3);
        setMessage({
          text:
            "OTP verified successfully. Please set your password.",
          type: "success",
        });
      } else {
        const res = await axios.post(
          `${BASE_URL}/api/auth/set-password`,
          {
            mobile: form.mobile,
            password: form.password,
          }
        );

        localStorage.setItem("token", res.data);
        navigate("/dashboard");
      }
    } catch (err) {
      setMessage({
        text:
          err.response?.data || "Something went wrong",
        type: "error",
      });
    }

    setLoading(false);
  };

  return (
    <section className="w-full h-[100vh] flex bg-[#F4F5FB]">
      <div className="max-md:absolute top-15 w-full md:w-[45%] flex justify-center items-center max-md:px-2 px-6 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg max-md:p-5 p-10 space-y-7">

          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="px-10 py-3 rounded-lg border border-[#FF4242] text-[#FF4242] font-semibold"
            >
              Login
            </Link>

            <button className="px-10 py-3 rounded-lg bg-[#FF4242] text-white font-semibold shadow">
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {step === 1 && (
              <>
                <div>
                  <Label>Full Name*</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label>Mobile*</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="text-center">
                <div className="flex justify-center gap-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      value={digit}
                      onChange={(e) =>
                        handleOtpChange(
                          e.target.value,
                          index
                        )
                      }
                      maxLength={1}
                      className="w-12 h-12 text-center border rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                />
                <Input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </>
            )}

            {message.text && (
              <p
                className={`text-sm text-center ${
                  message.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message.text}
              </p>
            )}

            <Button
              className="w-full py-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : step === 1 ? (
                "Next"
              ) : step === 2 ? (
                "Verify OTP"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}