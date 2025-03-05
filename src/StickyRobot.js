import React, { useState, useEffect } from "react";

const StickyRobot = () => {
  const [position, setPosition] = useState({
    x: window.innerWidth - 220,  // Start near the right side
    y: window.innerHeight / 2,   // Start at the middle of the screen
  });

  useEffect(() => {
    // Ensure robot stays within screen bounds when window resizes
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 220),
        y: Math.min(prev.y, window.innerHeight - 220),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const moveAway = () => {
    const randomX = (Math.random() - 0.5) * 200; // Smaller movement range
    const randomY = (Math.random() - 0.5) * 200;

    setPosition((prev) => ({
      x: Math.max(20, Math.min(window.innerWidth - 220, prev.x + randomX)), // Prevent off-screen movement
      y: Math.max(20, Math.min(window.innerHeight - 220, prev.y + randomY)),
    }));
  };

  return (
    <div
      style={{
        position: "fixed",
        top: `${position.y}px`,
        left: `${position.x}px`, // Now moves freely, not just right-side
        width: "200px",
        height: "200px",
        transition: "transform 0.5s ease-out",
        cursor: "pointer",
      }}
      onMouseEnter={moveAway} // Moves when hovered
    >
      <img
        src="https://media.tenor.com/uQHOCWdnoeYAAAAi/astro-bot.gif"
        alt="Moving Robot"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default StickyRobot;
