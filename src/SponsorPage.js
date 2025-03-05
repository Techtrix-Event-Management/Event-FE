// // import React, { useEffect, useState } from "react";
// // import { Swiper, SwiperSlide } from "swiper/react";
// // import "swiper/css";
// // import "swiper/css/pagination";
// // import { Autoplay, Pagination } from "swiper/modules";

// // const API_BASE_URL = "http://localhost:8080/api/sponsors";

// // const SponsorPage = () => {
// //   const [sponsors, setSponsors] = useState([]);

// //   useEffect(() => {
// //     fetchSponsors();
// //   }, []);

// //   const fetchSponsors = async () => {
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/all`);
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }
// //       const data = await response.json();
  
// //       // Ensure logo and images are in proper Base64 format
// //       const formattedData = data.map((sponsor) => ({
// //         ...sponsor,
// //         logo: sponsor.logo || "", // Base64 format from backend
// //         images: sponsor.images || [], // Base64 format from backend
// //       }));
  
// //       setSponsors(formattedData);
// //     } catch (error) {
// //       console.error("Error fetching sponsors:", error);
// //     }
// //   };
  

// //   return (
// //     <div className="bg-gray-900 text-white p-8 min-h-screen">
// //       <h1 className="text-3xl font-bold text-center mb-6">Our Sponsors</h1>

// //       {/* Randomized Logo Grid */}
// //       <div className="relative w-full h-[300px] overflow-hidden">
// //         {sponsors.map((sponsor) => (
// //           <a
// //             key={sponsor.id}
// //             href={sponsor.websiteUrl}
// //             target="_blank"
// //             rel="noopener noreferrer"
// //             className="absolute"
// //             style={{
// //               top: `${Math.random() * 70}%`,
// //               left: `${Math.random() * 80}%`,
// //             }}
// //           >
// //             <img
// //               src={sponsor.logo} // Directly using the URL from your backend
// //               alt={sponsor.name}
// //               className="w-20 h-20 object-contain transition-transform duration-300 hover:scale-110"
// //             />
// //           </a>
// //         ))}
// //       </div>

// //       {/* Carousel for Sponsor Images */}
// //       <h2 className="text-2xl font-semibold text-center mt-8 mb-4">
// //         Sponsors Showcase
// //       </h2>
// //       <div className="w-full flex justify-center">
// //       <Swiper
// //         slidesPerView={Math.min(3, sponsors.length)} // Adjust dynamically
// //         slidesPerGroup={Math.min(3, sponsors.length)}
// //         spaceBetween={10}
// //         loop={sponsors.length > 3} // Disable loop if not enough slides
// //         autoplay={{ delay: 2500, disableOnInteraction: false }}
// //         pagination={{ clickable: true }}
// //         modules={[Autoplay, Pagination]}
// //         className="w-full max-w-3xl"
// //       >

// //           {sponsors.flatMap((sponsor) =>
// //             sponsor.images.map((image) => (
// //               <SwiperSlide key={image.id}>
// //                 <img
// //                   src={image} 
// //                   alt="Sponsor Image"
// //                   className="w-full h-48 object-cover rounded-lg"
// //                 />
// //               </SwiperSlide>
// //             ))
// //           )}
// //         </Swiper>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SponsorPage;



// import React, { useEffect, useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/pagination";
// import  "./SponsorPage.css"
// import { Autoplay, Pagination } from "swiper/modules";

// const API_BASE_URL = "http://localhost:8080/api/sponsors";

// const SponsorPage = () => {
//   const [sponsors, setSponsors] = useState([]);

//   useEffect(() => {
//     fetchSponsors();
//   }, []);

//   const fetchSponsors = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/all`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       const data = await response.json();

//       const formattedData = data.map((sponsor) => ({
//         ...sponsor,
//         logo: sponsor.logo || "",
//         images: sponsor.images || [],
//       }));

//       setSponsors(formattedData);
//     } catch (error) {
//       console.error("Error fetching sponsors:", error);
//     }
//   };

//   return (
//     <div className="bg-gray-900 text-white p-8 min-h-screen">
//       <h1 className="text-3xl font-bold text-center mb-6">Our Sponsors</h1>

//       {/* Sponsor Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
//         {sponsors.map((sponsor) => (
//           <div key={sponsor.id} className="bg-white p-4 rounded-lg shadow-md hover:scale-105 transition-transform">
//             <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer">
//               <img src={sponsor.logo} alt={sponsor.name} className="w-full h-32 object-contain" />
//               <h2 className="text-xl font-bold text-center text-gray-900 mt-4">{sponsor.name}</h2>
//             </a>
//           </div>
//         ))}
//       </div>

//       {/* Sponsors Showcase */}
//       <h2 className="text-2xl font-semibold text-center mt-8 mb-4">Sponsors Showcase</h2>
//       <Swiper
//         slidesPerView={Math.min(3, sponsors.length)}
//         slidesPerGroup={Math.min(3, sponsors.length)}
//         spaceBetween={10}
//         loop={sponsors.length > 3}
//         autoplay={{ delay: 2500, disableOnInteraction: false }}
//         pagination={{ clickable: true }}
//         modules={[Autoplay, Pagination]}
//         className="w-full max-w-3xl mx-auto"
//       >
//         {sponsors.flatMap((sponsor) =>
//           sponsor.images.map((image, index) => (
//             <SwiperSlide key={`${sponsor.name}-${index}`}>
//               <img src={image} alt={`${sponsor.name} ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
//             </SwiperSlide>
//           ))
//         )}
//       </Swiper>
//     </div>
//   );
// };

// export default SponsorPage;

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";

const SponsorPage = () => {
  const [sponsors, setSponsors] = useState([]);

  const API_BASE_URL = "http://localhost:8080/api/sponsors";
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
