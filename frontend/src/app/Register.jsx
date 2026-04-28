import { useState } from "react";
import "../styles/Register.css";
import Footer from "../shared/Footer.jsx";
import Navbar from "../shared/Navigation.jsx";

const Register = () => {
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Password and Confirm Password do not match");
      return;
    }
    // Replace with your API call for registration.
    console.log("Register payload:", registerData);
  };

  const handleForgotPasswordSubmit = (event) => {
    event.preventDefault();
    // Replace with your API call for forgot password.
    console.log("Forgot password email:", forgotEmail);
  };

  const handleGoogleRegister = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <div className="register-shell">
      <Navbar />
      <div className="register-page">
        <div className="register-layout">
          <section className="register-card">
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">
            Register with your details to start using the app.
          </p>

          <form onSubmit={handleRegisterSubmit} className="register-form">
            <label className="register-label">
              Full Name
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
                className="register-input"
              />
            </label>

            <label className="register-label">
              Email
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                className="register-input"
              />
            </label>

            <label className="register-label">
              Password
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                className="register-input"
              />
            </label>

            <label className="register-label">
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                required
                className="register-input"
              />
            </label>

            <button type="submit" className="register-primary-btn">
              Register
            </button>

            <div className="register-divider">
              <span className="register-divider-line" />
              <span className="register-divider-text">OR choose sign in</span>
              <span className="register-divider-line" />
            </div>

            <a href="/auth/login" className="register-signin-btn">
              Sign in
            </a>

            <button
              type="button"
              onClick={handleGoogleRegister}
              className="register-google-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 3 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.3-.2-2H12z"
                />
              </svg>
              Sign in with Google
            </button>
          </form>
          </section>

          <section className="register-card">
            <h2 className="register-title">Forgot Password</h2>
            <p className="register-subtitle">
              Enter your email and we will send you reset instructions.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="register-form">
              <label className="register-label">
                Email
                <input
                  type="email"
                  name="forgotEmail"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  required
                  className="register-input"
                />
              </label>

              <button type="submit" className="register-secondary-btn">
                Send Reset Link
              </button>
            </form>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
