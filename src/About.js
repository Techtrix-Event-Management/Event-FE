import React from "react";
import "./About.css"; // Ensure this file contains the necessary styles

const teamMembers = [
  {
    name: "Damini Chachane",
    description: "Full-Stack Developer",
    image: "/Damini.jpg", // Direct public path
    link: "https://www.linkedin.com/in/damini-chachane-82a210252/",
  },
  {
    name: "Ritika Dhakate",
    description: "Full-Stack Developer",
    image:
      "/Ritika.jpg",
      link: "https://www.linkedin.com/in/ritika-dhakate/",
  },
  {
    name: "Sakshi Gurav",
    description: "UI/UX Designer",
    image:
      "/Sakshi.jpg",
    link: "https://www.linkedin.com/in/sakshi-gurav-9a13562b1?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app ",
  },
  {
    name: "Roshan Gadnayak",
    description: "Database & Project Manager ",
    image:
      "https://media.licdn.com/dms/image/v2/D4D03AQFIIqgNsS2LRw/profile-displayphoto-shrink_800_800/B4DZUU7Uc5G4Ac-/0/1739812850624?e=1745452800&v=beta&t=r4GNrGDVJYN77BRBBaULx6Le4LEKSJ-r_-R5wrKJEC4",
    link: "https://in.linkedin.com/in/roshan-gadnayak-bba4a3273",
  },  {
    name: "Pratham Tarale",
    description: "Quality Analysis & Tester",
    image:
      "/Pratham.jpg",
       link: "https://www.linkedin.com/in/pratham-tarale-47573131a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app ",
  }
];

const About = () => {
  return (
    <div className="about-section">
      {/* 🔥 Video Banner */}
      <div className="video-banner">
        <video autoPlay loop muted className="banner-video">
          <source
  src="/pjlce.mp4" 
  type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        <div className="banner-overlay">
          <h1>Priyadarshini J.L College of Engineering</h1>
          <p>Join the Future of Technology and Innovation</p>
        </div>
      </div>

      {/* 🔥 Text Container Above Cards */}
      <div className="text-container" style={{
                    boxShadow: "0px 0px 15px rgba(0, 255, 204, 0.3)",

      }} >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#00ffcc",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "2px",
            textShadow:
              "0px 0px 10px rgba(0, 255, 204, 0.8), 0px 0px 20px rgba(0, 136, 255, 0.9)",
            marginBottom: "20px",
          }}
        >
         About College and Event
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: "1.6",
            maxWidth: "2800px",
            margin: "0 auto",
            padding: "15px",
            background: "rgba(0, 0, 0, 0.6)",
            borderRadius: "10px",
          }}
        >
         Techtrix 2025 is a premier technical event organized by the BITC Forum of the CSE and AI Department at PJLCE. Designed to foster innovation, creativity, and collaboration, Techtrix brings together tech enthusiasts, developers, and industry experts for an exciting lineup of competitions, hackathons, workshops, and tech talks. Whether you are a beginner or an experienced professional, this event offers a platform to showcase your skills, learn emerging technologies, and engage in meaningful networking opportunities. Join us at Techtrix 2025 and be part of the future of technology!Be part of the future at <strong>Techtrix 2025!</strong>
        </p>
        <p      style={{
            fontSize: "18px",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: "1.6",
            maxWidth: "2800px",
            margin: "0 auto",
            padding: "15px",
            background: "rgba(0, 0, 0, 0.6)",
            borderRadius: "10px",
          }} >TechTrix is the annual technical forum event of the Computer Science and Engineering (CSE) and Artificial Intelligence (AI) branches, showcasing the innovative and creative prowess of students. This premier event provides a platform for students to demonstrate their technical skills, share knowledge, and learn from industry experts. TechTrix features a range of activities, including coding competitions, hackathons, technical paper presentations, and workshops on cutting-edge technologies like AI, machine learning, and data science. With its emphasis on innovation, collaboration, and learning, TechTrix has become a highly anticipated event in the academic calendar, attracting participation from students, faculty, and industry professionals alike.</p></div>

      <div className="container">
        <h1
          style={{
            fontSize: "48px",
            color: "#00ffcc",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "15px",
            textTransform: "uppercase",
            letterSpacing: "3px",
            textShadow:
              "0px 0px 10px rgba(0, 255, 204, 0.8), 0px 0px 20px rgba(0, 136, 255, 0.9)",
            padding: "10px 15px",
            background: "linear-gradient(90deg, #00ffcc, #0088ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Developer Team
        </h1>
        <div className="card__container">
          {teamMembers.map((member, index) => (
            <article className="card__article" key={index}>
              <img src={member.image} alt={member.name} className="card__img" />
              <div className="card__data">
                <span className="card__description">{member.description}</span>
                <h2 className="card__title">{member.name}</h2>
                <a href={member.link} className="card__button">
                  LinkedIn
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
