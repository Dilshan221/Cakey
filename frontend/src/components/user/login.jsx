import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import
{
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faBirthdayCake,
  faCookieBite,
  faIceCream,
} from "@fortawesome/free-solid-svg-icons";
import
{
  faFacebookF,
  faGoogle,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { apiService } from "../../services/api";
import { authStorage } from "../../utils/authStorage";

/** Normalize backend role strings to our app roles */
function normalizeRole(raw)
{
  const r = String(raw || "").trim().toLowerCase();
  if (["admin", "superadmin", "system_admin"].includes(r)) return "admin";
  if (
    r.includes("product") ||
    r.includes("inventory") ||
    r === "product_manager" ||
    r === "product & inventory manager"
  )
  {
    return "product";
  }
  if (r.includes("complain") || r.includes("complaint") || r === "cadmin")
  {
    return "complain";
  }
  if (
    r.includes("delivery") ||
    r.includes("order & delivery") ||
    r === "delivery_manager" ||
    r === "order & delivery manager"
  )
  {
    return "delivery";
  }
  if (["user", "enduser", "basic_user"].includes(r)) return "user";
  return "customer";
}

/** Map normalized role -> route */
function landingPath(role)
{
  switch (role)
  {
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

export default function Login()
{
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
  useEffect(() =>
  {
    const remembered = localStorage.getItem("cb_remember_email");
    if (remembered)
      setForm((f) => ({ ...f, email: remembered, remember: true }));
  }, []);

  /* -------------------------- Role utilities -------------------------- */
  const normalizeRoles = (user) =>
  {
    const r = user?.role ?? user?.roles ?? [];
    const arr = Array.isArray(r) ? r : [r].filter(Boolean);
    return arr
      .map(String)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  };

  const ROLE_PRIORITY = [
    "admin",
    "product",
    "complain",
    "delivery",
    "user",
    "customer",
  ];

  const roleToPath = (roles) =>
  {
    const MAP = {
      admin: "/admin",
      product: "/cadmin/product",
      complain: "/cadmin/",
      delivery: "/normal-order",
      user: "/useradmin",
      customer: "/",
    };
    const picked = roles.find((r) => ROLE_PRIORITY.includes(r)) ?? "customer";
    return MAP[picked] ?? "/";
  };

  /* ----------------------------- Handlers ----------------------------- */
  const onChange = (e) =>
  {
    const { name, value, type, checked } = e.target;
    setServerError("");
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) =>
  {
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

    try
    {
      setLoading(true);
      const data =
        typeof apiService.login === "function"
          ? await apiService.login({ email, password })
          : await apiService.request("/usermanagement/login", {
            method: "POST",
            body: { email, password },
          });

      const user = data?.user || {};
      if (user?.isActive === false)
      {
        setServerError("Your account is inactive. Please contact support.");
        return;
      }

      if (data?.token) authStorage.setToken(data.token, true);
      if (user) authStorage.setUser(user, true);
      authStorage.applyToApiService();

      const roles = normalizeRoles(data?.user);
      const target = roleToPath(roles);
      const finalUrl = target === "/admin" ? "/admin?view=attendance" : target;
      navigate(finalUrl, { replace: true });

      const role = normalizeRole(user?.role);
      navigate(landingPath(role), { replace: true });
    } catch (err)
    {
      const msg =
        err?.data?.message || err?.message || "Login failed. Please try again.";
      setServerError(msg);
      setTimeout(() =>
      {
        document.querySelector(".alert")?.focus();
      }, 0);
    } finally
    {
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
            <div role="alert" className="alert error">
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
          --cb-bg:#0f0f12;
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
        .input{
          border:0; outline:0; background:transparent; width:100%; font-size:15px; color:#111;
        }
        .input::placeholder{ color:#aab0b6 }
        .peek{
          border:0; background:transparent; color:#6b7280; cursor:pointer; font-size:16px;
        }
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

/* ------------------------------ CSS ------------------------------ */
const css = `
:root{
  --rose:#ff6f61;
  --rose-500:#fb6a5e;
  --brand:#e74c3c;
  --ink:#1f2937;
  --muted:#6b7280;
  --bg:#0b0b10;
  --card:#ffffff;
  --ring: rgba(255,111,97,.35);
}
@media (prefers-color-scheme: dark){
  :root{
    --card:#111318;
    --ink:#e5e7eb;
    --muted:#9ca3af;
    --ring: rgba(255,111,97,.28);
  }
}

*{box-sizing:border-box}
html,body,#root{height:100%}

.login-page{
  position:relative;
  min-height:100vh;
  display:grid;
  place-items:center;
  color:var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
  overflow: hidden;
}

/* gradient background */
.bg-grad{
  position:absolute; inset:0;
  background:
    radial-gradient(1200px 800px at -10% -20%, #ffefe9 0%, transparent 55%),
    radial-gradient(1100px 900px at 120% 0%, #ffe1db 0%, transparent 50%),
    linear-gradient(135deg, #fff7f3 0%, #ffe9dc 60%, #ffd4c2 100%);
  filter: saturate(1.02);
  z-index:0;
}

/* animated soft bubbles */
.bubbles span{
  position:absolute; width:220px; height:220px; border-radius:50%;
  background: radial-gradient(closest-side, rgba(255,255,255,.7), rgba(255,255,255,.25), transparent);
  animation: float 12s ease-in-out infinite;
  filter: blur(2px);
}
.bubbles span:nth-child(1){ top:8%; left:6%; animation-delay:0s; }
.bubbles span:nth-child(2){ bottom:6%; left:12%; width:170px; height:170px; animation-delay:2s; }
.bubbles span:nth-child(3){ top:14%; right:8%; width:190px; height:190px; animation-delay:1s; }
.bubbles span:nth-child(4){ bottom:10%; right:14%; width:240px; height:240px; animation-delay:3s; }
@keyframes float {
  0%,100% { transform: translateY(0px) }
  50% { transform: translateY(-16px) }
}

/* layout shell */
.shell{
  position:relative; z-index:1;
  width:min(1050px, 94vw);
  display:grid; grid-template-columns: 1.1fr .9fr; gap:28px;
}
@media (max-width: 980px){
  .shell{ grid-template-columns: 1fr; gap:18px; }
}

/* left panel */
.left{
  backdrop-filter: blur(6px);
  background: rgba(255,255,255,.65);
  border: 1px solid rgba(255,255,255,.75);
  border-radius: 22px;
  padding: 28px 26px;
  box-shadow: 0 20px 50px rgba(0,0,0,.08);
}
@media (prefers-color-scheme: dark){
  .left{ background: rgba(17,19,24,.55); border-color: rgba(255,255,255,.08); }
}
.brand{ display:flex; align-items:center; gap:12px; margin-bottom:10px; }
.brand-badge{
  width:44px; height:44px; border-radius:12px; display:grid; place-items:center;
  background: linear-gradient(135deg, var(--rose), #ffd5cd);
  color:#fff; font-weight:900; letter-spacing:.3px; box-shadow: 0 10px 18px rgba(255,111,97,.25);
}
.brand-title{
  margin:0; font-size:28px; font-weight:900; color:var(--brand); letter-spacing:.3px;
}
.tagline{ margin:10px 0 6px; font-size:24px; color:#a83a2d; }
.lede{ color:var(--muted); margin:0 0 14px; }
.icons{ display:flex; gap:12px; margin-top:14px; }
.icons i{
  font-size:22px; width:54px; height:54px; border-radius:14px; display:grid; place-items:center;
  background:#fff; border:1px solid rgba(0,0,0,.06);
  box-shadow: 0 10px 20px rgba(0,0,0,.06);
  color:#d14b3c;
}

/* right card */
.right{ display:grid; place-items:center; }
.card.glass{
  width:min(520px, 100%);
  background: rgba(255,255,255,.75);
  border: 1px solid rgba(255,255,255,.8);
  border-radius: 20px;
  padding: 22px 22px 18px;
  box-shadow: 0 25px 60px rgba(0,0,0,.10);
}
@media (prefers-color-scheme: dark){
  .card.glass{ background: rgba(17,19,24,.65); border-color: rgba(255,255,255,.08); }
}
.card-head h3{ margin:0; font-size:26px; color:#b33a2b; }
.card-head .muted{ margin:6px 0 0; color:var(--muted); }

/* alert */
.alert{
  margin:12px 0 0; padding:10px 12px;
  border:1px solid #ffc9c4; border-radius:12px;
  background:#fff1ef; color:#991b1b; font-size:14px;
}

/* fields */
.field{ margin-top:14px; position:relative; }
.floating{ position:relative; display:block; }
.floating input{
  width:100%; padding: 14px 44px; font-size:15px;
  border-radius:14px; border:1px solid #eaded8; background:#fff; color:var(--ink);
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.floating input:focus{
  outline:none; border-color: var(--rose);
  box-shadow: 0 0 0 4px var(--ring);
}
@media (prefers-color-scheme: dark){
  .floating input{ background:#12141a; border-color:#2a2f3a; }
}
.floating span{
  position:absolute; left:44px; top:50%; transform: translateY(-50%);
  pointer-events:none; color:#8b8f97; transition: .15s;
}
.floating input::placeholder{ opacity:0; }
.floating input:not(:placeholder-shown) + span,
.floating input:focus + span{
  top:0; transform: translateY(-55%) scale(.92);
  background:#fff; padding:0 6px; color:#a3544b;
  border-radius: 8px;
}
@media (prefers-color-scheme: dark){
  .floating input:not(:placeholder-shown) + span,
  .floating input:focus + span{ background:#111318; }
}

/* icons in inputs */
.left-icon{
  position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#d1786e;
}
.icon-btn{
  position:absolute; right:10px; top:50%; transform:translateY(-50%);
  background:transparent; border:none; cursor:pointer; color:#777; font-size:16px;
}
.icon-btn:disabled{ opacity:.6; cursor:not-allowed; }

/* row utils */
.row{ display:flex; gap:12px; align-items:center; }
.between{ justify-content:space-between; margin:12px 0 6px; }

.checkbox{ display:inline-flex; align-items:center; gap:8px; color:#374151; cursor:pointer; }
.checkbox input{ accent-color: var(--rose); }

/* buttons */
.btn{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:12px 14px; border-radius:14px; border:1px solid #e7d7d1; background:#fff; color:#111827;
  font-weight:800; cursor:pointer; transition: transform .06s, filter .15s, background .2s, border-color .2s;
}
.btn:hover{ transform: translateY(-1px); }
.btn.primary{ background:var(--rose); border-color:var(--rose); color:#fff; }
.btn:disabled{ opacity:.7; cursor:not-allowed; }
.w100{ width:100%; margin-top:10px; }

/* spinner */
.spinner{
  width:16px; height:16px; border:2px solid #fff; border-top-color:transparent; border-radius:50%;
  animation: spin .8s linear infinite;
}
@keyframes spin{ to{ transform: rotate(360deg); } }

/* divider */
.divider{
  display:flex; align-items:center; gap:10px; margin:14px 0 8px; color:#6b7280; font-size:13px; user-select:none;
}
.divider::before, .divider::after {
  content:""; flex:1; height:1px; background: linear-gradient(90deg, transparent, #e7d7d1, transparent);
}

/* socials */
.socials{ display:flex; gap:10px; justify-content:center; }
.social{
  width:48px; height:48px; border-radius:12px; display:grid; place-items:center;
  background:#fff; border:1px solid #eee; color:#5b6068; cursor:pointer;
  box-shadow: 0 8px 18px rgba(0,0,0,.06);
  transition: transform .06s, box-shadow .15s, background .15s;
}
.social:hover{ transform: translateY(-1px); box-shadow: 0 10px 22px rgba(0,0,0,.08); }
.social.fb:hover{ background:#3b5998; color:#fff; }
.social.gg:hover{ background:#ea4335; color:#fff; }
.social.tw:hover{ background:#1da1f2; color:#fff; }

/* footer */
.foot{ margin-top:10px; text-align:center; color:#4b5563; }
.foot a{ color: var(--rose-500); font-weight:800; text-decoration:none; }
.foot a:hover{ text-decoration: underline; }

/* links */
.link-btn{
  background:none; border:none; padding:0; color:#9a4f45; font-weight:700; cursor:pointer;
}
.link-btn:hover{ text-decoration: underline; }
`;
