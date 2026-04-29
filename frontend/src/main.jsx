import "./styles/index.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter ,Routes,Route} from 'react-router-dom'
import App from './app/App.jsx'
import Login from './app/Login.jsx'
import Register from './app/Register.jsx'
import About from './app/pages/About.jsx'
import PrivacyPolicy from "./app/pages/Privacy";
import { SessionProvider } from "./context/sessions";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="auth/login" element={<Login />} />
        <Route path="auth/register" element={<Register />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
    </SessionProvider>
  </StrictMode>,
)
