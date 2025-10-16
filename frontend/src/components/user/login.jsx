// src/components/user/login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faBirthdayCake,
  faCookieBite,
  faIceCream,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faGoogle,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { apiService } from "../../services/api";
import { authStorage } from "../../utils/authStorage";

/** Normalize backend role strings to our app roles */
function normalizeRole(raw) {
  const r = String(raw || "")
    .trim()
    .toLowerCase();
  if (["admin", "superadmin", "system_admin"].includes(r)) return "admin";
  if (
    r.includes("product") ||
    r.includes("inventory") ||
    r === "product_manager" ||
    r === "product & inventory manager"
  ) {
    return "product";
  }
  if (r.includes("complain") || r.includes("complaint") || r === "cadmin") {
    return "complain";
  }
  if (
    r.includes("delivery") ||
    r.includes("order & delivery") ||
    r === "delivery_manager" ||
    r === "order & delivery manager"
  ) {
    return "delivery";
  }
  if (["user", "enduser", "basic_user"].includes(r)) return "user";
  return "customer";
}

/** Map normalized role -> route */
function landingPath(role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "product":
      return "/cadmin/product";
    case "complain":
      return "/cadmin";
    case "delivery":
      return "/normal-order-dash";
    case "user":
      return "/useradmin";
    case "customer":
    default:
      return "/";
  }
}

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem("cb_remember_email");
    if (remembered)
      setForm((f) => ({ ...f, email: remembered, remember: true }));
  }, []);

  /* ----------------------------- Handlers ----------------------------- */
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServerError("");
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const { email, password, remember } = form;
    if (!email || !password)
      return setServerError("Please fill in all fields.");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email))
      return setServerError("Please enter a valid email.");

    // Remember email
    if (remember) localStorage.setItem("cb_remember_email", email);
    else localStorage.removeItem("cb_remember_email");

    try {
      setLoading(true);

      const data =
        typeof apiService.login === "function"
          ? await apiService.login({ email, password })
          : await apiService.request("/usermanagement/login", {
              method: "POST",
              body: { email, password },
            });

      const user = data?.user || {};

      if (user?.isActive === false) {
        setServerError("Your account is inactive. Please contact support.");
        return;
      }

      if (data?.token) authStorage.setToken(data.token, true);
      if (user) authStorage.setUser(user, true);
      authStorage.applyToApiService();

      const role = normalizeRole(user?.role);
      const target = landingPath(role);
      // If you want to deep-link admin default view:
      const finalUrl = target === "/admin" ? "/admin?view=attendance" : target;
      navigate(finalUrl, { replace: true });
    } catch (err) {
      const msg =
        err?.data?.message || err?.message || "Login failed. Please try again.";
      setServerError(msg);
      setTimeout(() => {
        document.querySelector(".alert")?.focus();
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      {/* Animated gradient background blobs */}
      <div className="bg-blob blob-1" aria-hidden />
      <div className="bg-blob blob-2" aria-hidden />
      <div className="bg-blob blob-3" aria-hidden />

      <div className="auth-card">
        {/* Left side (brand) */}
        <div className="brand-side">
          <div className="brand-inner">
            <h1 className="logo">Cake &amp; Bake</h1>
            <h2 className="tagline">Sweet Delights Await You</h2>
            <p className="sub">
              Sign in to track orders, manage preferences, and earn
              frosting-sweet rewards.
            </p>
            <div className="sweet-icons" aria-hidden>
              <FontAwesomeIcon icon={faBirthdayCake} />
              <FontAwesomeIcon icon={faCookieBite} />
              <FontAwesomeIcon icon={faIceCream} />
            </div>
          </div>
        </div>

        {/* Right side (form) */}
        <div className="form-side">
          <h3 className="form-title">Welcome back</h3>
          <p className="form-sub">Use your email and password to continue.</p>

          {serverError && (
            <div role="alert" className="alert error" tabIndex={-1}>
              {serverError}
            </div>
          )}

          <form onSubmit={onSubmit} className="form" noValidate>
            {/* Email */}
            <label className="field">
              <span className="field-label">Email address</span>
              <span className="field-control">
                <span className="field-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                  disabled={loading}
                  autoComplete="email"
                  required
                  className="input"
                />
              </span>
            </label>

            {/* Password */}
            <label className="field">
              <span className="field-label">Password</span>
              <span className="field-control">
                <span className="field-icon">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                  className="input"
                />
                <button
                  type="button"
                  className="peek"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={loading}
                  title={showPassword ? "Hide" : "Show"}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </span>
            </label>

            <div className="row between">
              <label className="remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={onChange}
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot" className="link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary wfull"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-spinner" aria-hidden />
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="or">
            <span>or continue with</span>
          </div>

          <div className="socials">
            <button
              className="social fb"
              onClick={(e) => e.preventDefault()}
              aria-label="Continue with Facebook"
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </button>
            <button
              className="social google"
              onClick={(e) => e.preventDefault()}
              aria-label="Continue with Google"
            >
              <FontAwesomeIcon icon={faGoogle} />
            </button>
            <button
              className="social tw"
              onClick={(e) => e.preventDefault()}
              aria-label="Continue with Twitter"
            >
              <FontAwesomeIcon icon={faTwitter} />
            </button>
          </div>

          <div className="signup">
            Don’t have an account?{" "}
            <Link to="/signup" className="link">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        :root{
          --cb-primary:#ff6f61;
          --cb-primary-600:#e65a4e;
          --card-bg:rgba(255,255,255,.75);
          --muted:#6b7280;
          --ring: 0 0 0 4px rgba(255,111,97,.18);
        }
        *{box-sizing:border-box}
        .login-shell{
          position:relative;
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:32px;
          background: radial-gradient(1200px 600px at 10% -10%, #ffe9dc 0%, transparent 60%),
                      radial-gradient(1200px 600px at 110% 110%, #ffd4c2 0%, transparent 60%),
                      #fff;
          overflow:hidden;
        }
        .bg-blob{
          position:absolute; border-radius:50%;
          filter: blur(60px); opacity:.45; mix-blend-mode: multiply;
          animation: float 12s ease-in-out infinite;
        }
        .blob-1{ width:520px;height:520px;background:#ffd5cc; top:-140px; left:-140px; }
        .blob-2{ width:460px;height:460px;background:#ffe6d8; bottom:-120px; right:-120px; animation-delay: -3s;}
        .blob-3{ width:360px;height:360px;background:#ffb3a7; bottom:20%; left:10%; animation-delay: -6s;}
        @keyframes float{
          0%,100%{ transform: translateY(0) }
          50%{ transform: translateY(-12px) }
        }
        .auth-card{
          width:min(980px,100%);
          display:grid;
          grid-template-columns: 1.1fr 1fr;
          border-radius:24px;
          overflow:hidden;
          backdrop-filter: blur(8px);
          box-shadow: 0 30px 70px rgba(0,0,0,.12);
          border:1px solid rgba(0,0,0,.06);
          background: linear-gradient(180deg, rgba(255,255,255,.86), rgba(255,255,255,.76));
        }
        .brand-side{
          background: linear-gradient(135deg, var(--cb-primary) 0%, #ffa394 100%);
          color:#fff;
          position:relative;
        }
        .brand-inner{
          height:100%;
          padding:44px 36px;
          display:flex; flex-direction:column; justify-content:center; align-items:flex-start;
          gap:14px;
        }
        .logo{
          font-family: "Brush Script MT", cursive;
          font-size:42px; line-height:1; margin:0;
          text-shadow: 0 6px 18px rgba(0,0,0,.18);
        }
        .tagline{ margin:6px 0 0; font-size:26px; font-weight:800; letter-spacing:.2px }
        .sub{ margin:0; opacity:.95; max-width:34ch }
        .sweet-icons{ display:flex; gap:14px; font-size:22px; opacity:.95 }
        .sweet-icons svg{ background:rgba(255,255,255,.18); width:48px; height:48px; padding:12px; border-radius:14px }
        .form-side{
          padding:40px 34px;
          display:flex; flex-direction:column; gap:14px; justify-content:center;
          background: var(--card-bg);
        }
        .form-title{ margin:0; font-size:26px; font-weight:800; color:#111 }
        .form-sub{ margin:0; color:var(--muted) }
        .alert{
          padding:10px 12px; border-radius:12px; font-size:14px; margin-top:2px;
          border:1px solid #ffd9d6; background:#fff3f1; color:#9f1d18;
        }
        .form{ display:flex; flex-direction:column; gap:12px; margin-top:2px }
        .field{ display:block }
        .field-label{ display:block; font-size:12px; color:#636a75; margin:0 0 6px 2px }
        .field-control{
          display:flex; align-items:center; gap:10px;
          border:1px solid #e9eaee; background:#fff; border-radius:14px; padding:12px 14px;
          transition:border .15s, box-shadow .15s, transform .06s;
        }
        .field-control:focus-within{ border-color: var(--cb-primary); box-shadow: var(--ring) }
        .field-icon{ color: var(--cb-primary) }
        .input{ border:0; outline:0; background:transparent; width:100%; font-size:15px; color:#111 }
        .input::placeholder{ color:#aab0b6 }
        .peek{ border:0; background:transparent; color:#6b7280; cursor:pointer; font-size:16px }
        .peek:hover{ color:#111 }
        .row{ display:flex; align-items:center; gap:10px }
        .between{ justify-content:space-between }
        .remember{ display:flex; align-items:center; gap:8px; font-size:14px; color:#32363d }
        .remember input{ accent-color: var(--cb-primary) }
        .link{ color: var(--cb-primary); text-decoration:none; font-weight:600 }
        .link:hover{ color: var(--cb-primary-600); text-decoration:underline }
        .btn-primary{
          display:inline-flex; align-items:center; justify-content:center; gap:10px;
          height:46px; padding:0 16px; border-radius:14px; border:1px solid var(--cb-primary);
          background: linear-gradient(180deg, var(--cb-primary), var(--cb-primary-600));
          color:#fff; font-weight:700; letter-spacing:.2px; transition: transform .06s ease, filter .2s ease;
          box-shadow: 0 10px 30px rgba(255,111,97,.25);
        }
        .btn-primary:hover{ filter:brightness(.98) }
        .btn-primary:active{ transform: translateY(1px) }
        .btn-primary:disabled{ filter:grayscale(.3); opacity:.8; cursor:not-allowed }
        .wfull{ width:100% }
        .btn-spinner{
          width:18px;height:18px;border-radius:50%;
          border:2.5px solid rgba(255,255,255,.6); border-top-color:#fff; animation:spin 1s linear infinite;
        }
        @keyframes spin{to{transform:rotate(360deg)}}
        .or{ display:flex; align-items:center; gap:12px; color:#7a8088; margin:8px 0 4px }
        .or::before,.or::after{ content:""; height:1px; background:#e7e9ef; flex:1 }
        .or span{ font-size:12px }
        .socials{ display:flex; gap:10px }
        .social{
          width:46px; height:46px; border-radius:50%; border:1px solid #e0e2e8; background:#fff;
          display:flex; align-items:center; justify-content:center; font-size:18px; transition: all .2s;
        }
        .social:hover{ transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,.06) }
        .fb{ color:#1877f2 } .google{ color:#ea4335 } .tw{ color:#1d9bf0 }
        .signup{ margin-top:8px; color:#5f6670; font-size:14px }
        @media (max-width: 940px){
          .auth-card{ grid-template-columns:1fr; }
          .brand-side{ display:none; }
        }
      `}</style>
    </div>
  );
}
