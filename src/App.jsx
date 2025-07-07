import React, { useRef, useEffect, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [moonDustBeam, setMoonDustBeam] = useState(0);
  const [showBeam, setShowBeam] = useState(false);
  const [beamTimer, setBeamTimer] = useState(0);
  const [lives, setLives] = useState(5);
  const [lastPlatformIndex, setLastPlatformIndex] = useState(0);
  const gameStateRef = useRef({
    cat: { r: 30, x: 200, y: -8, vy: 0, vx: 0 }, // Start cat on first platform
    gravity: 0.4, // Reduced gravity for easier control
    jumpForce: -8, // Much shorter jumps for better landing
    platforms: [],
    moonRotation: 0,
    stars: [],
    moonEmoji: { x: 0, y: 0, size: 60 },
    frameCount: 0
  });

  // Initialize game on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gameState = gameStateRef.current;
    
    // Create platforms (circular)
    gameState.platforms = [];
    for (let i = 0; i < 8; i++) {
      gameState.platforms.push({
        angle: i * (Math.PI / 4),
        x: 200 // distance from center
      });
    }

    // Position cat on the first platform initially
    let firstPlatform = gameState.platforms[0];
    let px = firstPlatform.x * Math.cos(firstPlatform.angle);
    let py = firstPlatform.x * Math.sin(firstPlatform.angle);
    gameState.cat.x = px;
    gameState.cat.y = py - 8;

    // Create twinkling stars, sun, moon, fairies (2x smaller)
    gameState.stars = [];
    for (let i = 0; i < 60; i++) {
      gameState.stars.push({
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        size: (Math.random() * 1 + 0.5), // 2x smaller
        twinkle: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.03 + 0.02,
        emoji: '⭐'
      });
    }
    for (let i = 0; i < 10; i++) {
      gameState.stars.push({
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        size: (Math.random() * 1 + 0.5), // 2x smaller
        twinkle: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        emoji: '🧚'
      });
    }
    for (let i = 0; i < 10; i++) {
      gameState.stars.push({
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        size: (Math.random() * 1 + 0.5), // 2x smaller
        twinkle: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        emoji: '☀️'
      });
    }
    for (let i = 0; i < 10; i++) {
      gameState.stars.push({
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        size: (Math.random() * 1 + 0.5), // 2x smaller
        twinkle: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        emoji: '🌙'
      });
    }

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    const handleClick = () => { jump(); };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // Jump function
  const jump = () => {
    const gameState = gameStateRef.current;
    const cat = gameState.cat;
    
    // Check if cat is on any platform
    let currentPlatformIndex = -1;
    let canJump = false;
    
    for (let i = 0; i < gameState.platforms.length; i++) {
      let p = gameState.platforms[i];
      let rotatedAngle = p.angle + gameState.moonRotation;
      let px = p.x * Math.cos(rotatedAngle);
      let py = p.x * Math.sin(rotatedAngle);
      let d = Math.sqrt((cat.x - px) ** 2 + (cat.y - py) ** 2);
      
      // If cat is close to this platform and not moving much vertically
      if (d < 50 && Math.abs(cat.vy) < 3) {
        canJump = true;
        currentPlatformIndex = i;
        break;
      }
    }
    
    if (canJump && currentPlatformIndex !== -1) {
      // Jump vertically
      gameState.cat.vy = gameState.jumpForce;
      
      // Calculate target platform (next in sequence)
      let nextPlatformIndex = (currentPlatformIndex + 1) % gameState.platforms.length;
      let nextPlatform = gameState.platforms[nextPlatformIndex];
      
      // Predict where the next platform will be when cat lands
      let jumpTime = Math.abs(gameState.jumpForce * 2 / gameState.gravity); // Rough jump duration
      let futureRotation = gameState.moonRotation + (0.001 + score * 0.00005) * jumpTime * 60; // Updated to match slower rotation
      
      let targetAngle = nextPlatform.angle + futureRotation;
      let targetX = nextPlatform.x * Math.cos(targetAngle);
      
      // Set horizontal velocity to reach target platform
      let deltaX = targetX - cat.x;
      gameState.cat.vx = deltaX * 0.08; // Much reduced for shorter jumps
      
      // Update last platform index when jumping successfully
      setLastPlatformIndex(currentPlatformIndex);
      
      setScore(prev => prev + 1);
    }
  };
  // Check if cat is on platform
  const onPlatform = () => {
    const gameState = gameStateRef.current;
    const cat = gameState.cat;
    for (let p of gameState.platforms) {
      // Calculate platform position considering rotation
      let rotatedAngle = p.angle + gameState.moonRotation;
      let px = p.x * Math.cos(rotatedAngle);
      let py = p.x * Math.sin(rotatedAngle);
      let d = Math.sqrt((cat.x - px) ** 2 + (cat.y - py) ** 2);
      // Check if cat is close enough to platform and falling down
      if (d < 35 && cat.vy >= 0 && cat.y >= py - 10) {
        // Land the cat on the platform
        cat.y = py - 5;
        cat.vy = 0;
        return true;
      }
    }
    return false;
  };

  // Animation loop
  useEffect(() => {
    let animationId;
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const gameState = gameStateRef.current;
      gameState.frameCount++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      for (let i = 0; i <= canvas.height; i++) {
        let inter = i / canvas.height;
        let r = Math.floor(25 * (1 - inter) + 10 * inter);
        let g = Math.floor(25 * (1 - inter) + 10 * inter);
        let b = Math.floor(60 * (1 - inter) + 25 * inter);
        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Twinkling emojis (smaller)
      gameState.stars.forEach(star => {
        star.twinkle += star.twinkleSpeed;
        let alpha = 0.5 + 0.5 * Math.sin(star.twinkle);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${star.size * 16}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (star.emoji === '🧚') {
          ctx.translate(Math.sin(star.twinkle * 2) * 8, Math.cos(star.twinkle * 1.5) * 5);
          ctx.fillStyle = `rgba(255, 150, 255, ${alpha})`;
          ctx.shadowColor = `rgba(255, 150, 255, ${alpha})`;
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
          ctx.shadowColor = `rgba(255, 255, 200, ${alpha})`;
          ctx.shadowBlur = 5;
        }
        ctx.fillText(star.emoji, star.x, star.y);
        ctx.restore();
      });

      // Moon symbol at center
      ctx.save();
      ctx.fillStyle = '#e6e6fa';
      ctx.shadowColor = '#e6e6fa';
      ctx.shadowBlur = 20;
      ctx.font = '96px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☽ ◯ ☾', 0, 0);
      ctx.restore();

      // Draw circular platforms
      ctx.save();
      ctx.rotate(gameState.moonRotation);
      gameState.platforms.forEach(platform => {
        let px = platform.x * Math.cos(platform.angle);
        let py = platform.x * Math.sin(platform.angle);
        ctx.fillStyle = 'rgba(200, 200, 255, 180)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 100)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 30, 0, Math.PI * 2); // Bigger platforms for easier landing
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();

      // Update cat
      const cat = gameState.cat;
      cat.vy += gameState.gravity;
      cat.y += cat.vy;
      cat.x += cat.vx;
      
      // Apply air resistance to horizontal movement
      cat.vx *= 0.97; // Less air resistance for better movement
      
      // Check platform collision and landing
      let onPlatformNow = false;
      for (let p of gameState.platforms) {
        let rotatedAngle = p.angle + gameState.moonRotation;
        let px = p.x * Math.cos(rotatedAngle);
        let py = p.x * Math.sin(rotatedAngle);
        let d = Math.sqrt((cat.x - px) ** 2 + (cat.y - py) ** 2);
        
        // Much easier collision detection with bigger radius
        if (d < 45 && cat.vy >= -3 && cat.y >= py - 25 && cat.y <= py + 20) {
          // Snap cat to platform
          cat.x = px;
          cat.y = py - 8; // Position cat slightly above platform
          cat.vy = 0;
          cat.vx = 0; // Stop horizontal movement when landing
          onPlatformNow = true;
          break;
        }
      }
      
      // Reset if cat falls too far
      if (cat.y > canvas.height / 2 || Math.sqrt(cat.x ** 2 + cat.y ** 2) > 400) {
        // Reduce lives instead of resetting score immediately
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            // Reset everything when out of lives
            setScore(0);
            setMoonDustBeam(0);
            setLastPlatformIndex(0); // Reset to first platform
            return 5; // Reset lives to 5
          }
          return newLives;
        });
        
        // Reset cat to last successful platform position
        let lastPlatform = gameState.platforms[lastPlatformIndex];
        let resetAngle = lastPlatform.angle + gameState.moonRotation;
        cat.x = lastPlatform.x * Math.cos(resetAngle);
        cat.y = lastPlatform.x * Math.sin(resetAngle) - 8;
        cat.vy = 0;
        cat.vx = 0;
      }

      // Draw cat
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(cat.x, cat.y, cat.r / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(cat.x - 5, cat.y - 5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cat.x + 5, cat.y - 5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Update moon rotation
      gameState.moonRotation += 0.001 + score * 0.00005; // Slower rotation for easier gameplay

      // Score display
      ctx.fillStyle = '#ffff96';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`Score: ${score}`, -canvas.width / 2 + 20, -canvas.height / 2 + 20);

      // Lives display
      ctx.fillStyle = '#ff6b6b';
      ctx.shadowColor = '#ff6b6b';
      ctx.shadowBlur = 5;
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`❤️ Lives: ${lives}`, -canvas.width / 2 + 20, -canvas.height / 2 + 50);

      // Brownie points (MoonDustBeam) - every 10 points
      let currentBeams = Math.floor(score / 10);
      if (currentBeams > moonDustBeam && score > 0) {
        setMoonDustBeam(currentBeams);
        setShowBeam(true);
        setBeamTimer(180);
      }
      
      // Also update MoonDustBeam if it's behind the current score (for lives system)
      if (moonDustBeam < Math.floor(score / 10)) {
        setMoonDustBeam(Math.floor(score / 10));
      }
      if (showBeam && beamTimer > 0) {
        setBeamTimer(prev => prev - 1);
        let alpha = beamTimer < 60 ? beamTimer / 60 : 1;
        let pulseScale = 1 + Math.sin(gameState.frameCount * 0.2) * 0.1;
        let sparkleOffset = Math.sin(gameState.frameCount * 0.15) * 10;
        ctx.save();
        ctx.translate(0, sparkleOffset);
        ctx.scale(pulseScale, pulseScale);
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = 'rgba(255, 215, 0, 1)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-200, -50, 400, 100, 20);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#8a2be2';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('🌙✨🧚MoonDustBeam🌙✨🧚', 0, -10);
        ctx.font = '20px Arial';
        ctx.fillStyle = '#ff1493';
        ctx.fillText('⭐ MoonDustBeamcharger ⭐', 0, 20);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#00bfff';
        ctx.fillText('✨ moondustBeamcharger ✨', 0, 45);
        ctx.restore();
        for (let i = 0; i < 8; i++) {
          let angle = (gameState.frameCount * 0.05 + i * Math.PI / 4);
          let x = Math.cos(angle) * (80 + Math.sin(gameState.frameCount * 0.1) * 20);
          let y = Math.sin(angle) * (40 + Math.cos(gameState.frameCount * 0.08) * 15);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(gameState.frameCount * 0.1 + i);
          ctx.globalAlpha = alpha * 0.8;
          ctx.font = `${16 + Math.sin(gameState.frameCount * 0.2 + i) * 4}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          if (i % 2 === 0) {
            ctx.fillText('⭐', 0, 0);
          } else {
            ctx.fillText('✨', 0, 0);
          }
          ctx.restore();
        }
        if (beamTimer <= 0) {
          setShowBeam(false);
        }
      }
      // MoonDustBeam counter
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`🌙✨🧚MoonDustBeam🌙✨🧚: ${moonDustBeam}`, canvas.width / 2 - 20, -canvas.height / 2 + 20);
      ctx.restore();
      ctx.restore();

      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => { if (animationId) cancelAnimationFrame(animationId); };
  }, [score, moonDustBeam, showBeam, beamTimer, lives, lastPlatformIndex]);

  return (
    <div style={{ margin: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #1a1a3a 0%, #0f0f1f 100%)' }}>
      {/* Sparkly title */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          fontFamily: 'Arial, sans-serif',
          fontSize: '2.5em',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#fff',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '10px 20px',
          borderRadius: 15,
          textShadow: '0 0 10px #ff69b4, 0 0 20px #ff1493, 0 0 30px #ff69b4, 0 0 40px #ff1493, 0 0 50px #ff69b4, 0 0 60px #ff1493',
          animation: 'sparkle 2s ease-in-out infinite alternate, glow 3s ease-in-out infinite',
          letterSpacing: 3,
          pointerEvents: 'none',
          border: '2px solid rgba(255, 105, 180, 0.5)',
        }}
      >
        🧚 Moon Dust Odyssey🧚
      </div>
      
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          cursor: 'pointer'
        }}
      />
    </div>
  );
}
