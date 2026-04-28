import "../styles/App.css";
import Footer from "../shared/Footer.jsx";
import Navbar from "../shared/Navigation.jsx";
const App = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <>
    <Navbar />
   <h1>Hello this is Yogesh Kumar</h1>
    <Footer />
    </>
  );
};

export default App;