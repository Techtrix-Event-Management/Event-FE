import React, { useState, useEffect } from "react";

const StickyRobot = () => {
  const [position, setPosition] = useState({
    x: window.innerWidth - 120, // Adjusted initial size for mobile
    y: window.innerHeight / 2,
  });

  const [robotSize, setRobotSize] = useState(100); // Initial size

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768; // Example mobile breakpoint
      const newSize = isMobile ? 100 : 200; // Adjust size based on screen width
      setRobotSize(newSize);

      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - newSize - 20), // Adjusted bounds
        y: Math.min(prev.y, window.innerHeight - newSize - 20),
      }));
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call to set size and position
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const moveAway = () => {
    const randomX = (Math.random() - 0.5) * 100; // Reduced movement for mobile
    const randomY = (Math.random() - 0.5) * 100;

    setPosition((prev) => ({
      x: Math.max(20, Math.min(window.innerWidth - robotSize - 20, prev.x + randomX)),
      y: Math.max(20, Math.min(window.innerHeight - robotSize - 20, prev.y + randomY)),
    }));
  };

  return (
    <div
      style={{
        position: "fixed",
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${robotSize}px`,
        height: `${robotSize}px`,
        transition: "transform 0.5s ease-out",
        cursor: "pointer",
      }}
      onMouseEnter={moveAway}
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
