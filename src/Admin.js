import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css'; // Import the CSS file
import ParticlesBackground from "./ParticlesBackground";

function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        alert("Signup successful!");
        window.location.reload();
      } else {
        alert("Signup failed. Email may already be in use.");
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        alert("Login successful!");
        localStorage.setItem("loggedIn", "true");
        navigate("/admin/admin-dashboard");
        window.location.reload();
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  return (
    <div>
          <ParticlesBackground />    
    <div className="admin-container">
      <div className="login-box">
        <h1>Admin Login</h1>
        <p>Welcome to the Admin panel!</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

      </div>
    </div>
    </div>
  );
}

export default Admin;
