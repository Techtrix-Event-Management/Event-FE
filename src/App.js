import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./Navbar"; // Import Navbar
import Footer from "./Footer"; // Import Footer
import About from "./About";
import Admin from "./Admin";
import Home from "./Home";
import ParticlesBackground from "./ParticlesBackground";
import StickyRobot from "./StickyRobot";
import ContactUs from "./ContactUs";
import Event from "./Event";
import TeamEvent from "./TeamEvent";
import AdminDashboard from "./AdminDashboard";
import SponsorPage from "./SponsorPage";

function App() {
  return (
    <Router>
      <Navbar />
      <ParticlesBackground />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/team-event" element={<TeamEvent />} />
        <Route path="/event" element={<Event />} />
        <Route path="/admin/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/sponser" element={<SponsorPage />} />
      </Routes>
      <StickyRobot />
      <Footer /> {/* Added Footer */}
    </Router>
  );
}

export default App;
