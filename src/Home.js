import React, { useEffect, useState } from "react";
import "./Home.css"; 
import {Navigate, useNavigate} from "react-router-dom";
import ReactPlayer from "react-player";
import ParticlesBackground from "./ParticlesBackground";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [countdown, setCountdown] = useState("");

  const targetDate = new Date("2025-03-21T00:00:00").getTime(); // Set your target date
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));

  function getTimeRemaining(target) {
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);


  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/events`)
          .then((response) => response.json())
      .then((data) => {
        setEvents(data);
        if (data.length > 0) {
          startCountdown(data[0].eventDate);
        }
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const startCountdown = (eventDate) => {
    const targetDate = new Date(eventDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference < 0) {
        clearInterval(interval);
        setCountdown("Event has started!");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
  };
  const navigate = useNavigate();
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/events`)
    .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const handleRegisterClick = async (eventId) => {
    try {
      console.log("Fetching event with ID:", eventId);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}`);
      if (!response.ok) throw new Error("Event not found");

      const event = await response.json();
      console.log("Fetched event:", event);

      if (!event.registrationOpen) {
        alert("Registration is closed for this event.");
        return;
      }

      if (event.isTeamParticipation) {
        console.log("Navigating to TeamEvent.js");
        navigate('/team-event', { state: { event } });
      } else {
        console.log("Event.js");
        navigate('/event', { state: { event } });
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  
  return (
    <div className="home-container">
      <ParticlesBackground />

      <section className="techtrix-section">
        <div className="video-container">
          <div className="video-background">
            <ReactPlayer
              url="https://www.youtube.com/embed/QY7OtoGCCnw"
              playing={true}
              muted={true}
              loop={true}
              width="100%"
              height="100%"
            />
          </div>
        </div>

        <div className="text-container">
  <h2 className="techtrix-title"> TechTrix 2K25 </h2>
  <p className="techtrix-subtitle">
    Presented by <strong>Computer Science & Engineering</strong> and <strong>Artificial Intelligence</strong>  
  </p>
  <p className="techtrix-tagline">Unleash Innovation, Ignite Intelligence, Shape the Future! 
  </p>
</div>
      </section>

      

      {/* 🔥 Event List Section */}
      <section className="events-section">
      <h2 className="events-title">
        <span className="glow-text">Countdown</span></h2>
        <div className="countdown-container">
      <div className="countdown-box">
        {timeLeft.days}
        <span className="countdown-label">Days</span>
      </div>
      <div className="countdown-box">
        {timeLeft.hours}
        <span className="countdown-label">Hours</span>
      </div>
      <div className="countdown-box">
        {timeLeft.minutes}
        <span className="countdown-label">Minutes</span>
      </div>
      <div className="countdown-box">
        {timeLeft.seconds}
        <span className="countdown-label">Seconds</span>
      </div>
    </div>
        <h2 className="events-title">Upcoming Events</h2>
        <div className="events-container">
          {events.length > 0 ? (
            events.map((event) => (
              <div className="event-card" key={event.id}>
                <img className="event-image" src={event.image} alt={event.eventName} />
                <h3>{event.eventName}</h3>
                <p>{event.description}</p>
                {event.registrationOpen ? (
                  <button className="register-btn" onClick={() => handleRegisterClick(event.id)}>Register Now</button>
                ) : (
                  <p className="registration-closed">Registration Closed</p>
                )}
              </div>
            ))
          ) : (
            <p className="no-events">No events available at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

