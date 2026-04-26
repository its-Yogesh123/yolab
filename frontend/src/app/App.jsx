import "../styles/App.css";
import Footer from "../shared/Footer.jsx";

const App = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <>
    <Footer />
    </>
  );
};

export default App;