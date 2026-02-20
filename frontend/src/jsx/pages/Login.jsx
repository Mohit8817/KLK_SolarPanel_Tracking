import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// images
import logo from "../../assets/images/logo.png";
import loginbg from "../../assets/images/bg-login.jpg";

function Login() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard"); // only redirect if token exists
    }
  }, [navigate]);

  const onLogin = async (e) => {
    e.preventDefault();

    const errorsObj = { email: "", password: "" };
    let error = false;

    if (!email) { errorsObj.email = "Email is required"; error = true; }
    if (!password) { errorsObj.password = "Password is required"; error = true; }

    setErrors(errorsObj);
    if (error) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}login/loginuser`,
        { email, password }
      );

      if (response.data?.token) {
        // Save token in localStorage
        localStorage.setItem("token", response.data.token);

        // Save user info for later use
        localStorage.setItem("user", JSON.stringify(response.data.user));

        alert("Login Successful!");

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        alert(response.data?.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-main-page" style={{ backgroundImage: `url(${loginbg})` }}>
      <div className="login-wrapper">
        <div className="login-aside-left">
          <Link to="/dashboard" className="login-logo">
            <img src={logo} alt="LogoKLK" className="w-25" />
            <span className="main-title fs-1 mx-2 fs-2">Ventures Pvt Ldt.</span>
          </Link>
          <div className="login-description">
            <h4 className="main-title fs-1 mb-2">Welcome To KLK Ventures Pvt Ltd.</h4>
            <p>
              KLK Ventures provides an advanced solar panel tracking system designed to
              monitor panel generation, dispatch, and damage status in real time.
            </p>
            <ul className="social-icons mt-4">
              <li><Link to="https://www.facebook.com/KLKINDIA/" target="_blank"><i className="fab fa-facebook-f"></i></Link></li>
              <li><Link to="https://in.linkedin.com/company/klkventures" target="_blank"><i className="fab fa-linkedin-in"></i></Link></li>
              <li><Link to="https://www.instagram.com/klkventures/?hl=en" target="_blank"><i className="fab fa-instagram"></i></Link></li>
            </ul>
            <div className="mt-5 bottom-privacy">
              <Link to="#" className="mr-4">Privacy Policy</Link>
              <Link to="#" className="mr-4">Contact</Link>
              <Link to="#">© {year} ETS Network</Link>
            </div>
          </div>
        </div>

        <div className="login-aside-right">
          <div className="row m-0 justify-content-center h-100 align-items-center">
            <div className="p-5">
              <div className="authincation-content">
                <div className="row no-gutters">
                  <div className="col-xl-12">
                    <div className="auth-form-1">
                      <div className="mb-4">
                        <h3 className="dz-title mb-1">Sign in</h3>
                        <p>Sign in by entering information below</p>
                      </div>

                      <form onSubmit={onLogin}>
                        <div className="form-group">
                          <label className="mb-2"><strong>Email</strong> <span className="required">*</span></label>
                          <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Type Your Email Address"
                          />
                          {errors.email && <div className="text-danger fs-12">{errors.email}</div>}
                        </div>

                        {/* <div className="form-group">
                          <label className="mb-2"><strong>Password</strong> <span className="required">*</span></label>
                          <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Type Your Password"
                          />
                          {errors.password && <div className="text-danger fs-12">{errors.password}</div>}
                        </div> */}

                        <div className="form-group">
                          <label className="mb-2">
                            <strong>Password</strong> <span className="required">*</span>
                          </label>

                          <div className="position-relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              className="form-control pe-5"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Type Your Password"
                            />

                            <i
                              className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} position-absolute`}
                              style={{
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                fontSize: "18px",
                                color: "#6c757d"
                              }}
                              onClick={() => setShowPassword(!showPassword)}
                            ></i>
                          </div>

                          {errors.password && (
                            <div className="text-danger fs-12">{errors.password}</div>
                          )}
                        </div>


                        <div className="form-row d-flex justify-content-between mt-4 mb-2">
                          <div className="form-check custom-checkbox ml-1">
                            <input type="checkbox" className="form-check-input" id="basic_checkbox_1" />
                            <label className="form-check-label" htmlFor="basic_checkbox_1">
                              Remember my preference
                            </label>
                          </div>
                        </div>

                        <div className="text-center">
                          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                          </button>
                        </div>
                      </form>

                      <div className="new-account mt-2">
                        <p>Don&apos;t have an account? <Link className="text-primary" to="/page-register">Sign up</Link></p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;