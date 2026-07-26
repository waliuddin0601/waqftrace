import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PropertyDetail from "./pages/PropertyDetail";
import ReportForm from "./pages/ReportForm";
import Transparency from "./pages/Transparency";
import Legal from "./pages/Legal";
import YieldOptimizer from "./pages/YieldOptimizer";
import About from "./pages/About";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/report" element={<ReportForm />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/yield-optimizer" element={<YieldOptimizer />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}
