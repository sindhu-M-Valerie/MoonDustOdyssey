import React, { useRef, useEffect, useState } from "react";

const SPARKLY_TITLE = "🧚 Moon Dust Odyssey 🧚";

function getRandomEmojiStar(width, height) {
  // 80% stars, 20% fairies
  if (Math.random() < 0.8) {
    return {
      x: Math.random() * width - width / 2,
      y: Math.random() * height - height / 2,
      size: Math.random() * 2 + 1,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      emoji: "⭐"
    };
  } else {
    return {
      x: Math.random() * width - width / 2,
      y: Math.random() * height - height / 2,
      size: Math.random() * 2 + 2,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      emoji: "🧚"
    };
  }
}

const useAnimationFrame = (callback) => {
  const requestRef = useRef();
  const animate = () => {
    callback();
    requestRef.current = requestAnimationFrame(animate);
  };
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line
  }, []);
};

export default function App() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [browniePoints, setBrowniePoints] = useState(0);
  const [showBrownie, setShowBrownie] = useState(false);
  const [brownieTimer, setBrownieTimer] = useState(0);
  const [stars, setStars] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Ball and platform state
  const ball = useRef({ x: 0, y: 0, vx: 0, vy: 0, r: 30, isOnMoon: true, angle: 0, distance: 140 });
  const moon = { r: 50 };
  const platforms = Array.from({ length: 8 }, (_, i) => ({ angle: i * (Math.PI / 4), distance: 140 }));
  const moonRotation = useRef(0);
  const gravity = 0.6;
  const jumpForce = -10;

  // Setup stars on mount
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setDimensions({ width, height });
    const arr = [];
    for (let i = 0; i < 120; i++) arr.push(getRandomEmojiStar(width, height));
    setStars(arr);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        if (ball.current.isOnMoon) {
          ball.current.vy = jumpForce;
          ball.current.isOnMoon = false;
        }
      } else if (e.code === "ArrowLeft") {
        if (ball.current.isOnMoon) ball.current.angle -= 0.1;
        else ball.current.vx -= 1.5;
      } else if (e.code === "ArrowRight") {
        if (ball.current.isOnMoon) ball.current.angle += 0.1;
        else ball.current.vx += 1.5;
      } else if (e.code === "ArrowDown") {
        if (!ball.current.isOnMoon) ball.current.vy += 1.5;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Animation loop
  useAnimationFrame(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = dimensions;
    ctx.clearRect(0, 0, width, height);
    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "#19193c");
    grad.addColorStop(1, "#0f0f1f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    // Twinkling stars/fairies
    stars.forEach((star, i) => {
      star.twinkle += star.twinkleSpeed;
      let alpha = 0.6 + 0.4 * Math.sin(star.twinkle);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `${star.size * (star.emoji === "🧚" ? 32 : 24)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (star.emoji === "🧚") {
        ctx.shadowColor = "#ffb6ff";
        ctx.shadowBlur = 16;
        ctx.fillStyle = "#ffb6ff";
      } else {
        ctx.shadowColor = "#fff8aa";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#fff8aa";
      }
      ctx.save();
      if (star.emoji === "🧚") {
        ctx.translate(Math.sin(star.twinkle * 2) * 8, Math.cos(star.twinkle * 1.5) * 5);
      }
      ctx.fillText(star.emoji, star.x, star.y);
      ctx.restore();
      ctx.restore();
    });
    // Moon
    ctx.save();
    ctx.shadowColor = "#e6e6fa";
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(0, 0, moon.r, 0, Math.PI * 2);
    ctx.fillStyle = "#e6e6fa";
    ctx.fill();
    ctx.restore();
    // Platforms
    ctx.save();
    ctx.rotate(moonRotation.current);
    platforms.forEach((platform) => {
      const x = platform.distance * Math.cos(platform.angle);
      const y = platform.distance * Math.sin(platform.angle);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220,220,255,0.9)";
      ctx.shadowColor = "#c8c8ff";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
    // Ball
    if (ball.current.isOnMoon) {
      const totalAngle = ball.current.angle + moonRotation.current;
      ball.current.x = ball.current.distance * Math.cos(totalAngle);
      ball.current.y = ball.current.distance * Math.sin(totalAngle);
      ball.current.vx = 0;
      ball.current.vy = 0;
    } else {
      ball.current.vy += gravity;
      ball.current.x += ball.current.vx;
      ball.current.y += ball.current.vy;
      // Land on moon
      const distFromCenter = Math.sqrt(ball.current.x ** 2 + ball.current.y ** 2);
      if (distFromCenter <= ball.current.distance + ball.current.r / 2 && ball.current.vy > 0) {
        ball.current.isOnMoon = true;
        ball.current.angle = Math.atan2(ball.current.y, ball.current.x) - moonRotation.current;
        setScore((s) => s + 1);
      }
      // Out of bounds
      if (distFromCenter > width / 2) {
        ball.current.angle = 0;
        ball.current.isOnMoon = true;
        ball.current.x = 0;
        ball.current.y = 0;
        setScore(0);
        setBrowniePoints(0);
      }
    }
    // Draw ball
    ctx.save();
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, ball.current.r / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#38bdf8";
    ctx.fill();
    ctx.restore();
    // Score
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#fff8aa";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`Score: ${score}`, -width / 2 + 20, -height / 2 + 20);
    // MoonDustOdyssey box
    ctx.save();
    ctx.fillStyle = "rgba(255,200,255,0.8)";
    ctx.strokeStyle = "#ff96ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-width / 2 + 20, -height / 2 + 55, 220, 35, 10);
    ctx.fill();
    ctx.stroke();
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("🧚 MoonDustOdyssey 🧚", -width / 2 + 30, -height / 2 + 72);
    ctx.restore();
    // Brownie points counter
    ctx.save();
    ctx.fillStyle = "rgba(255,215,0,0.8)";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-width / 2 + 20, -height / 2 + 100, 180, 25, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#8a2be2";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`🏆 Brownie Points: ${browniePoints}`, -width / 2 + 25, -height / 2 + 112);
    ctx.restore();
    ctx.restore();
    // Brownie point celebration
    if (score > 0 && score % 50 === 0 && !showBrownie) {
      setShowBrownie(true);
      setBrowniePoints((b) => b + 1);
      setBrownieTimer(180); // 3 seconds
    }
    if (showBrownie && brownieTimer > 0) {
      setBrownieTimer((t) => t - 1);
      // Draw celebration
      let alpha = 1;
      if (brownieTimer < 60) alpha = brownieTimer / 60;
      ctx.save();
      ctx.globalAlpha = alpha;
      let pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.translate(0, Math.sin(Date.now() * 0.008) * 10);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = "rgba(255,215,0,0.8)";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-200, -50, 400, 100, 20);
      ctx.fill();
      ctx.stroke();
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "#8a2be2";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🏆 BROWNIE POINT! 🏆", 0, -20);
      ctx.font = "20px Arial";
      ctx.fillStyle = "#ff1493";
      ctx.fillText("⭐ MoonDustBeamcharger ⭐", 0, 10);
      ctx.font = "16px Arial";
      ctx.fillStyle = "#00bfff";
      ctx.fillText("✨ moondustBeamcharger ✨", 0, 35);
      // Sparkles
      for (let i = 0; i < 8; i++) {
        let angle = (Date.now() * 0.002 + i * Math.PI / 4);
        let x = Math.cos(angle) * (80 + Math.sin(Date.now() * 0.004) * 20);
        let y = Math.sin(angle) * (40 + Math.cos(Date.now() * 0.003) * 15);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Date.now() * 0.004 + i);
        ctx.font = `${16 + Math.sin(Date.now() * 0.01 + i) * 4}px Arial`;
        ctx.fillStyle = i % 2 === 0 ? "#fff8aa" : "#fff";
        ctx.fillText(i % 2 === 0 ? "⭐" : "✨", 0, 0);
        ctx.restore();
      }
      ctx.restore();
      if (brownieTimer <= 1) setShowBrownie(false);
    }
    ctx.restore();
    // Animate moon rotation
    moonRotation.current += 0.002 + score * 0.0001;
  });

  // Sparkly title
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 99999,
          fontFamily: "Arial, sans-serif",
          fontSize: "2.5em",
          fontWeight: "bold",
          textAlign: "center",
          color: "#fff",
          background: "rgba(0,0,0,0.3)",
          padding: "10px 20px",
          borderRadius: 15,
          textShadow:
            "0 0 10px #ff69b4, 0 0 20px #ff1493, 0 0 30px #ff69b4, 0 0 40px #ff1493, 0 0 50px #ff69b4, 0 0 60px #ff1493",
          animation: "sparkle 2s ease-in-out infinite alternate, glow 3s ease-in-out infinite",
          letterSpacing: 3,
          pointerEvents: "none",
          border: "2px solid rgba(255, 105, 180, 0.5)",
        }}
      >
        {SPARKLY_TITLE}
      </div>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          display: "block",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      />
    </>
  );
}
