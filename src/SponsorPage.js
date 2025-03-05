import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";

const SponsorPage = () => {
  const [sponsors, setSponsors] = useState([]);

  const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/sponsors`;
  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
  
      // Ensure logo and images are in proper Base64 format
      const formattedData = data.map((sponsor) => ({
        ...sponsor,
        logo: sponsor.logo || "", // Base64 format from backend
        images: sponsor.images || [], // Base64 format from backend
      }));
  
      setSponsors(formattedData);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
    }
  };
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      textAlign: "center",
      paddingTop: "20px",
      color: "white",
    }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" }}>Our Sponsors</h1>
      <p style={{ fontSize: "1.2rem", maxWidth: "600px", marginBottom: "20px" }}>
        We are proud to be supported by these amazing organizations. Their contributions help us grow and innovate!
      </p>

      {/* Sponsor Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        width: "80%",
        maxWidth: "1000px",
        padding: "10px",
        marginBottom: "30px",
      }}>
        {sponsors.map((sponsor, index) => (
          <div key={index} style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease-in-out",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer">
              <img src={sponsor.logo} alt={sponsor.name} style={{ width: "100%", height: "150px", objectFit: "contain" }} />
              <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#333", marginTop: "10px" }}>{sponsor.name}</h2>
            </a>
          </div>
        ))}
      </div>
      
      {/* Sponsor Carousel */}
      <Swiper 
        modules={[Autoplay]} 
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        style={{ width: "80%", maxWidth: "1200px", borderRadius: "10px", overflow: "hidden" }}>
        {sponsors.flatMap((sponsor) => sponsor.images.map((image, i) => (
          <SwiperSlide key={`${sponsor.name}-${i}`}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src={image} alt={`${sponsor.name} ${i + 1}`} style={{ width: "100%", height: "550px", objectFit: "contain" }} />
            </div>
          </SwiperSlide>
        )))}
      </Swiper>
    </div>
  );
};

export default SponsorPage;
