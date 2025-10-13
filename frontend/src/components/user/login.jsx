// src/components/user/Login.jsx
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

  /* -------------------------- Role utilities -------------------------- */
  const normalizeRoles = (user) => {
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

  const roleToPath = (roles) => {
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

      if (data?.token) authStorage.setToken(data.token, true);
      if (data?.user) authStorage.setUser(data.user, true);
      authStorage.applyToApiService();

      const roles = normalizeRoles(data?.user);
      const target = roleToPath(roles);
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
    <div className="login-page">
      {/* gradient bg + subtle bubbles */}
      <div className="bg-grad" />
      <div className="bubbles">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="shell">
        {/* Left: brand / mood */}
        <aside className="left">
          <div className="brand">
            <div className="brand-badge">C&amp;B</div>
            <h1 className="brand-title">Cake &amp; Bake</h1>
          </div>

          <h2 className="tagline">Sweet Delights Await You</h2>
          <p className="lede">
            Sign in to track orders, reorder favorites, and unlock rewards.
          </p>

          <div className="icons">
            <i aria-hidden="true">
              <FontAwesomeIcon icon={faBirthdayCake} />
            </i>
            <i aria-hidden="true">
              <FontAwesomeIcon icon={faCookieBite} />
            </i>
            <i aria-hidden="true">
              <FontAwesomeIcon icon={faIceCream} />
            </i>
          </div>
        </aside>

        {/* Right: form */}
        <section className="right">
          <div className="card glass">
            <header className="card-head">
              <h3>Welcome back</h3>
              <p className="muted">Enter your details to continue.</p>
            </header>

            {serverError && (
              <div
                role="alert"
                aria-live="assertive"
                className="alert"
                tabIndex={-1}
              >
                {serverError}
              </div>
            )}

            <form onSubmit={onSubmit} noValidate>
              {/* Email */}
              <div className="field">
                <label className="floating">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    inputMode="email"
                    value={form.email}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="email"
                    required
                    placeholder=" "
                    aria-label="Email address"
                  />
                  <span>Email address</span>
                  <div className="left-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                </label>
              </div>

              {/* Password */}
              <div className="field">
                <label className="floating">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                    placeholder=" "
                    aria-label="Password"
                  />
                  <span>Password</span>
                  <div className="left-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </label>
              </div>

              {/* Remember + forgot */}
              <div className="row between">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={form.remember}
                    onChange={onChange}
                    disabled={loading}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  className="link-btn"
                  onClick={(e) => e.preventDefault()}
                  aria-label="Forgot password (not implemented)"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn primary w100"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" aria-hidden="true" />
                ) : (
                  "Sign in"
                )}
              </button>

              {/* Divider */}
              <div className="divider">
                <span>or continue with</span>
              </div>

              {/* Socials (placeholders) */}
              <div className="socials">
                <button
                  className="social fb"
                  onClick={(e) => e.preventDefault()}
                  aria-label="Continue with Facebook"
                >
                  <FontAwesomeIcon icon={faFacebookF} />
                </button>
                <button
                  className="social gg"
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
            </form>

            <footer className="foot">
              Don&apos;t have an account? <Link to="/signup">Sign up</Link>
            </footer>
          </div>
        </section>
      </div>

      {/* Styles */}
      <style>{css}</style>
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
