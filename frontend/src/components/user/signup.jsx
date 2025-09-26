// src/pages/signup.jsx
import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// ✅ one-level up from /pages to /services
import { apiService } from "../../services/api";

import {
  faUser,
  faEnvelope,
  faLock,
  faBirthdayCake,
  faCheck,
  // optional: use real icons instead of shims
  faCookieBite,
  faIceCream,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faGoogle,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
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

  const strength = useMemo(() => {
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

  const onChange = (e) => {
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      birthday,
      terms,
      newsletter,
    } = form;

    // basic client-side checks
    if (!firstname || !lastname || !email || !password) {
      setServerError("Please fill in all required fields.");
      return;
    }
    if (!terms) {
      setServerError(
        "Please agree to the Terms of Service and Privacy Policy."
      );
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setServerError("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      setServerError("Passwords do not match.");
      return;
    }

    // ✅ safer birthday handling: send plain "YYYY-MM-DD"
    const payload = {
      firstname,
      lastname,
      email,
      password,
      ...(birthday ? { birthday } : {}),
      newsletter: !!newsletter,
    };

    try {
      setLoading(true);
      const data = await apiService.registerUser(payload);
      window.alert(`Welcome, ${data.firstname}! Your account was created.`);

      // Optional: reset form
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
      // navigate("/login");
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-signup">
      <div className="cb-container">
        {/* Left */}
        <div className="cb-left">
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
        </div>

        {/* Right */}
        <div className="cb-right">
          <h2>Create Account</h2>

          {/* server error (if any) */}
          {serverError ? (
            <div
              role="alert"
              style={{
                background: "#ffe6e6",
                color: "#b10000",
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 12,
                border: "1px solid #ffcccc",
              }}
            >
              {serverError}
            </div>
          ) : null}

          <form onSubmit={onSubmit} id="signup-form" noValidate>
            <div className="cb-name-fields">
              <div className="cb-form-group">
                <label htmlFor="firstname">First Name</label>
                <div className="cb-input-icon">
                  <FontAwesomeIcon icon={faUser} />
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    placeholder="First name"
                    value={form.firstname}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="given-name"
                    required
                  />
                </div>
              </div>
              <div className="cb-form-group">
                <label htmlFor="lastname">Last Name</label>
                <div className="cb-input-icon">
                  <FontAwesomeIcon icon={faUser} />
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    placeholder="Last name"
                    value={form.lastname}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="cb-form-group">
              <label htmlFor="email">Email Address</label>
              <div className="cb-input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={onChange}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="cb-form-group">
              <label htmlFor="password">Password</label>
              <div className="cb-input-icon">
                <FontAwesomeIcon icon={faLock} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={onChange}
                  disabled={loading}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div className={`cb-password-strength ${strength}`} />
              <div className="cb-password-strength-text">{strengthText}</div>
            </div>

            <div className="cb-form-group">
              <label htmlFor="confirmPassword">Re-enter Password</label>
              <div
                className={`cb-input-icon ${
                  passwordsMismatch ? "cb-invalid" : ""
                }`}
              >
                <FontAwesomeIcon icon={faLock} />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={onChange}
                  aria-invalid={passwordsMismatch}
                  aria-describedby="confirmPasswordHelp"
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>
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

            <div className="cb-form-group">
              <label htmlFor="birthday">Birthday (Optional)</label>
              <div className="cb-input-icon">
                <FontAwesomeIcon icon={faBirthdayCake} />
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={form.birthday}
                  onChange={onChange}
                  disabled={loading}
                  autoComplete="bday"
                />
              </div>
            </div>

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

            <button
              type="submit"
              className="cb-btn-signup"
              disabled={loading || formInvalid}
              aria-disabled={loading || formInvalid}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="cb-separator">
            <span>Or sign up with</span>
          </div>

          <div className="cb-social">
            <a
              href="#"
              className={`cb-social-btn facebook ${loading ? "disabled" : ""}`}
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
            Already have an account? <a href="#">Log in</a>
          </div>
        </div>
      </div>

      {/* Scoped styles (only affect this component) */}
      <style>{`
        .cb-signup * { box-sizing: border-box; }
        .cb-signup {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
          background: linear-gradient(to bottom right, #ffe9dc, #ffd4c2);
          color: #333;
          font-family: Arial, sans-serif;
        }

        .cb-container {
          display: flex;
          width: 900px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          border-radius: 15px;
          overflow: hidden;
          background: #fff;
        }

        .cb-left {
          flex: 1;
          background: #ff6f61;
          color: #fff;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cb-left::before {
          content: '';
          position: absolute;
          top: -70px; right: -70px;
          width: 200px; height: 200px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }
        .cb-left::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 250px; height: 250px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }
        .cb-logo { margin-bottom: 30px; z-index: 1; }
        .cb-logo h1 {
          font-family: 'Brush Script MT', cursive;
          font-size: 42px;
          color: #fff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .cb-left h2 { font-size: 28px; margin-bottom: 20px; z-index: 1; }
        .cb-left p { margin-bottom: 30px; line-height: 1.6; z-index: 1; }

        .cb-benefits { text-align: left; margin: 20px 0; z-index: 1; list-style: none; padding: 0; }
        .cb-benefits li { margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
        .cb-benefits i {
          color: #fff;
          background: rgba(255,255,255,0.2);
          width: 25px; height: 25px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-style: normal;
        }

        .cb-cake-icons { display: flex; gap: 20px; margin-top: 20px; z-index: 1; }
        .cb-cake-icon {
          font-size: 28px;
          background: rgba(255,255,255,0.2);
          width: 60px; height: 60px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s;
        }
        .cb-cake-icon:hover { transform: translateY(-5px); }

        .cb-right {
          flex: 1;
          background: #fff;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .cb-right h2 {
          color: #e74c3c;
          font-size: 28px;
          margin-bottom: 30px;
          text-align: center;
        }

        .cb-form-group { margin-bottom: 20px; }
        .cb-form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; }

        .cb-input-icon { position: relative; }
        .cb-input-icon > svg {
          position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
          color: #ff6f61;
        }
        .cb-input-icon input, .cb-input-icon select {
          width: 100%;
          padding: 15px 15px 15px 45px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .cb-input-icon input:focus, .cb-input-icon select:focus {
          outline: none;
          border-color: #ff6f61;
          box-shadow: 0 0 0 2px rgba(255, 111, 97, 0.2);
        }
        .cb-input-icon input:disabled, .cb-input-icon select:disabled {
          background-color: #f9f9f9;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .cb-name-fields { display: flex; gap: 15px; }
        .cb-name-fields .cb-form-group { flex: 1; }

        .cb-terms { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 20px; }
        .cb-terms input { margin-top: 5px; accent-color: #ff6f61; }
        .cb-terms input:disabled { opacity: 0.7; cursor: not-allowed; }
        .cb-terms label { font-size: 14px; color: #555; }
        .cb-terms a { color: #ff6f61; text-decoration: none; font-weight: 600; }
        .cb-terms a:hover { text-decoration: underline; }

        .cb-btn-signup {
          background: #ff6f61;
          color: #fff;
          border: none;
          padding: 15px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
          font-weight: 600;
          width: 100%;
        }
        .cb-btn-signup:hover:not(:disabled) { background: #e74c3c; }
        .cb-btn-signup:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .cb-separator { display: flex; align-items: center; margin: 25px 0; color: #777; }
        .cb-separator::before, .cb-separator::after { content: ''; flex: 1; height: 1px; background: #ddd; }
        .cb-separator span { padding: 0 15px; }

        .cb-social { display: flex; gap: 15px; justify-content: center; margin-bottom: 25px; }
        .cb-social-btn {
          display: flex; align-items: center; justify-content: center;
          width: 50px; height: 50px; border-radius: 50%;
          background: #f5f5f5; color: #555; font-size: 18px;
          transition: all 0.3s; border: 1px solid #eee;
          cursor: pointer;
          text-decoration: none;
        }
        .cb-social-btn:hover:not(.disabled) { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .cb-social-btn.facebook:hover:not(.disabled) { background: #3b5998; color: #fff; }
        .cb-social-btn.google:hover:not(.disabled) { background: #dd4b39; color: #fff; }
        .cb-social-btn.twitter:hover:not(.disabled) { background: #1da1f2; color: #fff; }
        .cb-social-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cb-login { text-align: center; margin-top: 20px; color: #555; }
        .cb-login a { color: #ff6f61; text-decoration: none; font-weight: 600; transition: color 0.3s; }
        .cb-login a:hover { color: #e74c3c; text-decoration: underline; }

        .cb-password-strength {
          height: 5px; background: #eee; margin-top: 5px; border-radius: 3px; position: relative; overflow: hidden;
        }
        .cb-password-strength::before {
          content: ''; position: absolute; height: 100%; width: 0; border-radius: 3px;
          transition: width 0.3s, background 0.3s;
        }
        .cb-password-strength.weak::before { width: 33.33%; background: #e74c3c; }
        .cb-password-strength.medium::before { width: 66.66%; background: #f39c12; }
        .cb-password-strength.strong::before { width: 100%; background: #2ecc71; }
        .cb-password-strength-text { font-size: 12px; margin-top: 3px; text-align: right; color: #777; }

        /* ✅ New feedback styles for confirm password */
        .cb-input-icon.cb-invalid input {
          border-color: #e74c3c;
          box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.15);
        }
        .cb-field-error {
          color: #e74c3c;
          font-size: 12px;
          margin-top: 6px;
          text-align: right;
        }
        .cb-field-ok {
          color: #2ecc71;
          font-size: 12px;
          margin-top: 6px;
          text-align: right;
        }

        @media (max-width: 768px) {
          .cb-container { flex-direction: column; width: 100%; }
          .cb-left, .cb-right { padding: 30px; }
          .cb-name-fields { flex-direction: column; gap: 0; }
        }
      `}</style>
    </div>
  );
}

/**
 * Shims for icons the original HTML showed (cookie + ice-cream) that
 * aren't in @fortawesome/free-solid by default in your deps list.
 * Swap these with real imports if you add them to your library.
 */
const faCookieBiteShim = {
  prefix: "fas",
  iconName: "cookie-bite",
  icon: [512, 512, [], "f564", ""],
};
const faIceCreamShim = {
  prefix: "fas",
  iconName: "ice-cream",
  icon: [512, 512, [], "f810", ""],
};
