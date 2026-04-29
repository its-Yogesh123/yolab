import "../styles/App.css";
import Footer from "../shared/Footer.jsx";
import Navbar from "../shared/Navigation.jsx";
import YoLabHome from "./pages/Home";
const App = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <>
    <Navbar />
    <YoLabHome />
    <Footer />
    </>
  );
};

export default App;