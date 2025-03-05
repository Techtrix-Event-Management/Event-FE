import React, { useState } from "react";
import emailjs from "@emailjs/browser"; // Import Email.js
import "./ContactUs.css"; // Import CSS for styling
import ParticlesBackground from "./ParticlesBackground";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "", // Added number field
    message: "",
    events: [],
  });

  const eventsList = ["Hackathon", "Workshop", "Webinar", "Tech Talk"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      events: checked
        ? [...prevData.events, value]
        : prevData.events.filter((event) => event !== value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Email.js configuration
    const serviceID = "service_id0gsfl"; // Replace with your Email.js Service ID
    const templateID = "template_piepe3t"; // Replace with your Email.js Template ID
    const publicKey = "F6-FLIt3E2t8c37b_"; // Replace with your Email.js Public Key

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      from_number: formData.number, // Ensure this matches your template field
      message: formData.message,
      selected_events: formData.events.join(", "),
    };

    emailjs
      .send(serviceID, templateID, templateParams, publicKey)
      .then((response) => {
        console.log("Email sent successfully!", response);
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", number: "", message: "", events: [] });
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        alert("Failed to send message. Please try again.");
      });
  };

  return (
    <div>
      <ParticlesBackground />
      <div className="contact-container">
        <div className="contact-form-box">
          <h2>Contact Us</h2>
          <p>We'd love to hear from you! Fill out the form below.</p>

          <form onSubmit={handleSubmit} className="contact-form">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Added Input for Number */}
            <input
              type="tel"
              name="number"
              placeholder="Your Contact Number"
              value={formData.number}
              onChange={handleChange}
              required
            />

            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
            />

            <div className="event-selection">
              <h4>Select Events:</h4>
              <div className="event-options" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {eventsList.map((event) => (
                  <label key={event} className="event-checkbox" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <input
                      type="checkbox"
                      name="events"
                      value={event}
                      checked={formData.events.includes(event)}
                      onChange={handleCheckboxChange}
                      style={{
                        width:"10%"
                      }}
                    />
                    <span>{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit">Send Message</button>
          </form>
        </div>

        <div className="map-section">
          <h2>Visit Here</h2>
          <div className="map-container">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.451529517528!2d79.12008847457419!3d21.134421784142408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4c75b570605cf%3A0x5a04c171c5804304!2sPriyadarshini%20J.%20L.%20College%20of%20Engineering%20(AUTONOMOUS)!5e0!3m2!1sen!2sin!4v1740216795108!5m2!1sen!2sin"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;