import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PropertyDetail from "./pages/PropertyDetail";
import ReportForm from "./pages/ReportForm";
import Marketplace from "./pages/Marketplace";
import Donate from "./pages/Donate";
import Legal from "./pages/Legal";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Transparency from "./pages/Transparency";
import About from "./pages/About";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/report" element={<ReportForm />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}
