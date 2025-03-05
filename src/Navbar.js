import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; // Import styles
import { useEffect } from "react";

const Navbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("loggedIn") === "true") {
      fetch("http://localhost:8080/api/auth/info", {
        method: "GET",
        credentials: "include",
      })
        .then((res) => {
          if (res.status === 401) {
            // If unauthorized, clear session and redirect to login
            localStorage.removeItem("loggedIn");
            navigate("/admin");
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data?.email) {
            setAdminEmail(data.email);
          }
        })
        .catch(() => {
          localStorage.removeItem("loggedIn");
          setAdminEmail(null);
          navigate("/admin");
        });
    }
  }, [navigate]);

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear localStorage and reload page
      localStorage.removeItem("loggedIn");
      setAdminEmail(null);
      navigate("/admin");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
    <div className="navbar-container">
      {/* Left Logo - Visible on larger screens */}
      <div className="navbar-logo desktop-logo">
        <img src="/logo.png" alt="Left Logo" />
      </div>

      {/* Navigation Links */}
      <ul className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
      {/* Logo inside the menu on small screens */}
        {isMenuOpen && (
          <div className="navbar-logo mobile-logo">
            <img src="/logo.png" alt="Mobile Logo" />
          </div>
        )}
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/sponser">Sponser</Link></li>
        {adminEmail ? (
          <li className="admin-dropdown">
            
            <div style={{
              display:"flex"
            }} >
            <Link to="/admin/admin-dashboard" className="admin-email">
              <p style={{
                fontSize:"15px"
              }} >{adminEmail}</p>
            </Link>
            <span onClick={toggleDropdown} className="dropdown-arrow"> ▼ </span>
            </div>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </li>
        ) : (
          <li><Link to="/admin">Admin</Link></li>
        )}
      </ul>

      {/* Right Logo - Visible on larger screens */}
      <div className="navbar-logo right-logo desktop-logo">
        <img src="/left-logo.png" alt="Right Logo" />
      </div>

      {/* Hamburger Icon */}
      <div className="navbar-toggle" onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </div>
  </nav>

  );
};

export default Navbar;
