import { useState } from "react";
import "../styles/Login.css";
import Footer from "../shared/Footer.jsx";
import  Navbar from "../shared/Navigation.jsx";
import { useSession } from "@/context/sessions";

const Login = () => {
  const {session,setSession,loading} = useSession();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleEmailPasswordLogin = async () => {
    const res = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      credentials: "include", // cookie will be set
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    setSession(data.user);
    console.log(session)
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";

  };
  console.log("loadong",loading);
  if(loading) return (<h1>Loading...</h1>);
  return (
    <div className="login-shell">
      <Navbar />
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Access your account using email/password or Google.</p>

          <form onSubmit={handleEmailPasswordLogin} className="login-form">
            <label className="login-label">
              Email
              <div className="input-icon-wrap">
                <span className="input-icon">@</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="login-input input-with-icon"
                />
              </div>
            </label>

            <label className="login-label">
              Password
              <div className="input-icon-wrap">
                <span className="input-icon">#</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="login-input input-with-icon"
                />
              </div>
            </label>

            <button type="submit" className="login-primary-btn">
              Login with Email / Password
            </button>
          </form>

          <div className="login-divider">
            <span className="divider-line" />
            <span className="divider-text">OR</span>
            <span className="divider-line" />
          </div>

          <button type="button" onClick={handleGoogleLogin} className="login-google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 3 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.3-.2-2H12z"
              />
            </svg>
            Login with Google
          </button>

          <p className="login-footer-text">
            New user?{" "}
            <a href="/auth/register" className="login-register-link">
              Register
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
