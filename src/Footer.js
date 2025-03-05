import React from "react";
import "./Footer.css"; // Import the CSS file
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>TechTrix 2025</h2>
          <p>Computer Science Department & Artificial Intelligence</p>
          <p>Priyadarshini J.L College of Engineering</p>
        </div>

        <div className="footer-links">
        <a href="/">Home</a>            
          <a href="/about">About</a>
          <a href="/sponsor">Sponsors</a>
          <a href="/contact">Contact</a>
        </div>

        <div className="footer-socials">
          <a href="https://m.facebook.com/@pjlceofficial/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://youtube.com/@priyadarshinijlcollegeofen4690?si=gQ_JRAzevZO8xYAr" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-youtube"></i>
          </a>
          <a href="https://in.linkedin.com/company/priyadarshinijlcollageofengineering?original_referer=https%3A%2F%2Fwww.google.com%2F" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="https://www.instagram.com/bitc_pjlce?igsh=MXZweDcxOWJ3ZHo0eg==" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Eventify. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;