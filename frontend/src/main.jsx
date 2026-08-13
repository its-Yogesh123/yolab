import "./styles/index.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter ,Routes,Route, Navigate} from 'react-router-dom'
import App from './app/App.jsx'
import Login from './app/Login.jsx'
import Register from './app/Register.jsx'
import About from './app/pages/About.jsx'
import PrivacyPolicy from "./app/pages/Privacy";
import { SessionProvider } from "./context/sessions";
import Testing from "./app/pages/testing";
import TemplateMarketplace from "./prompts-lib/page";
import ShortUrlService from "./short-url/page";
import ShortUrlRedirect from "./short-url/ShortUrlRedirect";
import QRCodeService from "./qr-code/page";
import PricingPage from "./subscription/PricingPage";
import AnalyticsDashboard from "./admin/AnalyticsDashboard";
import ImageProcessingPage from "./image-processing/page";
import MaesterPage from "./maester/page";
const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/testing" element={<Testing />} />
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="auth/login" element={<Login />} />
        <Route path="auth/register" element={<Register />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />

        {/* Prompt  */}
         <Route path="prompts-ai-marketplace" element={<TemplateMarketplace />} />
         <Route path="short-url" element={<ShortUrlService />} />
          <Route path="/s/:shortId" element={<ShortUrlRedirect />} />
         <Route path="qr-code" element={<QRCodeService />} />
         <Route path="pricing" element={<PricingPage />} />
         <Route path="admin/analytics" element={<AnalyticsDashboard />} />
         <Route path="image-processing" element={<ImageProcessingPage />} />
         <Route path="maester" element={<MaesterPage />} />

      </Routes>
    </BrowserRouter>
    </SessionProvider>
  </StrictMode>,
)
