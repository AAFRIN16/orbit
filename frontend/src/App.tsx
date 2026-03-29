import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import About from "./pages/About";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}