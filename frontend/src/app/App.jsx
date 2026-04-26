import "../styles/App.css";
import Footer from "../shared/Footer.jsx";
import MainBody from "../components/body.jsx";
import NavigationMenu from "../shared/Navigation.jsx";
const App = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <>
    <NavigationMenu />
    <MainBody />
    <Footer />
    </>
  );
};

export default App;