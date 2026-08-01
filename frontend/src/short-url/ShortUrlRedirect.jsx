import { useEffect } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"; // backend URL

function ShortUrlRedirect() {
  const { shortId } = useParams();
  useEffect(() => {
    window.location.replace(`${API}/s/${shortId}`);
  }, [shortId]);

  return <p>Redirecting...</p>;
}

export default ShortUrlRedirect;