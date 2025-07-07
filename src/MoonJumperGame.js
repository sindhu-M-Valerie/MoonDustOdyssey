import React, { useState, useEffect, useRef } from 'react';

const MoonJumperGame = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const gameRef = useRef({
        ball: { 
            angle: 0,           // Angle on moon surface
            distance: 140,      // Distance from moon center (decreased by half from 280 to 140)
            x: 0, y: 0,         // Cartesian coordinates
            vx: 0, vy: 0,       // Velocity when jumping
            r: 30,              // Radius
            isOnMoon: true      // Whether ball is on moon surface
        },
        platforms: [],
        stars: [],
        moonRotation: 0,
        gravity: 0.4,
        jumpForce: 8,
        animationId: null
    });

    // Separate effect for initializing the game (runs once)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Initialize game objects
        const game = gameRef.current;
        
        // Create platforms
        game.platforms = [];
        for (let i = 0; i < 8; i++) {
            game.platforms.push({
                angle: i * (Math.PI / 4),
                distance: 140 // Decreased by half from 280 to 140
            });
        }
        
        // Create stars and sparkles
        game.stars = [];
        for (let i = 0; i < 25; i++) {
            game.stars.push({
                x: (Math.random() - 0.5) * canvas.width,
                y: (Math.random() - 0.5) * canvas.height,
                size: Math.random() * 1.5 + 0.5, // Smaller stars
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.02 + 0.01,
                moveX: (Math.random() - 0.5) * 0.8, // Increased random movement
                moveY: (Math.random() - 0.5) * 0.8,
                wanderAngle: Math.random() * Math.PI * 2, // Random wander direction
                wanderSpeed: Math.random() * 0.02 + 0.01, // Speed of direction changes
                type: 'star',
                fadePhase: Math.random() * Math.PI * 2,
                fadeSpeed: Math.random() * 0.01 + 0.005
            });
        }
        
        // Add sparkle emojis
        for (let i = 0; i < 20; i++) {
            game.stars.push({
                x: (Math.random() - 0.5) * canvas.width,
                y: (Math.random() - 0.5) * canvas.height,
                size: Math.random() * 1 + 0.3, // Smaller sparkles
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.03 + 0.01,
                moveX: (Math.random() - 0.5) * 1.2, // Increased random movement
                moveY: (Math.random() - 0.5) * 1.2,
                wanderAngle: Math.random() * Math.PI * 2,
                wanderSpeed: Math.random() * 0.03 + 0.01,
                type: 'sparkle',
                fadePhase: Math.random() * Math.PI * 2,
                fadeSpeed: Math.random() * 0.015 + 0.008
            });
        }
        
        // Add sun emojis
        for (let i = 0; i < 12; i++) {
            game.stars.push({
                x: (Math.random() - 0.5) * canvas.width,
                y: (Math.random() - 0.5) * canvas.height,
                size: Math.random() * 1.2 + 0.4, // Medium sized suns
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.01 + 0.005,
                moveX: (Math.random() - 0.5) * 0.6, // Increased random movement
                moveY: (Math.random() - 0.5) * 0.6,
                wanderAngle: Math.random() * Math.PI * 2,
                wanderSpeed: Math.random() * 0.015 + 0.005,
                type: 'sun',
                fadePhase: Math.random() * Math.PI * 2,
                fadeSpeed: Math.random() * 0.008 + 0.003
            });
        }
        
        // Add crescent moon emojis
        for (let i = 0; i < 15; i++) {
            game.stars.push({
                x: (Math.random() - 0.5) * canvas.width,
                y: (Math.random() - 0.5) * canvas.height,
                size: Math.random() * 1.3 + 0.5, // Small to medium crescents
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.008 + 0.003,
                moveX: (Math.random() - 0.5) * 0.4, // Increased random movement
                moveY: (Math.random() - 0.5) * 0.4,
                wanderAngle: Math.random() * Math.PI * 2,
                wanderSpeed: Math.random() * 0.01 + 0.003,
                type: 'crescent',
                fadePhase: Math.random() * Math.PI * 2,
                fadeSpeed: Math.random() * 0.006 + 0.002
            });
        }

        // Initialize ball position - start on moon surface
        game.ball.angle = 0;
        game.ball.distance = 140; // Decreased by half from 280 to 140
        game.ball.isOnMoon = true;
        game.ball.vx = 0;
        game.ball.vy = 0;
        
        setGameStarted(true);
    }, []);

    // Separate effect for game loop (runs when game starts)
    useEffect(() => {
        if (!gameStarted) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const game = gameRef.current;
        
        
        // Game loop
        function gameLoop() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgb(25, 25, 60)');
            gradient.addColorStop(1, 'rgb(10, 10, 25)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Center coordinate system
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            
            // Draw twinkling stars and sparkles with random wandering
            game.stars.forEach(star => {
                // Update twinkle animation
                star.twinkle += star.speed;
                star.fadePhase += star.fadeSpeed;
                
                // Update wandering behavior
                star.wanderAngle += (Math.random() - 0.5) * 0.1; // Random direction changes
                
                // Apply wandering movement
                star.moveX += Math.cos(star.wanderAngle) * star.wanderSpeed;
                star.moveY += Math.sin(star.wanderAngle) * star.wanderSpeed;
                
                // Add some damping to prevent runaway speeds
                star.moveX *= 0.98;
                star.moveY *= 0.98;
                
                // Limit maximum speed
                const maxSpeed = star.type === 'sparkle' ? 1.5 : star.type === 'star' ? 1.0 : 0.8;
                const currentSpeed = Math.sqrt(star.moveX * star.moveX + star.moveY * star.moveY);
                if (currentSpeed > maxSpeed) {
                    star.moveX = (star.moveX / currentSpeed) * maxSpeed;
                    star.moveY = (star.moveY / currentSpeed) * maxSpeed;
                }
                
                // Apply movement
                star.x += star.moveX;
                star.y += star.moveY;
                
                // Wrap around screen edges with some padding
                const padding = 100;
                if (star.x > canvas.width / 2 + padding) star.x = -canvas.width / 2 - padding;
                if (star.x < -canvas.width / 2 - padding) star.x = canvas.width / 2 + padding;
                if (star.y > canvas.height / 2 + padding) star.y = -canvas.height / 2 - padding;
                if (star.y < -canvas.height / 2 - padding) star.y = canvas.height / 2 + padding;
                
                // Occasionally change direction dramatically
                if (Math.random() < 0.001) {
                    star.wanderAngle = Math.random() * Math.PI * 2;
                }
                
                // Calculate alpha with multiple fade effects - brighter twinkling
                const twinkleAlpha = (Math.sin(star.twinkle) + 1) / 2;
                const fadeAlpha = (Math.sin(star.fadePhase) + 1) / 2;
                const combinedAlpha = (twinkleAlpha * 0.8 + fadeAlpha * 0.4) * 0.9 + 0.3; // Increased brightness
                
                // Calculate size with pulsing effect
                const sizePulse = 1 + Math.sin(star.twinkle * 2) * 0.4;
                const size = star.size * sizePulse;
                
                ctx.save();
                ctx.globalAlpha = combinedAlpha;
                
                if (star.type === 'star') {
                    // Render star emoji - brighter glow
                    ctx.shadowColor = `rgba(255, 255, 200, ${combinedAlpha})`;
                    ctx.shadowBlur = size * 6; // Increased from 4
                    
                    ctx.font = `${size * 6}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('⭐', star.x, star.y);
                } else if (star.type === 'sparkle') {
                    // Render sparkle emoji - brighter glow
                    ctx.shadowColor = `rgba(255, 255, 255, ${combinedAlpha})`;
                    ctx.shadowBlur = size * 8; // Increased from 5
                    
                    ctx.font = `${size * 8}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Rotate sparkles for extra motion
                    ctx.save();
                    ctx.translate(star.x, star.y);
                    ctx.rotate(star.twinkle * 0.5);
                    ctx.fillText('✨', 0, 0);
                    ctx.restore();
                } else if (star.type === 'sun') {
                    // Render sun emoji - brighter glow
                    ctx.shadowColor = `rgba(255, 220, 100, ${combinedAlpha * 0.9})`;
                    ctx.shadowBlur = size * 9; // Increased from 6
                    
                    ctx.font = `${size * 7}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Slow rotation for suns
                    ctx.save();
                    ctx.translate(star.x, star.y);
                    ctx.rotate(star.twinkle * 0.2);
                    ctx.fillText('☀️', 0, 0);
                    ctx.restore();
                } else if (star.type === 'crescent') {
                    // Render crescent moon emoji - brighter glow
                    ctx.shadowColor = `rgba(200, 200, 255, ${combinedAlpha * 0.8})`;
                    ctx.shadowBlur = size * 7; // Increased from 5
                    
                    ctx.font = `${size * 6.5}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Very slow rotation for crescents
                    ctx.save();
                    ctx.translate(star.x, star.y);
                    ctx.rotate(star.twinkle * 0.1);
                    ctx.fillText('🌙', 0, 0);
                    ctx.restore();
                }
                
                ctx.restore();
                ctx.shadowBlur = 0;
            });
            
            // Draw moon surface with craters and texture
            const moonScale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
            const moonGlow = (Math.sin(Date.now() * 0.002) + 1) / 2 * 0.3 + 0.4;
            
            ctx.save();
            ctx.scale(moonScale, moonScale);
            
            // Draw moon glow/atmosphere
            ctx.shadowColor = `rgba(200, 200, 255, ${moonGlow})`;
            ctx.shadowBlur = 40;
            
            // Main moon surface - decreased by half back to original size
            ctx.fillStyle = '#E6E6FA';
            ctx.beginPath();
            ctx.arc(0, 0, 50, 0, Math.PI * 2); // Decreased from 100 back to 50 (half)
            ctx.fill();
            
            // Add darker areas for texture - scaled back to original size
            ctx.fillStyle = 'rgba(180, 180, 200, 0.3)';
            ctx.beginPath();
            ctx.arc(-10, -13, 8, 0, Math.PI * 2); // Scaled back to original from -20, -26, 16
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(17, 7, 12, 0, Math.PI * 2); // Scaled back to original from 34, 14, 24
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(-20, 20, 7, 0, Math.PI * 2); // Scaled back to original from -40, 40, 14
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(7, -23, 5, 0, Math.PI * 2); // Scaled back to original from 14, -46, 10
            ctx.fill();
            
            // Add round craters (changed from elliptical to circular) - scaled back to original size
            ctx.fillStyle = 'rgba(120, 120, 150, 0.4)';
            ctx.beginPath();
            ctx.arc(-7, -7, 4, 0, Math.PI * 2); // Scaled back to original from -14, -14, 8
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(13, -3, 3, 0, Math.PI * 2); // Scaled back to original from 26, -6, 6
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(-17, 10, 3, 0, Math.PI * 2); // Scaled back to original from -34, 20, 6
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(3, 17, 2, 0, Math.PI * 2); // Scaled back to original from 6, 34, 4
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(23, -17, 2, 0, Math.PI * 2); // Scaled back to original from 46, -34, 4
            ctx.fill();
            
            // Add more round craters for better coverage - scaled back to original size
            ctx.beginPath();
            ctx.arc(-27, -7, 2, 0, Math.PI * 2); // Scaled back to original from -54, -14, 4
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(10, 27, 3, 0, Math.PI * 2); // Scaled back to original from 20, 54, 6
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(-3, 33, 1, 0, Math.PI * 2); // Scaled back to original from -6, 66, 2
            ctx.fill();
            
            // Remove the moon emoji from center - just keep the surface
            ctx.restore();
            
            // Draw rotating platforms
            ctx.save();
            ctx.rotate(game.moonRotation);
            
            game.platforms.forEach((platform, index) => {
                const x = platform.distance * Math.cos(platform.angle);
                const y = platform.distance * Math.sin(platform.angle);
                
                // Platform base with gradient
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
                gradient.addColorStop(0, 'rgba(220, 220, 255, 0.9)');
                gradient.addColorStop(1, 'rgba(180, 180, 220, 0.7)');
                
                ctx.fillStyle = gradient;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                
                // Main platform shape - now circular instead of elliptical
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2); // Changed from ellipse to circular arc
                ctx.fill();
                ctx.stroke();
                
                // Add platform glow effect
                ctx.shadowColor = 'rgba(200, 200, 255, 0.6)';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2); // Changed from ellipse to circular arc
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Add small details/rocks on platforms - adjusted for circular shape
                ctx.fillStyle = 'rgba(160, 160, 200, 0.8)';
                ctx.beginPath();
                ctx.arc(x - 6, y - 3, 2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(x + 8, y + 2, 1.5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(x - 2, y + 5, 1.8, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(x + 4, y - 6, 1.2, 0, Math.PI * 2);
                ctx.fill();
            });
            
            ctx.restore();
            
            // Update and draw ball
            const ball = game.ball;
            
            if (ball.isOnMoon) {
                // Ball sticks to moon surface and rotates with it
                const totalAngle = ball.angle + game.moonRotation;
                ball.x = ball.distance * Math.cos(totalAngle);
                ball.y = ball.distance * Math.sin(totalAngle);
            } else {
                // Ball is in flight - apply physics
                ball.vx += 0; // No air resistance
                ball.vy += game.gravity;
                ball.x += ball.vx;
                ball.y += ball.vy;
                
                // Calculate distance from moon center
                const distFromCenter = Math.sqrt(ball.x * ball.x + ball.y * ball.y);
                
                // Check if ball landed back on moon surface
                if (distFromCenter <= ball.distance + ball.r / 2 && ball.vy > 0) {
                    // Ball landed back on moon
                    ball.isOnMoon = true;
                    ball.angle = Math.atan2(ball.y, ball.x) - game.moonRotation;
                    ball.vx = 0;
                    ball.vy = 0;
                    
                    // Check if landed near a platform
                    let nearPlatform = false;
                    for (let platform of game.platforms) {
                        const platformAngle = platform.angle;
                        let angleDiff = Math.abs(ball.angle - platformAngle);
                        // Handle angle wrapping
                        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                        
                        if (angleDiff < Math.PI / 8) { // Within platform range
                            nearPlatform = true;
                            setScore(prev => prev + 1);
                            break;
                        }
                    }
                }
                
                // Check if ball went too far from moon
                if (distFromCenter > canvas.width / 2) {
                    // Reset ball
                    ball.angle = 0;
                    ball.isOnMoon = true;
                    ball.vx = 0;
                    ball.vy = 0;
                    setScore(0);
                }
            }
            
            // Draw ball (blue sphere)
            ctx.fillStyle = '#38BDF8';
            ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.r / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Update rotation
            game.moonRotation += 0.002 + score * 0.0001;
            
            ctx.restore();
            
            game.animationId = requestAnimationFrame(gameLoop);
        }
        
        // Check if ball is on platform
        function isOnPlatform() {
            const ball = game.ball;
            
            for (let platform of game.platforms) {
                const px = platform.distance * Math.cos(platform.angle + game.moonRotation);
                const py = platform.distance * Math.sin(platform.angle + game.moonRotation);
                const dist = Math.sqrt((ball.x - px) ** 2 + ((ball.y + ball.r / 2) - py) ** 2);
                
                if (dist < ball.r && ball.vy >= 0) {
                    return true;
                }
            }
            return false;
        }
        
        // Jump function
        function jump() {
            if (isOnPlatform()) {
                game.ball.vy = game.jumpForce;
                setScore(prev => prev + 1);
            }
        }
        
        // Start game
        gameLoop();
        
        // Cleanup
        return () => {
            if (game.animationId) {
                cancelAnimationFrame(game.animationId);
            }
        };
    }, [gameStarted, score]);

    // Separate effect for event handling
    useEffect(() => {
        if (!gameStarted) return;
        
        const game = gameRef.current;
        
        // Movement and jump functions
        function jump() {
            const ball = game.ball;
            
            if (ball.isOnMoon) {
                // Launch ball tangentially from moon surface
                const totalAngle = ball.angle + game.moonRotation;
                
                // Calculate tangent direction (perpendicular to radius)
                const tangentAngle = totalAngle + Math.PI / 2;
                
                // Set initial velocity in tangent direction
                ball.vx = Math.cos(tangentAngle) * game.jumpForce;
                ball.vy = Math.sin(tangentAngle) * game.jumpForce;
                
                // Ball is now in flight
                ball.isOnMoon = false;
            }
        }
        
        function moveLeft() {
            const ball = game.ball;
            
            if (ball.isOnMoon) {
                // Move ball counter-clockwise around moon
                ball.angle -= 0.1;
            } else {
                // Add leftward velocity when in flight
                ball.vx -= 0.5;
            }
        }
        
        function moveRight() {
            const ball = game.ball;
            
            if (ball.isOnMoon) {
                // Move ball clockwise around moon
                ball.angle += 0.1;
            } else {
                // Add rightward velocity when in flight
                ball.vx += 0.5;
            }
        }
        
        function moveUp() {
            const ball = game.ball;
            
            if (!ball.isOnMoon) {
                // Add upward velocity when in flight
                ball.vy -= 0.5;
            } else {
                // Jump when on moon
                jump();
            }
        }
        
        function moveDown() {
            const ball = game.ball;
            
            if (!ball.isOnMoon) {
                // Add downward velocity when in flight
                ball.vy += 0.5;
            }
        }
        
        // Event listeners
        function handleKeyDown(e) {
            switch(e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    moveLeft();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moveRight();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    moveUp();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moveDown();
                    break;
                case 'Space':
                    e.preventDefault();
                    jump();
                    break;
            }
        }
        
        function handleClick(e) {
            e.preventDefault();
            jump();
        }
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('click', handleClick);
        
        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('click', handleClick);
        };
    }, [gameStarted]);

    const gameContainerStyle = {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a3a 0%, #0f0f1f 100%)',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif'
    };

    const canvasStyle = {
        display: 'block',
        cursor: 'pointer'
    };

    const scoreStyle = {
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: '#fff8aa',
        fontSize: '24px',
        fontWeight: 'bold',
        zIndex: 10
    };

    const instructionsStyle = {
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        textAlign: 'center',
        fontSize: '16px'
    };

    return (
        <div style={gameContainerStyle}>
            <canvas ref={canvasRef} style={canvasStyle} />
            <div style={scoreStyle}>Score: {score}</div>
            <div style={instructionsStyle}>
                Use arrow keys to move the blue ball! ← → to move around moon, ↑ to jump, ↓ for downward thrust. Press SPACEBAR or CLICK to jump!
            </div>
        </div>
    );
};

export default MoonJumperGame;
