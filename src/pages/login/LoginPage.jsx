import Button from "@/components/Button";
import Input from "@/components/Input";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const [form, setForm] = useState({ mobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  /* -------------------- Input change -------------------- */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.id]: "" }));
  };

  /* -------------------- Error message mapping -------------------- */
  const getLoginErrorMessage = (msg) => {
    switch (msg) {
      case "User not registered":
        return "You are not registered. Please sign up first.";
      case "OTP not verified":
        return "Please verify OTP to complete signup.";
      case "Invalid credentials":
        return "Incorrect password. Please try again.";
      case "User not found":
        return "Mobile number not registered.";
      case "OTP expired.":
        return "Your OTP has expired. Please sign up again.";
      case "OTP not verified or expired":
        return "Please verify OTP first.";
      default:
        return "Login failed. Please try again later.";
    }
  };

  /* -------------------- Validate form -------------------- */
  const validateForm = () => {
    const errs = {};

    if (!form.mobile.trim())
      errs.mobile = "Mobile number is required.";
    else if (!/^[6-9]\d{9}$/.test(form.mobile))
      errs.mobile = "Enter a valid 10-digit mobile number.";

    if (!form.password.trim())
      errs.password = "Password is required.";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* -------------------- Extract backend error -------------------- */
  const extractBackendMessage = (errorData) => {
    if (!errorData) return null;

    if (typeof errorData === "object" && errorData.Exception) {
      const match = errorData.Exception.match(/"(.+?)"/);
      return match ? match[1] : errorData.Exception;
    }

    if (typeof errorData === "object" && errorData.message) {
      return errorData.message;
    }

    if (typeof errorData === "string") return errorData;

    return null;
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        form
      );

      const token = res.data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("username", JSON.stringify(form.mobile));
      window.dispatchEvent(new Event("tokenUpdated"));

      const isHttps = window.location.protocol === "https:";
      document.cookie = `token=${token}; path=/; ${
        isHttps ? "secure;" : ""
      } samesite=Lax`;

      const decoded = jwtDecode(token);
      const role = decoded?.role?.toUpperCase();

      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "SUPERADMIN")
        navigate("/superadmin/dashboard");
      else if (role === "USER") navigate("/");
      else if (role === "DOCTOR")
        navigate("/doctor/dashboard");
      else if (role === "RECEPTIONIST")
        navigate("/receptionist/dashboard");
      else if (role === "INSURANCE")
        navigate("/insurance/dashboard");
      else if (role === "BILLING")
        navigate("/billing/dashboard");
      else {
        setMessage("Unauthorized role");
        localStorage.removeItem("token");
        navigate("/");
      }
    } catch (err) {
      const msg = extractBackendMessage(
        err?.response?.data
      );
      setMessage(getLoginErrorMessage(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full h-screen flex bg-[#F4F5FB]">
      <div className="max-md:relative md:block md:w-[45%] h-full" />

      <div className="max-md:absolute top-30 w-full md:w-[45%] flex justify-center items-center max-md:px-2 px-6">
        <div className="w-full max-w-md bg-white max-md:p-5 p-10 rounded-xl shadow">
          <div className="flex justify-center gap-4 mb-6">
            <button className="px-10 py-3 rounded-lg bg-[#FF4242] text-white font-semibold shadow">
              Login
            </button>

            <Link
              to="/sign-up"
              className="px-10 py-3 rounded-lg border border-[#FF4242] text-[#FF4242] font-semibold"
            >
              Sign Up
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-medium text-gray-700 text-sm">
                Mobile Number*
              </label>

              <div className="relative mt-2">
                <Input
                  id="mobile"
                  type="text"
                  placeholder="Enter your mobile number"
                  value={form.mobile}
                  onChange={handleChange}
                  className="pl-10 py-6 border border-gray-300 rounded-lg"
                />
              </div>

              {errors.mobile && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.mobile}
                </p>
              )}
            </div>

            <div>
              <label className="font-medium text-gray-700 text-sm">
                Password*
              </label>

              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 py-6 border border-gray-300 rounded-lg"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-4 text-gray-500"
                >
                  {showPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-gray-500 hover:text-[#FF4242]"
              >
                Forgot Password?
              </Link>
            </div>

            {message && (
              <h2
                className={`text-sm ${
                  message.includes("successful")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </h2>
            )}

            <Button
              className="w-full bg-[#FF4242] cursor-pointer text-white py-4 text-lg rounded-lg"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Logging In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}