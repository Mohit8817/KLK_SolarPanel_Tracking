import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/images/logo.png";
import "./Login.css";

const API_BASE =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000/api/";

const REMEMBER_KEY = "klk_remembered_email";

const METRICS = [
  { value: "360°", label: "Panel traceability" },
  { value: "Live", label: "Operations data" },
  { value: "RBAC", label: "Secure access" },
];

const FEATURES = [
  "Serial lot generation & numbering",
  "Production, hold & vendor workflows",
  "Dispatch, receiving & damage logs",
];

function BrandVisual() {
  return (
    <div className="klk-login__visual" aria-hidden="true">
      <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>
          <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(168,235,230,0.35)" />
          </linearGradient>
          <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3, 4].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={40 + col * 68}
              y={40 + row * 58}
              width="60"
              height="50"
              rx="4"
              fill="url(#panelGrad)"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
            />
          ))
        )}
        {[0, 1, 2, 3, 4].map((col) => (
          <line
            key={`v-${col}`}
            x1={70 + col * 68}
            y1="40"
            x2={70 + col * 68}
            y2="272"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        <line x1="40" y1="65" x2="360" y2="65" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        <line x1="40" y1="123" x2="360" y2="123" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
        <circle cx="320" cy="60" r="34" fill="rgba(255,255,255,0.08)" filter="url(#sunGlow)" />
        <circle cx="320" cy="60" r="28" fill="url(#sunGrad)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
        <circle cx="320" cy="60" r="12" fill="rgba(255,255,255,0.85)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = 320 + Math.cos(rad) * 44;
          const y2 = 60 + Math.sin(rad) * 44;
          return (
            <line
              key={deg}
              x1="320"
              y1="60"
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
      return;
    }

    const savedEmail = localStorage.getItem(REMEMBER_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, [navigate]);

  const onLogin = async (e) => {
    e.preventDefault();
    setServerError("");

    const errorsObj = { email: "", password: "" };
    let hasError = false;

    if (!email.trim()) {
      errorsObj.email = "Email is required";
      hasError = true;
    }
    if (!password) {
      errorsObj.password = "Password is required";
      hasError = true;
    }

    setErrors(errorsObj);
    if (hasError) return;

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}login/loginuser`, {
        email: email.trim(),
        password,
      });

      if (response.data?.token) {
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, email.trim());
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem(
          "permissions",
          JSON.stringify(response.data.permissions || [])
        );
        localStorage.removeItem("userDetails");

        navigate("/dashboard", { replace: true });
      } else {
        setServerError(response.data?.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setServerError(
          "Unable to connect to the server. Please try again later."
        );
      } else {
        setServerError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="klk-login">
      <aside className="klk-login__brand">
        <div className="klk-login__brand-glow" aria-hidden="true" />
        <BrandVisual />

        <div className="klk-login__brand-content">
          <Link to="/login" className="klk-login__logo-row">
            <img src={logo} alt="KLK Ventures" className="klk-login__logo" />
            <div>
              <span className="klk-login__brand-name">KLK Ventures Pvt Ltd.</span>
              <span className="klk-login__brand-tag">Solar Panel Tracking System</span>
            </div>
          </Link>

          <div className="klk-login__hero">
            <span className="klk-login__hero-badge">Solar Operations Platform</span>
            <h1>
              Complete visibility across your
              <em> panel lifecycle</em>
            </h1>
            <p>
              From serial generation to production, dispatch, and site
              receiving — manage every panel with precision.
            </p>
          </div>

          <ul className="klk-login__features">
            {FEATURES.map((text) => (
              <li key={text}>
                <span className="klk-login__check">
                  <i className="fa-solid fa-check" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className="klk-login__metrics">
            {METRICS.map((m) => (
              <div key={m.label} className="klk-login__metric">
                <strong>{m.value}</strong>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <footer className="klk-login__footer">
          <Link to="#">Privacy</Link>
          <Link to="#">Support</Link>
          <span>© {year} KLK Ventures</span>
        </footer>
      </aside>

      <main className="klk-login__main">
        <div className="klk-login__main-inner">
          <div className="klk-login__form-header">
            <div className="klk-login__form-badge" aria-hidden="true">
              <i className="fa-solid fa-solar-panel" />
            </div>
            <img src={logo} alt="" className="klk-login__form-logo" />
            <div>
              <h2>Welcome back</h2>
              <p>Sign in to continue to your dashboard</p>
            </div>
          </div>

          <div className="klk-login__form-box">
            {serverError && (
              <div className="klk-login__alert" role="alert">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={onLogin} noValidate>
              <div className="klk-login__field">
                <label htmlFor="login-email">Email address</label>
                <div className="klk-login__input-wrap">
                  <i className="fa-regular fa-envelope field-icon" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    className={errors.email ? "is-error" : ""}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                    }}
                    placeholder="name@company.com"
                  />
                </div>
                {errors.email && (
                  <p className="klk-login__field-error">{errors.email}</p>
                )}
              </div>

              <div className="klk-login__field">
                <label htmlFor="login-password">Password</label>
                <div className="klk-login__input-wrap">
                  <i className="fa-solid fa-lock field-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={errors.password ? "is-error" : ""}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((p) => ({ ...p, password: "" }));
                    }}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="klk-login__toggle-pw"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i
                      className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                    />
                  </button>
                </div>
                {errors.password && (
                  <p className="klk-login__field-error">{errors.password}</p>
                )}
              </div>

              <div className="klk-login__options">
                <label className="klk-login__remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember email
                </label>
              </div>

              <button
                type="submit"
                className="klk-login__submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="klk-login__spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Continue to dashboard
                    <i className="fa-solid fa-arrow-right" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="klk-login__secure">
            <i className="fa-solid fa-lock" />
            Encrypted connection · Authorized users only
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
