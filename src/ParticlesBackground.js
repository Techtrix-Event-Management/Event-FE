import React, { useCallback, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { useLocation } from "react-router-dom";

const ParticlesBackground = () => {
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();

  const particlesInit = useCallback(async (engine) => {
    console.log("Initializing Particles...");
    await loadSlim(engine);
    await engine.refresh();
    setLoaded(true);
  }, []);

  useEffect(() => {
    console.log("Route changed, reloading particles...");
    setLoaded(false);
    setTimeout(() => setLoaded(true), 100); // Delay to allow re-initialization
  }, [location]);

  return loaded ? (
    <Particles
      id="tsparticles"
      init={particlesInit}
      style={{ height: "auto" }}
      options={{
        fullScreen: { enable: true },
        background: { color: "#000000" },
        particles: {
          number: { value: 300, density: { enable: true, area: 800 } },
          size: { value: { min: 1, max: 3 }, random: true },
          opacity: { value: 0.9, random: true },
          move: { enable: true, speed: 1.5 },
          links: { enable: true, color: "#00ff00", opacity: 0.4 },
          color: { value: ["#ffffff", "#ffff00", "#ff00ff", "#00ffff"] },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
            onClick: { enable: true, mode: "push" },
          },
          modes: {
            repulse: { distance: 120, duration: 0.4 },
            push: { quantity: 4 },
          },
        },
      }}
    />
  ) : null;
};

export default ParticlesBackground;
