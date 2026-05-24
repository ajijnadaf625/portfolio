import React, { useRef, useEffect, useState } from 'react';
import { Plus, RotateCcw, TrendingDown } from 'lucide-react';

export default function XGBoost3D() {
  const canvasRef = useRef(null);
  const [treeCount, setTreeCount] = useState(0); // 0 (base), 1, 2, 3 trees
  const [animating, setAnimating] = useState(false);
  const [mseHistory, setMseHistory] = useState([0.72]);
  
  // 3D rotation state
  const [angleX, setAngleX] = useState(-0.4);
  const [angleY, setAngleY] = useState(0.8);
  const mouseRef = useRef({ isDown: false, x: 0, y: 0 });

  // Generate random regression data points: { x, target, residuals_by_tree: [r0, r1, r2, r3] }
  const pointsRef = useRef([]);
  if (pointsRef.current.length === 0) {
    const points = [];
    for (let i = 0; i < 60; i++) {
      // 3D point variables
      const x = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      
      // Target function: a curved surface y = sin(x/50)*cos(z/50)*80 + noise
      const target = Math.sin(x / 50) * Math.cos(z / 50) * 80 + (Math.random() - 0.5) * 15;
      
      // Calculate boosting step residuals
      const pred0 = 0; // Base model (average)
      const res0 = target - pred0;

      // Tree 1 predicts res0 roughly
      const predTree1 = Math.sin(x / 50) * Math.cos(z / 50) * 45;
      const res1 = res0 - predTree1;

      // Tree 2 predicts res1 roughly
      const predTree2 = Math.sin(x / 50) * Math.cos(z / 50) * 23;
      const res2 = res1 - predTree2;

      // Tree 3 predicts res2 roughly
      const predTree3 = Math.sin(x / 50) * Math.cos(z / 50) * 10;
      const res3 = res2 - predTree3;

      points.push({
        x, z,
        yVals: [res0, res1, res2, res3], // y values (residuals) at each booster stage
        currentY: res0 // currently rendered y
      });
    }
    pointsRef.current = points;
  }

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


  // Add a booster tree to watch residuals shrink
  const handleAddTree = () => {
    if (treeCount >= 3 || animating) return;
    setAnimating(true);
    
    const nextTree = treeCount + 1;
    const points = pointsRef.current;
    let frame = 0;
    const totalFrames = 30;

    const animateTransition = () => {
      if (frame >= totalFrames) {
        points.forEach(p => {
          p.currentY = p.yVals[nextTree];
        });
        setTreeCount(nextTree);
        
        // Add to MSE history
        const mseValues = [0.72, 0.35, 0.16, 0.04];
        setMseHistory(prev => [...prev, mseValues[nextTree]]);
        setAnimating(false);
        return;
      }

      frame += 1;
      const progress = frame / totalFrames;
      // Interpolate points towards next residual value
      points.forEach(p => {
        const startY = p.yVals[treeCount];
        const endY = p.yVals[nextTree];
        p.currentY = startY + (endY - startY) * progress;
      });

      // trigger state render
      setTreeCount(treeCount + progress); 
      requestAnimationFrame(animateTransition);
    };

    requestAnimationFrame(animateTransition);
  };

  // Reset training
  const handleReset = () => {
    if (animating) return;
    pointsRef.current.forEach(p => {
      p.currentY = p.yVals[0];
    });
    setTreeCount(0);
    setMseHistory([0.72]);
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

    // 3D projections
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

    // Draw central zero planes (ideal residual = 0)
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    
    // Draw bounding box
    const drawLine3D = (x1, y1, z1, x2, y2, z2, color = 'var(--progress-track)') => {
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
      ctx.stroke();
    };

    // Draw central 3D wireframe plane
    for (let i = -100; i <= 100; i += 50) {
      drawLine3D(-100, 0, i, 100, 0, i);
      drawLine3D(i, 0, -100, i, 0, 100);
    }
    
    // Draw boundary box corners
    drawLine3D(-100, -100, -100, -100, 100, -100);
    drawLine3D(100, -100, -100, 100, 100, -100);
    drawLine3D(-100, -100, 100, -100, 100, 100);
    drawLine3D(100, -100, 100, 100, 100, 100);

    // Project points
    const transformedPoints = pointsRef.current.map(p => {
      let r1 = rotateY3D(p.x, p.currentY, p.z, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let proj = project(r2.x, r2.y, r2.z);
      return { ...p, px: proj.x, py: proj.y, pscale: proj.scale, zDepth: r2.z };
    });

    // Painter's algorithm
    transformedPoints.sort((a, b) => b.zDepth - a.zDepth);

    // Draw lines connecting points to zero plane (errors)
    transformedPoints.forEach(p => {
      let r1_0 = rotateY3D(p.x, 0, p.z, angleY);
      let r2_0 = rotateX3D(r1_0.x, r1_0.y, r1_0.z, angleX);
      let p0 = project(r2_0.x, r2_0.y, r2_0.z);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p.px, p.py);
      ctx.strokeStyle = 'rgba(255, 82, 140, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw Points
    transformedPoints.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.px, p.py, Math.max(1.5, p.pscale * 4), 0, 2 * Math.PI);
      
      // The closer the residual is to 0, the more cyan/green it gets, otherwise red/pink
      const errRatio = Math.min(1, Math.abs(p.currentY) / 80);
      const r = Math.round(255 * errRatio + 0 * (1 - errRatio));
      const g = Math.round(82 * errRatio + 240 * (1 - errRatio));
      const b = Math.round(140 * errRatio + 255 * (1 - errRatio));
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
      ctx.shadowBlur = errRatio < 0.2 ? 8 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

  }, [angleX, angleY, treeCount]);

  const displayCount = Math.round(treeCount);

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
          <div style={styles.stageIndicator}>
            Stage: {displayCount === 0 ? 'Initial Residuals' : `Booster Tree ${displayCount}`}
          </div>
          <div style={styles.dragLabel}>Drag to Rotate Residual Space</div>
        </div>

        <div style={styles.sidebar}>
          <h3 style={styles.title}>XGBoost Gradient Boosting</h3>
          <p style={styles.desc}>
            Watch residuals (errors) shrink sequentially. Each tree models the remaining errors of its predecessor, multiplied by the learning rate (&eta; = 0.3).
          </p>

          <div style={styles.metricsBox}>
            <div style={styles.metricRow}>
              <span>Booster Trees:</span>
              <strong style={styles.accentText}>{displayCount} / 3</strong>
            </div>
            <div style={styles.metricRow}>
              <span>Residual MSE:</span>
              <strong style={styles.pinkText}>
                {mseHistory[mseHistory.length - 1].toFixed(2)}
              </strong>
            </div>
          </div>

          <div style={styles.controlRow}>
            <button 
              onClick={handleAddTree} 
              disabled={displayCount >= 3 || animating}
              style={displayCount >= 3 ? styles.btnDisabled : styles.btnPlay}
            >
              <Plus size={15} /> Add Booster Tree
            </button>
            <button onClick={handleReset} style={styles.btnReset}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>

          <div style={styles.learningCurveBox}>
            <div style={styles.curveHeader}>
              <TrendingDown size={14} style={{marginRight: '4px'}} /> Learning Curve (MSE)
            </div>
            <div style={styles.curveChart}>
              {mseHistory.map((val, idx) => {
                const height = (val / 0.72) * 45; // scale to 45px
                return (
                  <div key={idx} style={styles.chartCol}>
                    <div style={{...styles.chartBar, height: `${height}px`}}></div>
                    <div style={styles.chartLabel}>T{idx}</div>
                  </div>
                );
              })}
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
  stageIndicator: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(5, 8, 20, 0.75)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '4px 12px',
    fontSize: '11px',
    color: 'hsl(var(--primary))',
    fontWeight: '600'
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
  pinkText: {
    color: '#ff528c'
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
  learningCurveBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  curveHeader: {
    fontSize: '0.78rem',
    color: 'hsl(var(--text-muted))',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center'
  },
  curveChart: {
    height: '60px',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    paddingLeft: '10px'
  },
  chartCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  chartBar: {
    width: '18px',
    backgroundColor: 'hsl(var(--secondary))',
    borderRadius: '3px 3px 0 0',
    boxShadow: '0 0 8px rgba(140, 82, 255, 0.4)',
    transition: 'height 0.4s ease'
  },
  chartLabel: {
    fontSize: '8px',
    color: 'hsl(var(--text-muted))'
  }
};
