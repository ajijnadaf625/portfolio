import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';

export default function Smote3D() {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [majorityCount, setMajorityCount] = useState(60);
  const [minorityCount, setMinorityCount] = useState(12);
  const [ratio, setRatio] = useState(20); // 12/60 = 20%
  const [stepIndex, setStepIndex] = useState(0);
  
  // 3D rotation state
  const [angleX, setAngleX] = useState(-0.4);
  const [angleY, setAngleY] = useState(0.5);
  const mouseRef = useRef({ isDown: false, x: 0, y: 0 });

  // Animation values
  const [activeLines, setActiveLines] = useState([]); // lines drawn between neighbors
  const [pulseData, setPulseData] = useState(null); // active sliding pulse

  // Set up static dataset
  const pointsRef = useRef({ majority: [], minority: [], synthetic: [] });
  if (pointsRef.current.majority.length === 0) {
    const majority = [];
    const minority = [];
    
    // Majority points in a large sphere on the right side
    for (let i = 0; i < 60; i++) {
      const radius = Math.random() * 70;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() - 0.5) * 2);
      majority.push({
        x: 50 + radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        label: 'majority'
      });
    }

    // Minority points in a small sphere on the left side (sparse)
    for (let i = 0; i < 12; i++) {
      const radius = Math.random() * 45;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() - 0.5) * 2);
      minority.push({
        x: -90 + radius * Math.sin(phi) * Math.cos(theta),
        y: -10 + radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        label: 'minority'
      });
    }

    pointsRef.current = { majority, minority, synthetic: [] };
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


  // Run SMOTE step-by-step oversampling animation
  const handleRunSMOTE = () => {
    if (running || minorityCount + pointsRef.current.synthetic.length >= majorityCount) return;
    setRunning(true);
    
    // Choose a random minority point
    const minPoints = pointsRef.current.minority;
    const baseIdx = Math.floor(Math.random() * minPoints.length);
    const basePoint = minPoints[baseIdx];

    // Find 3 Nearest Neighbors (in 3D Euclidean distance)
    const sortedNeighbors = minPoints
      .map((p, idx) => {
        if (idx === baseIdx) return { p, dist: Infinity };
        const dist = Math.sqrt((p.x - basePoint.x)**2 + (p.y - basePoint.y)**2 + (p.z - basePoint.z)**2);
        return { p, dist };
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)
      .map(item => item.p);

    // Set lines to highlight
    setActiveLines(sortedNeighbors.map(n => ({ from: basePoint, to: n })));
    
    // Pick one neighbor randomly to interpolate along
    const neighborPoint = sortedNeighbors[Math.floor(Math.random() * sortedNeighbors.length)];
    
    // Animate a pulse traversing from basePoint to neighborPoint
    let frame = 0;
    const totalFrames = 45;
    
    const animate = () => {
      if (frame >= totalFrames) {
        // Generate synthetic point at random interpolation ratio lambda (0 to 1)
        const lambda = Math.random();
        const synPoint = {
          x: basePoint.x + (neighborPoint.x - basePoint.x) * lambda,
          y: basePoint.y + (neighborPoint.y - basePoint.y) * lambda,
          z: basePoint.z + (neighborPoint.z - basePoint.z) * lambda,
          label: 'synthetic'
        };

        pointsRef.current.synthetic.push(synPoint);
        const newTotalMin = minorityCount + pointsRef.current.synthetic.length;
        setMinorityCount(newTotalMin);
        setRatio(Math.round((newTotalMin / majorityCount) * 100));
        setStepIndex(prev => prev + 1);

        setPulseData(null);
        setActiveLines([]);
        setRunning(false);
        return;
      }

      frame += 1;
      const progress = frame / totalFrames;
      setPulseData({
        x: basePoint.x + (neighborPoint.x - basePoint.x) * progress,
        y: basePoint.y + (neighborPoint.y - basePoint.y) * progress,
        z: basePoint.z + (neighborPoint.z - basePoint.z) * progress,
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  // Reset oversampling
  const handleReset = () => {
    if (running) return;
    pointsRef.current.synthetic = [];
    setMinorityCount(12);
    setRatio(20);
    setStepIndex(0);
    setPulseData(null);
    setActiveLines([]);
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

    // 3D coordinate geometry projection
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

    // Draw coordinate boundaries
    const drawLine3D = (x1, y1, z1, x2, y2, z2, color = isLight ? 'rgba(0, 0, 0, 0.06)' : 'var(--border-color)') => {
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

    // Grid box
    drawLine3D(-150, -100, -100, 150, -100, -100);
    drawLine3D(-150, 100, -100, 150, 100, -100);
    drawLine3D(-150, -100, 100, 150, -100, 100);
    drawLine3D(-150, 100, 100, 150, 100, 100);

    // Draw K-Nearest Neighbors links
    activeLines.forEach(line => {
      let from_y = rotateY3D(line.from.x, line.from.y, line.from.z, angleY);
      let from_x = rotateX3D(from_y.x, from_y.y, from_y.z, angleX);
      let pFrom = project(from_x.x, from_x.y, from_x.z);

      let to_y = rotateY3D(line.to.x, line.to.y, line.to.z, angleY);
      let to_x = rotateX3D(to_y.x, to_y.y, to_y.z, angleX);
      let pTo = project(to_x.x, to_x.y, to_x.z);

      ctx.beginPath();
      ctx.moveTo(pFrom.x, pFrom.y);
      ctx.lineTo(pTo.x, pTo.y);
      ctx.strokeStyle = `${primaryColor}, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Collate all points for painter sorting
    const allPoints = [
      ...pointsRef.current.majority,
      ...pointsRef.current.minority,
      ...pointsRef.current.synthetic
    ].map(p => {
      let r1 = rotateY3D(p.x, p.y, p.z, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let proj = project(r2.x, r2.y, r2.z);
      return { ...p, px: proj.x, py: proj.y, pscale: proj.scale, zDepth: r2.z };
    });

    // Painter sorting
    allPoints.sort((a, b) => b.zDepth - a.zDepth);

    // Draw data points
    allPoints.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.px, p.py, p.pscale * (p.label === 'majority' ? 3.5 : 4.5), 0, 2 * Math.PI);
      
      if (p.label === 'majority') {
        ctx.fillStyle = 'rgba(255, 82, 140, 0.6)';
        ctx.shadowBlur = 0;
      } else if (p.label === 'minority') {
        ctx.fillStyle = 'hsl(var(--primary))';
        ctx.shadowColor = 'hsl(var(--primary))';
        ctx.shadowBlur = 8;
      } else {
        // Synthetic node (slightly brighter/glowing green)
        ctx.fillStyle = 'hsl(var(--accent))';
        ctx.shadowColor = 'hsl(var(--accent))';
        ctx.shadowBlur = 12;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw animated oversampling pulse traveling
    if (pulseData) {
      let r1 = rotateY3D(pulseData.x, pulseData.y, pulseData.z, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let proj = project(r2.x, r2.y, r2.z);

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.scale * 7, 0, 2 * Math.PI);
      ctx.fillStyle = 'hsl(var(--text-primary))';
      ctx.shadowColor = 'hsl(var(--accent))';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

  }, [angleX, angleY, activeLines, pulseData, stepIndex]);

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
          <div style={styles.dragLabel}>Drag to Rotate SMOTE Cluster</div>
        </div>

        <div style={styles.sidebar}>
          <h3 style={styles.title}>SMOTE (Oversampling)</h3>
          <p style={styles.desc}>
            Balances highly skewed datasets. Selects a minority point, identifies its K-nearest neighbors, and generates synthetic samples along the line segments.
          </p>

          <div style={styles.metricsBox}>
            <div style={styles.metricRow}>
              <span>Majority (Red):</span>
              <strong>{majorityCount} samples</strong>
            </div>
            <div style={styles.metricRow}>
              <span>Minority (Blue/Green):</span>
              <strong style={styles.accentText}>{minorityCount} samples</strong>
            </div>
            <div style={styles.metricRow}>
              <span>Balance Ratio:</span>
              <strong style={ratio >= 100 ? styles.greenText : styles.violetText}>
                {ratio}% {ratio >= 100 && '(Balanced)'}
              </strong>
            </div>
          </div>

          <div style={styles.controlRow}>
            <button 
              onClick={handleRunSMOTE} 
              disabled={running || ratio >= 100}
              style={ratio >= 100 ? styles.btnDisabled : styles.btnPlay}
            >
              <Zap size={15} /> Synthesize Sample
            </button>
            <button onClick={handleReset} style={styles.btnReset}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>
          
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <span style={{...styles.colorCircle, backgroundColor: 'rgba(255, 82, 140, 0.7)'}}></span>
              <span>Majority Class</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{...styles.colorCircle, backgroundColor: 'hsl(var(--primary))'}}></span>
              <span>Minority Class</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{...styles.colorCircle, backgroundColor: 'hsl(var(--accent))'}}></span>
              <span>Synthetic Points</span>
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
    flexDirection: 'column',
    gap: '4px',
    fontSize: '0.78rem',
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
