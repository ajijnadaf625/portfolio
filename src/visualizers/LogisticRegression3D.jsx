import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, HelpCircle } from 'lucide-react';

export default function LogisticRegression3D() {
  const canvasRef = useRef(null);
  const [training, setTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [accuracy, setAccuracy] = useState(65);
  const [cost, setCost] = useState(0.85);
  
  // 3D rotations state
  const [angleX, setAngleX] = useState(-0.5);
  const [angleY, setAngleY] = useState(0.6);
  const mouseRef = useRef({ isDown: false, x: 0, y: 0 });
  
  // Model weights (representing plane: w1*x + w2*y + w3*z + b = 0)
  const weightsRef = useRef({ w1: 0.1, w2: 0.8, w3: -0.3, b: 0 });
  const targetWeights = { w1: 0.6, w2: -0.7, w3: 0.5, b: 0.1 }; // Separates points nicely

  // Generate 3D scatter points
  const pointsRef = useRef([]);
  if (pointsRef.current.length === 0) {
    const points = [];
    for (let i = 0; i < 80; i++) {
      // X, Y, Z in range [-100, 100]
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      
      // Determine actual class based on targetWeights
      const val = targetWeights.w1 * x + targetWeights.w2 * y + targetWeights.w3 * z + targetWeights.b * 100;
      const label = val >= 0 ? 1 : 0;
      
      // Add slight noise to make it realistic
      const noise = (Math.random() - 0.5) * 40;
      const finalLabel = (val + noise) >= 0 ? 1 : 0;
      
      points.push({ x, y, z, label });
    }
    pointsRef.current = points;
  }

  // Handle Drag to Rotate
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


  // Start/Reset Training Simulation
  const handleTrain = () => {
    if (training) return;
    setTraining(true);
    setEpoch(0);
  };

  const handleReset = () => {
    setTraining(false);
    setEpoch(0);
    setAccuracy(65);
    setCost(0.85);
    weightsRef.current = { w1: 0.1, w2: 0.8, w3: -0.3, b: 0 };
  };

  // Model update loop
  useEffect(() => {
    if (!training) return;
    let frameId;
    let curEpoch = epoch;
    
    const update = () => {
      if (curEpoch >= 100) {
        setTraining(false);
        return;
      }
      curEpoch += 1;
      setEpoch(curEpoch);
      
      // Gradient descent step interpolation
      const alpha = curEpoch / 100;
      weightsRef.current = {
        w1: 0.1 + (targetWeights.w1 - 0.1) * alpha,
        w2: 0.8 + (targetWeights.w2 - 0.8) * alpha,
        w3: -0.3 + (targetWeights.w3 - (-0.3)) * alpha,
        b: 0 + (targetWeights.b) * alpha,
      };

      // Cost and Accuracy functions
      setCost(parseFloat((0.85 - 0.70 * alpha + Math.random() * 0.02).toFixed(3)));
      setAccuracy(Math.min(98, Math.round(65 + 33 * alpha)));

      frameId = setTimeout(update, 60);
    };
    
    frameId = setTimeout(update, 60);
    return () => clearTimeout(frameId);
  }, [training]);

  // Main Canvas Render loop
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
    
    // Projection Helpers
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

    // Draw grid bounds
    ctx.strokeStyle = 'var(--progress-track)';
    ctx.lineWidth = 1;
    const bounds = [-100, 100];
    
    // Pre-calculate point positions
    const transformedPoints = pointsRef.current.map(p => {
      let r1 = rotateY3D(p.x, p.y, p.z, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let proj = project(r2.x, r2.y, r2.z);
      return { ...p, px: proj.x, py: proj.y, pscale: proj.scale, zDepth: r2.z };
    });

    // Draw axes
    const axes = [
      { x: -120, y: 0, z: 0, label: 'X (Feature 1)' },
      { x: 0, y: -120, z: 0, label: 'Y (Feature 2)' },
      { x: 0, y: 0, z: -120, label: 'Z (Feature 3)' }
    ];
    
    axes.forEach(axis => {
      let r1 = rotateY3D(axis.x, axis.y, axis.z, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let center = project(0, 0, 0);
      let tip = project(r2.x, r2.y, r2.z);

      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.strokeStyle = `${primaryColor}, 0.4)`;
      ctx.stroke();

      ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255,255,255,0.5)';
      ctx.font = '10px sans-serif';
      ctx.fillText(axis.label, tip.x + 5, tip.y + 5);
    });

    // Draw dividing Decision Boundary Plane
    const { w1, w2, w3, b } = weightsRef.current;
    // Solve plane w1*x + w2*y + w3*z + b = 0 inside [-100, 100] box
    // Define 4 corner points of plane
    const corners = [
      { x: -100, z: -100 },
      { x: 100, z: -100 },
      { x: 100, z: 100 },
      { x: -100, z: 100 }
    ].map(c => {
      // w1*x + w2*y + w3*z + b = 0 => y = -(w1*x + w3*z + b) / w2
      let y = 0;
      if (Math.abs(w2) > 0.0001) {
        y = -(w1 * c.x + w3 * c.z + b * 100) / w2;
      }
      // clamp y to window
      y = Math.max(-100, Math.min(100, y));

      let r1 = rotateY3D(c.x, y, c.z, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let proj = project(r2.x, r2.y, r2.z);
      return { px: proj.x, py: proj.y, zDepth: r2.z };
    });

    // Draw Plane
    ctx.beginPath();
    ctx.moveTo(corners[0].px, corners[0].py);
    corners.forEach(c => ctx.lineTo(c.px, c.py));
    ctx.closePath();
    ctx.fillStyle = `${primaryColor}, 0.15)`;
    ctx.fill();
    ctx.strokeStyle = `${primaryColor}, 0.7)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sort points by zDepth to render back-to-front (painter's algorithm)
    transformedPoints.sort((a, b) => b.zDepth - a.zDepth);

    // Draw Data Points
    transformedPoints.forEach(p => {
      ctx.beginPath();
      // Draw shadow circle
      ctx.arc(p.px, p.py, Math.max(1, p.pscale * 4), 0, 2 * Math.PI);
      
      // Determine prediction with current weights
      const val = w1 * p.x + w2 * p.y + w3 * p.z + b * 100;
      const pred = val >= 0 ? 1 : 0;
      const isCorrect = pred === p.label;

      if (p.label === 1) {
        ctx.fillStyle = isCorrect ? `${primaryColor}, 0.85)` : `${primaryColor}, 0.3)`;
        ctx.shadowColor = `${primaryColor}, 0.5)`;
      } else {
        ctx.fillStyle = isCorrect ? 'rgba(255, 82, 140, 0.85)' : 'rgba(255, 82, 140, 0.3)';
        ctx.shadowColor = 'rgba(255, 82, 140, 0.5)';
      }
      
      if (isCorrect) {
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    });

  }, [angleX, angleY, epoch, training]);

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
          <div style={styles.dragLabel}>Drag to Rotate 3D Space</div>
        </div>

        <div style={styles.sidebar}>
          <h3 style={styles.title}>Logistic Regression</h3>
          <p style={styles.desc}>
            Watch the decision boundary hyper-plane optimize in real time as weights converge using gradient descent.
          </p>
          
          <div style={styles.metricsBox}>
            <div style={styles.metricRow}>
              <span>Epoch:</span>
              <strong style={styles.accentText}>{epoch} / 100</strong>
            </div>
            <div style={styles.metricRow}>
              <span>Loss (Cross-Entropy):</span>
              <strong style={styles.violetText}>{cost.toFixed(3)}</strong>
            </div>
            <div style={styles.metricRow}>
              <span>Accuracy:</span>
              <strong style={styles.greenText}>{accuracy}%</strong>
            </div>
          </div>

          <div style={styles.controlRow}>
            <button 
              onClick={handleTrain} 
              disabled={training || epoch >= 100}
              style={epoch >= 100 ? styles.btnDisabled : styles.btnPlay}
            >
              <Play size={15} /> Train Model
            </button>
            <button onClick={handleReset} style={styles.btnReset}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>
          
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <span style={{...styles.colorCircle, backgroundColor: 'hsl(var(--primary))'}}></span>
              <span>Class A (Positive)</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{...styles.colorCircle, backgroundColor: '#ff528c'}}></span>
              <span>Class B (Negative)</span>
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
  metricsBox: {
    backgroundColor: 'var(--progress-track)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'hsl(var(--text-secondary))'
  },
  accentText: {
    color: 'hsl(var(--primary))'
  },
  violetText: {
    color: 'hsl(var(--secondary))'
  },
  greenText: {
    color: 'hsl(var(--accent))'
  },
  controlRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  btnPlay: {
    flex: '2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: 'hsl(var(--primary))',
    color: 'var(--btn-text)',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif"
  },
  btnDisabled: {
    flex: '2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: 'var(--progress-track)',
    color: 'hsl(var(--text-muted))',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'not-allowed',
    fontFamily: "'Outfit', sans-serif"
  },
  btnReset: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: 'transparent',
    color: 'hsl(var(--text-primary))',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '8px 12px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif"
  },
  legend: {
    display: 'flex',
    gap: '12px',
    fontSize: '0.8rem',
    color: 'hsl(var(--text-muted))',
    marginTop: '6px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  colorCircle: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block'
  }
};
