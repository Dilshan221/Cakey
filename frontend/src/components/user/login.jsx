// src/components/user/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
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
    return setServerError("Please enter a valid email address.");

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

    const role = String(data?.user?.role || "customer")
      .trim()
      .toLowerCase();

    if (role === "admin") {
      navigate("/admin?view=attendance", { replace: true });
    } else if (role === "finance manager") {
      navigate("/useradmin", { replace: true });
    } else {
      navigate("/", { replace: true }); // Customer -> RegisterHome
    }
  } catch (err) {
    const msg =
      err?.data?.message || err?.message || "Login failed. Please try again.";
    setServerError(msg);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="cb-login-wrapper">
      <div className="container">
        {/* Left */}
        <div className="left-panel">
          <div className="logo">
            <h1>Cake &amp; Bake</h1>
          </div>
          <h2>Sweet Delights Await You</h2>
          <p>
            Login to access your account, track orders, and enjoy sweet rewards
            from our bakery.
          </p>
          <div className="cake-icons">
            <i>
              <FontAwesomeIcon icon={faBirthdayCake} />
            </i>
            <i>
              <FontAwesomeIcon icon={faCookieBite} />
            </i>
            <i>
              <FontAwesomeIcon icon={faIceCream} />
            </i>
          </div>
        </div>

        {/* Right */}
        <div className="right-panel">
          <h2>Customer Login</h2>

          {serverError && (
            <div role="alert" className="alert error">
              {serverError}
            </div>
          )}

          <form onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <i>
                  <FontAwesomeIcon icon={faEnvelope} />
                </i>
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

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <i>
                  <FontAwesomeIcon icon={faLock} />
                </i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={onChange}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="inline-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword((s) => !s)}
                    disabled={loading}
                  />
                  Show password
                </label>
              </div>
            </div>

            <div className="remember-forgot">
              <div className="remember">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={form.remember}
                  onChange={onChange}
                  disabled={loading}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a
                href="#"
                className="forgot-password"
                onClick={(e) => e.preventDefault()}
              >
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="separator">
            <span>Or login with</span>
          </div>

          <div className="social-login">
            <a
              href="#"
              className="social-btn facebook"
              onClick={(e) => e.preventDefault()}
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a
              href="#"
              className="social-btn google"
              onClick={(e) => e.preventDefault()}
            >
              <FontAwesomeIcon icon={faGoogle} />
            </a>
            <a
              href="#"
              className="social-btn twitter"
              onClick={(e) => e.preventDefault()}
            >
              <FontAwesomeIcon icon={faTwitter} />
            </a>
          </div>

          <div className="signup-link">
            Don&apos;t have an account? <Link to="/signup">Sign up now</Link>
          </div>
        </div>
      </div>

      {/* Scoped styles */}
      <style>{`
        * { box-sizing: border-box; }
        .cb-login-wrapper {
          min-height: 100vh;
          background-image: linear-gradient(to bottom right, #ffe9dc, #ffd4c2);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #333;
          font-family: Arial, sans-serif;
        }
        .container { display: flex; width: 900px; height: 550px; background: #fff; border-radius: 15px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
        .left-panel { flex: 1; background: #ff6f61; color: #fff; padding: 40px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; position: relative; overflow: hidden; }
        .left-panel::before { content: ''; position: absolute; top: -70px; right: -70px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%; }
        .left-panel::after { content: ''; position: absolute; bottom: -80px; left: -80px; width: 250px; height: 250px; background: rgba(255,255,255,0.1); border-radius: 50%; }
        .logo { margin-bottom: 30px; z-index: 1; }
        .logo h1 { font-family: 'Brush Script MT', cursive; font-size: 42px; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
        .left-panel h2 { font-size: 28px; margin-bottom: 20px; z-index: 1; }
        .left-panel p { margin-bottom: 30px; line-height: 1.6; z-index: 1; }
        .cake-icons { display: flex; gap: 20px; margin-top: 20px; z-index: 1; }
        .cake-icons i { font-size: 28px; background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform 0.3s; }
        .cake-icons i:hover { transform: translateY(-5px); }
        .right-panel { flex: 1; background: #fff; padding: 40px; display: flex; flex-direction: column; justify-content: center; }
        .right-panel h2 { color: #e74c3c; font-size: 28px; margin-bottom: 30px; text-align: center; }
        .alert.error { background: #ffe6e6; color: #b10000; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #ffcccc; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; }
        .input-with-icon { position: relative; }
        .input-with-icon > i { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #ff6f61; }
        .input-with-icon input { width: 100%; padding: 15px 15px 15px 45px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; transition: border-color 0.3s, box-shadow 0.3s; }
        .input-with-icon input:focus { outline: none; border-color: #ff6f61; box-shadow: 0 0 0 2px rgba(255, 111, 97, 0.2); }
        .inline-toggle { margin-top: 8px; }
        .inline-toggle label { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
        .inline-toggle input { accent-color: #ff6f61; }
        .remember-forgot { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .remember { display: flex; align-items: center; gap: 8px; }
        .remember input { accent-color: #ff6f61; }
        .forgot-password { color: #ff6f61; text-decoration: none; font-weight: 600; transition: color 0.3s; }
        .forgot-password:hover { color: #e74c3c; text-decoration: underline; }
        .btn-login { background: #ff6f61; color: #fff; border: none; padding: 15px; border-radius: 8px; font-size: 16px; cursor: pointer; transition: background 0.3s; font-weight: 600; width: 100%; }
        .btn-login:hover { background: #e74c3c; }
        .btn-login:disabled { background: #ccc; cursor: not-allowed; }
        .separator { display: flex; align-items: center; margin: 25px 0; color: #777; }
        .separator::before, .separator::after { content: ''; flex: 1; height: 1px; background: #ddd; }
        .separator span { padding: 0 15px; }
        .social-login { display: flex; gap: 15px; justify-content: center; margin-bottom: 25px; }
        .social-btn { display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; border-radius: 50%; background: #f5f5f5; color: #555; font-size: 18px; transition: all 0.3s; border: 1px solid #eee; text-decoration: none; }
        .social-btn:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .social-btn.facebook:hover { background: #3b5998; color: #fff; }
        .social-btn.google:hover { background: #dd4b39; color: #fff; }
        .social-btn.twitter:hover { background: #1da1f2; color: #fff; }
        .signup-link { text-align: center; margin-top: 20px; color: #555; }
        .signup-link a { color: #ff6f61; text-decoration: none; font-weight: 600; transition: color 0.3s; }
        .signup-link a:hover { color: #e74c3c; text-decoration: underline; }
        @media (max-width: 768px) { .container { flex-direction: column; height: auto; width: 100%; } .left-panel { padding: 30px; } .right-panel { padding: 30px; } }
      `}</style>
    </div>
  );
}
