import React, { useRef, useEffect } from 'react';
import { ArrowRight, Cpu, Database, Award } from 'lucide-react';

export default function Hero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class definition
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
        this.colorType = Math.random() > 0.5 ? 'primary' : 'secondary';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on boundaries
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }

      draw(isLight) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const primaryColor = isLight ? 'rgba(0, 135, 163, 0.4)' : 'rgba(0, 240, 255, 0.4)';
        const secondaryColor = isLight ? 'rgba(106, 36, 227, 0.3)' : 'rgba(140, 82, 255, 0.3)';
        ctx.fillStyle = this.colorType === 'primary' ? primaryColor : secondaryColor;
        ctx.fill();
      }
    }

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 35 : 70;
    const particles = Array.from({ length: particleCount }, () => new Particle());

    // Mouse coordinates tracker
    let mouse = { x: null, y: null, radius: 150 };
    
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Render loop
    const render = () => {
      // Pause drawing if scrolled out of view to save CPU/battery
      if (window.scrollY > window.innerHeight) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      
      const isLight = document.body.classList.contains('light-theme');
      const primaryRgb = isLight ? '0, 135, 163' : '0, 240, 255';
      const secondaryRgb = isLight ? '106, 36, 227' : '140, 82, 255';
      
      // Draw background space mesh connections
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(isLight);

        // Connect particles within proximity
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${primaryRgb}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Draw connections to cursor
        if (mouse.x !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${secondaryRgb}, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanups
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" style={styles.heroSection}>
      <canvas ref={canvasRef} style={styles.backgroundCanvas} />
      
      <div className="container" style={styles.container}>
        <div className="hero-layout-grid">
          {/* Introduction Details */}
          <div style={styles.introCard} className={window.innerWidth < 768 ? "" : "floating"}>
            <div style={styles.statusBadge}>
              <Cpu size={14} color="currentColor" style={{ color: 'hsl(var(--primary))' }} />
              <span>Available for Data Analyst & ML Roles</span>
            </div>
            
            <h1 style={{ ...styles.mainTitle, fontSize: 'clamp(2.5rem, 8vw, 4.5rem)' }}>
              Ajij Nadaf
            </h1>
            
            <h2 style={{ ...styles.subTitle, fontSize: 'clamp(1.2rem, 4vw, 2rem)' }}>
              AI/ML Engineer & <span className="gradient-text">Data Science Analyst</span>
            </h2>

            <p style={styles.description}>
              Results-driven Data Analyst and MCA Graduate specializing in Python, SQL, computer vision, and machine learning models. Expert in exploratory data analysis (EDA), interactive dashboard development, and constructing intelligent predictive systems.
            </p>

            <div style={styles.buttonsRow}>
              <button 
                onClick={() => scrollToSection('sandbox')} 
                className="btn-primary"
              >
                Launch 3D Sandbox <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => scrollToSection('projects')} 
                className="btn-secondary"
              >
                View Projects
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div style={styles.metricsColumn}>
            <div style={styles.metricCard} className="glass-panel-glow">
              <Database size={24} color="currentColor" style={{ color: 'hsl(var(--primary))' }} />
              <div style={styles.metricDetails}>
                <div style={styles.metricVal}>Python & SQL</div>
                <div style={styles.metricLabel}>Primary Core Tech Stack</div>
              </div>
            </div>

            <div style={styles.metricCard} className="glass-panel-glow">
              <Cpu size={24} color="currentColor" style={{ color: 'hsl(var(--secondary))' }} />
              <div style={styles.metricDetails}>
                <div style={styles.metricVal}>Machine Learning</div>
                <div style={styles.metricLabel}>Regression, Forests, Vision</div>
              </div>
            </div>

            <div style={styles.metricCard} className="glass-panel-glow">
              <Award size={24} color="currentColor" style={{ color: 'hsl(var(--accent))' }} />
              <div style={styles.metricDetails}>
                <div style={styles.metricVal}>SevenMentor Intern</div>
                <div style={styles.metricLabel}>Expense Tracker & Power BI Dashboards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  heroSection: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'hsl(var(--bg-deep))',
    overflow: 'hidden',
    padding: '100px 0 60px 0',
  },
  backgroundCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none'
  },
  container: {
    position: 'relative',
    zIndex: 2,
    width: '100%'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '40px',
    alignItems: 'center',
    // override responsive via global index.css rules
  },
  introCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  statusBadge: {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--badge-bg)',
    border: '1px solid var(--badge-border)',
    borderRadius: '30px',
    padding: '6px 16px',
    fontSize: '0.8rem',
    fontWeight: '500',
    color: 'hsl(var(--primary))',
  },
  mainTitle: {
    fontSize: '4.5rem',
    fontWeight: '800',
    lineHeight: '1.1',
    letterSpacing: '-0.03em',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  subTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  description: {
    fontSize: '1.05rem',
    color: 'hsl(var(--text-secondary))',
    lineHeight: '1.6',
    maxWidth: '560px'
  },
  buttonsRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '10px',
    flexWrap: 'wrap'
  },
  metricsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px',
    borderRadius: '16px',
  },
  metricDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  metricVal: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  metricLabel: {
    fontSize: '0.8rem',
    color: 'hsl(var(--text-muted))'
  }
};
// Responsive styling matches in index.css
