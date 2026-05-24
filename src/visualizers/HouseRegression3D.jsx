import React, { useRef, useEffect, useState } from 'react';
import { Home, Sliders, Hash } from 'lucide-react';

export default function HouseRegression3D() {
  const canvasRef = useRef(null);
  const [area, setArea] = useState(2500); // 500 to 5000 sqft
  const [bedrooms, setBedrooms] = useState(3); // 1 to 5
  const [quality, setQuality] = useState(7); // 1 to 10 scale
  
  // 3D rotation angle
  const [angleX, setAngleX] = useState(-0.4);
  const [angleY, setAngleY] = useState(0.6);
  const mouseRef = useRef({ isDown: false, x: 0, y: 0 });

  // Generate house data points: { x (area), z (bedrooms), y (price) }
  const pointsRef = useRef([]);
  if (pointsRef.current.length === 0) {
    const points = [];
    for (let i = 0; i < 50; i++) {
      const a = 800 + Math.random() * 3800; // area
      const b = Math.round(1 + Math.random() * 4); // bedrooms
      const q = Math.round(3 + Math.random() * 6); // quality
      
      // Calculate realistic price + noise
      // Price = 110 * area + 30000 * bedrooms + 18000 * quality + noise
      const price = (110 * a + 30000 * b + 18000 * q + (Math.random() - 0.5) * 45000);
      
      // Map to normalized range [-100, 100] for 3D drawing
      // Area [500, 5000] -> [-100, 100]
      const nx = ((a - 500) / 4500) * 200 - 100;
      // Bedrooms [1, 5] -> [-100, 100]
      const nz = ((b - 1) / 4) * 200 - 100;
      // Price [50k, 700k] -> [-100, 100]
      const ny = ((price - 50000) / 650000) * 200 - 100;

      points.push({ nx, ny, nz, area: a, bedrooms: b, price });
    }
    pointsRef.current = points;
  }

  // Regression formula weights for prediction
  // Price = 110 * Area + 30000 * Bedrooms + 18000 * Quality + 5000
  const predictPrice = () => {
    return Math.round(110 * area + 30000 * bedrooms + 18000 * quality + 5000);
  };

  const priceVal = predictPrice();

  // Normalize current inputs to [-100, 100] bounds for tracking point
  const curNx = ((area - 500) / 4500) * 200 - 100;
  const curNz = ((bedrooms - 1) / 4) * 200 - 100;
  const curNy = ((priceVal - 50000) / 650000) * 200 - 100;

  // Drag to rotate
  const handleMouseDown = (e) => {
    mouseRef.current = { isDown: true, x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!mouseRef.current.isDown) return;
    const dx = e.clientX - mouseRef.current.x;
    const dy = e.clientY - mouseRef.current.y;
    setAngleY(prev => prev + dx * 0.007);
    setAngleX(prev => Math.max(-Math.PI/2, Math.min(Math.PI/2, prev + dy * 0.007)));
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  const handleMouseUpOrLeave = () => {
    mouseRef.current.isDown = false;
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      mouseRef.current = { isDown: true, x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    if (!mouseRef.current.isDown || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - mouseRef.current.x;
    const dy = e.touches[0].clientY - mouseRef.current.y;
    setAngleY(prev => prev + dx * 0.007);
    setAngleX(prev => Math.max(-Math.PI/2, Math.min(Math.PI/2, prev + dy * 0.007)));
    mouseRef.current.x = e.touches[0].clientX;
    mouseRef.current.y = e.touches[0].clientY;
  };


  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isLight = document.body.classList.contains('light-theme');
    const primaryColor = isLight ? 'rgba(0, 135, 163' : 'rgba(0, 240, 255';
    const secondaryColor = isLight ? 'rgba(106, 36, 227' : 'rgba(140, 82, 255';
    const accentColor = isLight ? 'rgba(21, 128, 61' : 'rgba(0, 255, 108';
    
    const width = canvas.width;
    const height = canvas.height;

    // 3D coordinate geometry calculations
    const rotateX3D = (x, y, z, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { x, y: y * cos - z * sin, z: y * sin + z * cos };
    };

    const rotateY3D = (x, y, z, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { x: x * cos + z * sin, y, z: -x * sin + z * cos };
    };

    const project = (x, y, z) => {
      const fov = 400;
      const cameraDistance = 350;
      const scale = fov / (cameraDistance + z);
      return {
        x: width / 2 + x * scale,
        y: height / 2 + y * scale,
        scale
      };
    };

    ctx.clearRect(0, 0, width, height);

    // Draw coordinate grid boundaries (Y is price vertical inverted, X area left-right, Z beds front-back)
    const drawLine3D = (x1, y1, z1, x2, y2, z2, color = 'var(--progress-track)', widthVal = 1) => {
      let r1_1 = rotateY3D(x1, y1, z1, angleY);
      let r1_2 = rotateX3D(r1_1.x, r1_1.y, r1_1.z, angleX);
      let p1 = project(r1_2.x, r1_2.y, r1_2.z);

      let r2_1 = rotateY3D(x2, y2, z2, angleY);
      let r2_2 = rotateX3D(r2_1.x, r2_1.y, r2_1.z, angleX);
      let p2 = project(r2_2.x, r2_2.y, r2_2.z);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = widthVal;
      ctx.stroke();
    };

    // Draw boundary cage axes
    drawLine3D(-100, -100, -100, 100, -100, -100);
    drawLine3D(-100, -100, -100, -100, 100, -100);
    drawLine3D(-100, -100, -100, -100, -100, 100);
    
    drawLine3D(100, 100, 100, -100, 100, 100);
    drawLine3D(100, 100, 100, 100, -100, 100);
    drawLine3D(100, 100, 100, 100, 100, -100);

    // Draw labels at axes extremities
    const drawLabel3D = (text, x, y, z, color = 'hsl(var(--text-muted))') => {
      let r1 = rotateY3D(x, y, z, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let proj = project(r2.x, r2.y, r2.z);

      ctx.fillStyle = color;
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, proj.x, proj.y);
    };

    drawLabel3D("Area (Sq Ft)", 120, 100, 100);
    drawLabel3D("Bedrooms", -100, 100, 120);
    drawLabel3D("Price (High)", -100, -110, -100);

    // Draw Best-Fit Regression Plane (plane representing predictions for Area (X) and Bedrooms (Z))
    // We solve the corners of the regression plane at X=[-100, 100] and Z=[-100, 100]
    // Quality value scales the plane y position directly
    const planeCorners = [
      { x: -100, z: -100 },
      { x: 100, z: -100 },
      { x: 100, z: 100 },
      { x: -100, z: 100 }
    ].map(c => {
      // Area value from -100 to 100 => area scale from 500 to 5000
      const aVal = ((c.x + 100) / 200) * 4500 + 500;
      // Bedrooms value from -100 to 100 => bedrooms scale from 1 to 5
      const bVal = ((c.z + 100) / 200) * 4 + 1;
      
      const pred = 110 * aVal + 30000 * bVal + 18000 * quality + 5000;
      const yVal = ((pred - 50000) / 650000) * 200 - 100;

      let r1 = rotateY3D(c.x, yVal, c.z, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let proj = project(r2.x, r2.y, r2.z);
      return { px: proj.x, py: proj.y, zDepth: r2.z };
    });

    // Draw plane fill
    ctx.beginPath();
    ctx.moveTo(planeCorners[0].px, planeCorners[0].py);
    planeCorners.forEach(c => ctx.lineTo(c.px, c.py));
    ctx.closePath();
    ctx.fillStyle = `${secondaryColor}, 0.15)`;
    ctx.fill();
    ctx.strokeStyle = `${secondaryColor}, 0.5)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Map dataset points
    const transformedPoints = pointsRef.current.map(p => {
      let r1 = rotateY3D(p.nx, p.ny, p.nz, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let proj = project(r2.x, r2.y, r2.z);
      return { ...p, px: proj.x, py: proj.y, pscale: proj.scale, zDepth: r2.z };
    });

    // Sort database nodes painter's sorting
    transformedPoints.sort((a, b) => b.zDepth - a.zDepth);

    // Draw scatter points
    transformedPoints.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.px, p.py, p.pscale * 3, 0, 2 * Math.PI);
      ctx.fillStyle = 'hsl(var(--text-muted))';
      ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      ctx.fill();
      ctx.stroke();
    });

    // Draw current prediction coordinate tracking dot (marker)
    let curR1 = rotateY3D(curNx, curNy, curNz, angleY);
    let curR2 = rotateX3D(curR1.x, curR1.y, curR1.z, angleX);
    let projMarker = project(curR2.x, curR2.y, curR2.z);

    // Draw crosshair axes project lines from active marker
    // project to bottom (y=100)
    drawLine3D(curNx, curNy, curNz, curNx, 100, curNz, `${primaryColor}, 0.3)`, 1);
    // project to X plane wall
    drawLine3D(curNx, curNy, curNz, -100, curNy, curNz, `${primaryColor}, 0.3)`, 1);
    // project to Z plane wall
    drawLine3D(curNx, curNy, curNz, curNx, curNy, 100, `${primaryColor}, 0.3)`, 1);

    // Render prediction marker
    ctx.beginPath();
    ctx.arc(projMarker.x, projMarker.y, projMarker.scale * 6.5, 0, 2 * Math.PI);
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.strokeStyle = 'hsl(var(--text-primary))';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'hsl(var(--primary))';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

  }, [angleX, angleY, area, bedrooms, quality]);

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div style={styles.container}>
      <div style={styles.visualizerArea}>
        
        <div style={styles.canvasWrapper}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
        >
          <canvas 
            ref={canvasRef} 
            width={450} 
            height={320} 
            style={styles.canvas} 
          />
          <div style={styles.dragLabel}>Drag to Rotate Regression Plane</div>
        </div>

        <div style={styles.sidebar}>
          <h3 style={styles.title}>House Price Regression</h3>
          <p style={styles.desc}>
            Multiple linear regression models multivariate data. Slide area & room details to witness the prediction marker slide on the 3D regression boundary plane.
          </p>

          <div style={styles.slidersContainer}>
            <div style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span>Area Size:</span>
                <strong>{area} Sq Ft</strong>
              </div>
              <input 
                type="range" 
                min="500" max="5000" step="50"
                value={area} 
                onChange={(e) => setArea(parseInt(e.target.value))}
                style={styles.slider}
              />
            </div>
            
            <div style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span>Bedrooms:</span>
                <strong>{bedrooms} BHK</strong>
              </div>
              <input 
                type="range" 
                min="1" max="5" step="1"
                value={bedrooms} 
                onChange={(e) => setBedrooms(parseInt(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span>Construction Quality:</span>
                <strong>{quality}/10</strong>
              </div>
              <input 
                type="range" 
                min="1" max="10" step="1"
                value={quality} 
                onChange={(e) => setQuality(parseInt(e.target.value))}
                style={styles.slider}
              />
            </div>
          </div>

          <div style={styles.metricsBox}>
            <div style={styles.metricRow}>
              <span>Predicted Price (Est.):</span>
              <strong style={styles.accentTextGlow}>{formatCurrency(priceVal)}</strong>
            </div>
            <div style={styles.equationRow}>
              Price &asymp; Area &times; 110 + Beds &times; 30k + Quality &times; 18k
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    padding: '8px',
  },
  visualizerArea: {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  canvasWrapper: {
    position: 'relative',
    border: '1px solid rgba(128,128,128,0.1)',
    borderRadius: '12px',
    backgroundColor: 'hsl(var(--bg-card))',
    cursor: 'grab',
    overflow: 'hidden',
  },
  canvas: {
    display: 'block',
  },
  dragLabel: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    fontSize: '11px',
    color: 'hsl(var(--text-muted))',
    pointerEvents: 'none',
  },
  sidebar: {
    flex: '1',
    minWidth: '260px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  desc: {
    fontSize: '0.85rem',
    color: 'hsl(var(--text-secondary))',
    lineHeight: '1.4'
  },
  slidersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    color: 'hsl(var(--text-secondary))'
  },
  slider: {
    width: '100%',
    WebkitAppearance: 'none',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: 'var(--progress-track)',
    outline: 'none',
    cursor: 'pointer',
    accentColor: 'hsl(var(--primary))'
  },
  metricsBox: {
    backgroundColor: 'var(--progress-track)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: 'hsl(var(--text-secondary))'
  },
  accentTextGlow: {
    color: 'hsl(var(--primary))',
    fontSize: '1.1rem',
    textShadow: '0 0 10px rgba(0, 240, 255, 0.4)'
  },
  equationRow: {
    fontSize: '0.72rem',
    color: 'hsl(var(--text-muted))',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '6px',
    marginTop: '4px',
    fontFamily: 'monospace'
  }
};
