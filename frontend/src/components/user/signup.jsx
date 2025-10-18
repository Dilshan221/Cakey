// src/pages/signup.jsx
import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import
{
  faUser,
  faEnvelope,
  faLock,
  faBirthdayCake,
  faEye,
  faEyeSlash,
  faCheck,
  faCookieBite,
  faIceCream,
} from "@fortawesome/free-solid-svg-icons";
import
{
  faFacebookF,
  faGoogle,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
// one-level up from /pages to /services
import { apiService } from "../../services/api";

export default function Signup()
{
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    terms: false,
    newsletter: false,
  });

  const strength = useMemo(() =>
  {
    const p = form.password || "";
    let s = 0;
    if (p.length >= 8) s += 1;
    if (/([a-z].*[A-Z])|([A-Z].*[a-z])/.test(p)) s += 1;
    if (/\d/.test(p)) s += 1;
    if (/[!,@,#,$,%,^,&,*,?,_,~]/.test(p)) s += 1;
    if (s <= 1) return "weak";
    if (s === 2 || s === 3) return "medium";
    return "strong";
  }, [form.password]);

  const strengthText =
    strength === "weak"
      ? "Weak password"
      : strength === "medium"
        ? form.password.length
          ? "Good password"
          : "Password strength"
        : "Strong password";

  const onChange = (e) =>
  {
    const { name, value, type, checked } = e.target;
    setServerError("");
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const passwordsMismatch =
    form.confirmPassword && form.password !== form.confirmPassword;

  const formInvalid =
    !form.firstname ||
    !form.lastname ||
    !form.email ||
    !form.password ||
    !form.terms ||
    passwordsMismatch;

  const onSubmit = async (e) =>
  {
    e.preventDefault();
    setServerError("");

    const {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      birthday,
      newsletter,
      terms,
    } = form;

    if (!firstname || !lastname || !email || !password)
    {
      setServerError("Please fill in all required fields.");
      return;
    }
    if (!terms)
    {
      setServerError(
        "Please agree to the Terms of Service and Privacy Policy."
      );
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email))
    {
      setServerError("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword)
    {
      setServerError("Passwords do not match.");
      return;
    }

    const payload = {
      firstname,
      lastname,
      email,
      password,
      ...(birthday ? { birthday } : {}),
      newsletter: !!newsletter,
    };

    try
    {
      setLoading(true);
      const data = await apiService.registerUser(payload);
      window.alert(
        `Welcome, ${data.firstname || firstname}! Your account was created.`
      );
      setForm({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
        birthday: "",
        terms: false,
        newsletter: false,
      });
    } catch (err)
    {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setServerError(msg);
      setTimeout(() =>
      {
        document.querySelector(".cb-alert")?.focus();
      }, 0);
    } finally
    {
      setLoading(false);
    }
  };

  return (
    <div className="cb-signup">
      <div className="cb-container">
        {/* Left: brand / benefits */}
        <aside className="cb-left">
          <div className="cb-logo">
            <h1>Cake &amp; Bake</h1>
          </div>
          <h2>Join Our Sweet Community</h2>
          <p>
            Create an account to enjoy exclusive benefits and sweet rewards from
            our bakery.
          </p>

          <ul className="cb-benefits">
            <li>
              <i>
                <FontAwesomeIcon icon={faCheck} />
              </i>
              <span>Get exclusive discounts and offers</span>
            </li>
            <li>
              <i>
                <FontAwesomeIcon icon={faCheck} />
              </i>
              <span>Track your orders easily</span>
            </li>
            <li>
              <i>
                <FontAwesomeIcon icon={faCheck} />
              </i>
              <span>Save your favorite items</span>
            </li>
            <li>
              <i>
                <FontAwesomeIcon icon={faCheck} />
              </i>
              <span>Earn rewards with every purchase</span>
            </li>
          </ul>

          <div className="cb-cake-icons">
            <div className="cb-cake-icon">
              <FontAwesomeIcon icon={faBirthdayCake} />
            </div>
            <div className="cb-cake-icon">
              <FontAwesomeIcon icon={faCookieBite} />
            </div>
            <div className="cb-cake-icon">
              <FontAwesomeIcon icon={faIceCream} />
            </div>
          </div>
        </aside>

        {/* Right: card + form */}
        <section className="cb-right">
          <div className="cb-card">
            <h2>Create Account</h2>

            {serverError ? (
              <div
                role="alert"
                aria-live="assertive"
                className="cb-alert"
                tabIndex={-1}
              >
                {serverError}
              </div>
            ) : null}

            <form onSubmit={onSubmit} id="signup-form" noValidate>
              {/* First name */}
              <div className="cb-field">
                <label className="cb-floating">
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    placeholder=" "
                    value={form.firstname}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="given-name"
                    required
                  />
                  <span>First name</span>
                  <div className="cb-left-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                </label>
              </div>

              {/* Last name */}
              <div className="cb-field">
                <label className="cb-floating">
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    placeholder=" "
                    value={form.lastname}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="family-name"
                    required
                  />
                  <span>Last name</span>
                  <div className="cb-left-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                </label>
              </div>

              {/* Email */}
              <div className="cb-field">
                <label className="cb-floating">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    inputMode="email"
                    placeholder=" "
                    value={form.email}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                  <span>Email address</span>
                  <div className="cb-left-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                </label>
              </div>

              {/* Password */}
              <div className="cb-field">
                <label className="cb-floating">
                  <input
                    type={showPwd ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder=" "
                    value={form.password}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <span>Password</span>
                  <div className="cb-left-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <button
                    type="button"
                    className="cb-icon-btn"
                    onClick={() => setShowPwd((s) => !s)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={showPwd ? faEyeSlash : faEye} />
                  </button>
                </label>
                <div className={`cb-password-strength ${strength}`} />
                <div className="cb-password-strength-text">{strengthText}</div>
              </div>

              {/* Confirm password */}
              <div className="cb-field">
                <label
                  className={`cb-floating ${passwordsMismatch ? "is-invalid" : ""
                    }`}
                >
                  <input
                    type={showConfirm ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder=" "
                    value={form.confirmPassword}
                    onChange={onChange}
                    aria-invalid={passwordsMismatch}
                    aria-describedby="confirmPasswordHelp"
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                  <span>Confirm password</span>
                  <div className="cb-left-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <button
                    type="button"
                    className="cb-icon-btn"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={
                      showConfirm
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                  </button>
                </label>

                {passwordsMismatch ? (
                  <div id="confirmPasswordHelp" className="cb-field-error">
                    Passwords do not match
                  </div>
                ) : (
                  form.confirmPassword && (
                    <div id="confirmPasswordHelp" className="cb-field-ok">
                      Passwords match
                    </div>
                  )
                )}
              </div>

              {/* Birthday (optional) */}
              <div className="cb-field">
                <label className="cb-floating">
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    placeholder=" "
                    value={form.birthday}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="bday"
                  />
                  <span>Birthday (optional)</span>
                  <div className="cb-left-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faBirthdayCake} />
                  </div>
                </label>
              </div>

              {/* Terms + newsletter */}
              <div className="cb-terms">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={form.terms}
                  onChange={onChange}
                  disabled={loading}
                  required
                />
                <label htmlFor="terms">
                  I agree to the <a href="#">Terms of Service</a> and{" "}
                  <a href="#">Privacy Policy</a>
                </label>
              </div>

              <div className="cb-terms">
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  checked={form.newsletter}
                  onChange={onChange}
                  disabled={loading}
                />
                <label htmlFor="newsletter">
                  Send me special offers and updates
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="cb-btn-signup"
                disabled={loading || formInvalid}
                aria-disabled={loading || formInvalid}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            {/* Divider + socials */}
            <div className="cb-separator">
              <span>or sign up with</span>
            </div>

            <div className="cb-social">
              <a
                href="#"
                className={`cb-social-btn facebook ${loading ? "disabled" : ""
                  }`}
                aria-label="Sign up with Facebook"
                onClick={(e) => e.preventDefault()}
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a
                href="#"
                className={`cb-social-btn google ${loading ? "disabled" : ""}`}
                aria-label="Sign up with Google"
                onClick={(e) => e.preventDefault()}
              >
                <FontAwesomeIcon icon={faGoogle} />
              </a>
              <a
                href="#"
                className={`cb-social-btn twitter ${loading ? "disabled" : ""}`}
                aria-label="Sign up with Twitter"
                onClick={(e) => e.preventDefault()}
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            </div>

            <div className="cb-login">
              Already have an account? <a href="/login">Log in</a>
            </div>
          </div>
        </section>
      </div>

      {/* Styles */}
      <style>{signupCss}</style>
    </div>
  );
}

const signupCss = `
:root{
  --rose:#ff6f61;
  --rose-500:#fb6a5e;
  --brand:#e74c3c;
  --ink:#1f2937;
  --muted:#6b7280;
  --card:#ffffff;
  --ring:rgba(255,111,97,.35);
  --ok:#2ecc71;
  --err:#e74c3c;
  --warn:#f39c12;
  --bg-grad-1:#fff7f3;
  --bg-grad-2:#ffe9dc;
  --bg-grad-3:#ffd4c2;
}
@media (prefers-color-scheme: dark){
  :root{
    --card:#111318;
    --ink:#e5e7eb;
    --muted:#9ca3af;
    --bg-grad-1:#0d0f12;
    --bg-grad-2:#141821;
    --bg-grad-3:#1a1f2a;
    --ring:rgba(255,111,97,.28);
  }
}

.cb-signup{ min-height:100vh; display:grid; place-items:center; padding:24px; color:var(--ink); font-family:Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; position:relative; overflow:hidden; }
.cb-signup::before{
  content:""; position:absolute; inset:0; z-index:0;
  background:
    radial-gradient(1200px 800px at -10% -20%, var(--bg-grad-1) 0%, transparent 55%),
    radial-gradient(1100px 900px at 120% 0%, var(--bg-grad-2) 0%, transparent 50%),
    linear-gradient(135deg, var(--bg-grad-1) 0%, var(--bg-grad-2) 60%, var(--bg-grad-3) 100%);
  filter:saturate(1.03);
}
@media (prefers-reduced-motion: no-preference){
  .cb-signup::after{
    content:""; position:absolute; left:8%; top:10%; width:220px; height:220px; border-radius:50%;
    background: radial-gradient(closest-side, rgba(255,255,255,.55), rgba(255,255,255,.2), transparent);
    filter: blur(2px);
    animation: cb-float 12s ease-in-out infinite;
  }
  @keyframes cb-float { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-14px) } }
}

.cb-container{ position:relative; z-index:1; width:min(1040px, 96vw); display:grid; grid-template-columns: 1.05fr .95fr; gap:28px; }
@media (max-width: 980px){ .cb-container{ grid-template-columns: 1fr; gap:18px; } }

/* Left panel */
.cb-left{
  backdrop-filter: blur(6px);
  background: rgba(255,255,255,.65);
  border:1px solid rgba(255,255,255,.75);
  border-radius:22px;
  padding:28px 26px;
  box-shadow: 0 24px 60px rgba(0,0,0,.10);
  color:#b33a2b;
}
@media (prefers-color-scheme: dark){
  .cb-left{ background: rgba(17,19,24,.55); border-color: rgba(255,255,255,.08); color:#ffb4a9; }
}
.cb-logo h1{
  margin:0 0 6px; font-size:34px; font-weight:900; letter-spacing:.3px;
  background: linear-gradient(135deg, var(--brand), #ffb8ac);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.cb-left h2{ margin:10px 0 6px; font-size:24px; }
.cb-left p{ margin:0 0 16px; color:var(--muted); }
.cb-benefits{ list-style:none; padding:0; margin:12px 0 8px; }
.cb-benefits li{ display:flex; align-items:center; gap:10px; margin:10px 0; color:var(--ink); }
.cb-benefits i{
  width:26px; height:26px; border-radius:8px; display:grid; place-items:center;
  background:#fff; border:1px solid rgba(0,0,0,.06); color:var(--brand);
  box-shadow: 0 10px 20px rgba(0,0,0,.06);
}
.cb-cake-icons{ display:flex; gap:12px; margin-top:12px; }
.cb-cake-icon{
  font-size:20px; width:52px; height:52px; border-radius:14px; display:grid; place-items:center;
  background:#fff; border:1px solid rgba(0,0,0,.06); color:#d14b3c;
  box-shadow: 0 10px 20px rgba(0,0,0,.06);
  transition: transform .08s;
}
.cb-cake-icon:hover{ transform: translateY(-2px); }

/* Right card */
.cb-right{ display:grid; place-items:center; }
.cb-card{
  width:min(520px, 100%);
  background: rgba(255,255,255,.75);
  border:1px solid rgba(255,255,255,.8);
  border-radius:20px;
  padding:22px 22px 18px;
  box-shadow: 0 25px 60px rgba(0,0,0,.10);
}
@media (prefers-color-scheme: dark){ .cb-card{ background: rgba(17,19,24,.65); border-color: rgba(255,255,255,.08); } }
.cb-right h2{ margin:0 0 18px; text-align:center; font-size:28px; color:#b33a2b; }

/* Alert */
.cb-alert{
  margin:12px 0 0; padding:10px 12px;
  border:1px solid #ffc9c4; border-radius:12px;
  background:#fff1ef; color:#991b1b; font-size:14px;
}

/* Floating fields */
.cb-field{ margin-top:14px; position:relative; }
.cb-floating{ position:relative; display:block; }
.cb-floating input{
  width:100%; padding: 14px 44px; font-size:15px;
  border-radius:14px; border:1px solid #eaded8; background:#fff; color:var(--ink);
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.cb-floating input:focus{ outline:none; border-color: var(--rose); box-shadow: 0 0 0 4px var(--ring); }
@media (prefers-color-scheme: dark){ .cb-floating input{ background:#12141a; border-color:#2a2f3a; } }
.cb-floating span{
  position:absolute; left:44px; top:50%; transform: translateY(-50%);
  pointer-events:none; color:#8b8f97; transition:.15s; background:transparent;
}
.cb-floating input::placeholder{ opacity:0; }
.cb-floating input:not(:placeholder-shown) + span,
.cb-floating input:focus + span{
  top:0; transform: translateY(-55%) scale(.92);
  background:var(--card); padding:0 6px; color:#a3544b; border-radius:8px;
}
/* icons + toggles */
.cb-left-icon{ position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#d1786e; }
.cb-icon-btn{ position:absolute; right:10px; top:50%; transform:translateY(-50%); background:transparent; border:none; cursor:pointer; color:#777; font-size:16px; }
.cb-icon-btn:disabled{ opacity:.6; cursor:not-allowed; }

/* strength meter */
.cb-password-strength{ height:6px; background:#eee; margin-top:8px; border-radius:999px; position:relative; overflow:hidden; }
.cb-password-strength::before{ content:""; position:absolute; inset:0; width:0; transition: width .25s ease, background .25s ease; }
.cb-password-strength.weak::before{ width:33.33%; background: var(--err); }
.cb-password-strength.medium::before{ width:66.66%; background: var(--warn); }
.cb-password-strength.strong::before{ width:100%; background: var(--ok); }
.cb-password-strength-text{ font-size:12px; margin-top:6px; text-align:right; color:var(--muted); }

/* validation */
.cb-floating.is-invalid input{ border-color: var(--err); box-shadow: 0 0 0 4px rgba(231, 76, 60, 0.15); }
.cb-field-error{ color: var(--err); font-size:12px; margin-top:6px; text-align:right; }
.cb-field-ok{ color: var(--ok); font-size:12px; margin-top:6px; text-align:right; }

/* terms + socials */
.cb-terms{ display:flex; align-items:flex-start; gap:8px; margin-top:14px; color:#374151; }
.cb-terms input{ margin-top:5px; accent-color: var(--rose); }
.cb-terms a{ color: var(--rose-500); font-weight:700; text-decoration:none; }
.cb-terms a:hover{ text-decoration: underline; }

.cb-btn-signup{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  background:var(--rose); color:#fff; border:none;
  padding:13px 16px; border-radius:14px; font-size:16px; font-weight:800; cursor:pointer;
  border:1px solid var(--rose);
  transition: transform .06s, filter .15s, background .2s, border-color .2s;
  width:100%; margin-top:14px;
}
.cb-btn-signup:hover:not(:disabled){ transform: translateY(-1px); }
.cb-btn-signup:disabled{ opacity:.65; cursor:not-allowed; }

.cb-separator{ display:flex; align-items:center; gap:10px; margin:16px 0 12px; color:var(--muted); font-size:13px; }
.cb-separator::before, .cb-separator::after{ content:""; flex:1; height:1px; background: linear-gradient(90deg, transparent, #e7d7d1, transparent); }
.cb-social{ display:flex; gap:12px; justify-content:center; margin-bottom:8px; }
.cb-social-btn{
  width:48px; height:48px; border-radius:12px; display:grid; place-items:center;
  background:#fff; border:1px solid #eee; color:#5b6068; cursor:pointer;
  box-shadow: 0 8px 18px rgba(0,0,0,.06);
  transition: transform .06s, box-shadow .15s, background .15s; text-decoration:none;
}
.cb-social-btn:hover{ transform: translateY(-1px); box-shadow: 0 10px 22px rgba(0,0,0,.08); }
.cb-social-btn.facebook:hover{ background:#3b5998; color:#fff; }
.cb-social-btn.google:hover{ background:#ea4335; color:#fff; }
.cb-social-btn.twitter:hover{ background:#1da1f2; color:#fff; }
.cb-social-btn.disabled{ opacity:.6; cursor:not-allowed; }

.cb-login{ text-align:center; margin-top:14px; color:#4b5563; }
.cb-login a{ color: var(--rose-500); font-weight:800; text-decoration:none; }
.cb-login a:hover{ text-decoration: underline; }
`;
