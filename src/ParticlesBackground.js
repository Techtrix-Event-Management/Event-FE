import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // Optimized package for effects

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true },
        background: {
          color: "#000000", // Deep black for outer space feel
        },
        particles: {
          number: {
            value: 300, // Increase density for a starry look
            density: { enable: true, area: 800 },
          },
          size: {
            value: { min: 1, max: 3 }, // Variation in star sizes
            random: true,
          },
          opacity: {
            value: 0.9,
            random: true,
            anim: {
              enable: true,
              speed: 0.5,
              opacity_min: 0.2,
              sync: false,
            },
          },
          move: {
            enable: true,
            speed: 1.5,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "out" },
          },
          links: {
            enable: true,
            distance: 90, // Shorter distance for dense network
            color: "#00ff00", // Neon green for cyber effect
            opacity: 0.4,
            width: 1.2,
          },
          color: {
            value: ["#ffffff", "#ffff00", "#ff00ff", "#00ffff"], // White, yellow, magenta, cyan for star colors
          },
          shape: {
            type: ["circle", "star", "char"],
            character: {
              value: ["*", "+", "X", "Ω", "Ψ"], // Matrix-like stars and symbols
              font: "monospace",
              style: "",
              weight: "700",
              fill: true,
            },
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse",
            },
            onClick: {
              enable: true,
              mode: "push",
            },
          },
          modes: {
            repulse: {
              distance: 120,
              duration: 0.4,
            },
            push: {
              quantity: 4,
            },
          },
        },
      }}
    />
  );
};

export default ParticlesBackground;
