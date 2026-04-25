const App = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.75rem", color: "#111827" }}>Welcome</h1>
        <p style={{ marginTop: "12px", marginBottom: "24px", color: "#4b5563" }}>
          Sign in to continue to your account
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#111827",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default App;