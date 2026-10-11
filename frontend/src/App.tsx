import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Session from "@/pages/Session";
import History from "@/pages/History";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/session" element={<Session />} />
      <Route path="/session/:exerciseId" element={<Session />} />
      <Route path="/history" element={<History />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
