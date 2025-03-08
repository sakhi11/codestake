
import { useEffect, useRef } from "react";

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground = ({ className }: AnimatedBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create nodes
    class Node {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      pulseSpeed: number;
      pulseSize: number;
      maxSize: number;
      minSize: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.maxSize = this.size + 1;
        this.minSize = this.size - 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        // Create a mix of blue and orange nodes to match the app theme
        this.color = Math.random() > 0.7 
          ? `rgba(248, 161, 0, ${Math.random() * 0.5 + 0.2})` // Orange nodes (30%)
          : `rgba(74, 144, 226, ${Math.random() * 0.5 + 0.2})`; // Blue nodes (70%)
        this.pulseSpeed = 0.02 + Math.random() * 0.02;
        this.pulseSize = this.minSize;
      }

      update() {
        // Update position
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) {
          this.speedX = -this.speedX;
        }

        if (this.y < 0 || this.y > canvas.height) {
          this.speedY = -this.speedY;
        }

        // Pulse size effect
        this.pulseSize += this.pulseSpeed;
        if (this.pulseSize > 1 || this.pulseSize < 0) {
          this.pulseSpeed = -this.pulseSpeed;
        }
        
        // Calculate current size based on pulse
        this.size = this.minSize + (this.maxSize - this.minSize) * Math.abs(Math.sin(this.pulseSize));
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const nodes: Node[] = [];
    const nodeCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 12000));

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node());
    }

    const connectNodes = (node1: Node, node2: Node) => {
      const dx = node1.x - node2.x;
      const dy = node1.y - node2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const maxDistance = 180;
      if (distance < maxDistance) {
        ctx.beginPath();
        // Use the color of the first node for the connection
        const opacity = 0.15 * (1 - distance / maxDistance);
        ctx.strokeStyle = node1.color.replace(/[\d\.]+\)$/, `${opacity})`);
        ctx.lineWidth = 0.5;
        ctx.moveTo(node1.x, node1.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.stroke();
      }
    };

    // Create a subtle moving wave effect
    const drawWaves = (timestamp: number) => {
      const height = canvas.height;
      const width = canvas.width;
      
      ctx.beginPath();
      ctx.strokeStyle = "rgba(74, 144, 226, 0.05)";
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        let waveHeight = 50 + i * 20;
        
        for (let x = 0; x < width; x += 5) {
          const y = height / 2 + 
                    Math.sin(x * 0.01 + timestamp * 0.001 + i) * waveHeight + 
                    Math.sin(x * 0.02 - timestamp * 0.0015) * (waveHeight / 2);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      }
    };

    let animationFrameId: number;
    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid pattern
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 0.5;
      
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw waves
      drawWaves(timestamp);

      // Update and draw nodes
      for (const node of nodes) {
        node.update();
        node.draw();

        for (const otherNode of nodes) {
          if (node !== otherNode) {
            connectNodes(node, otherNode);
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full -z-10 ${className || ""}`}
    />
  );
};

export default AnimatedBackground;
