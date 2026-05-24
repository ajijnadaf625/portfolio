import React, { useRef, useEffect, useState } from 'react';
import { Camera, Scan, ShieldCheck, CheckCircle } from 'lucide-react';

// Define vertices for a simple 3D wireframe face mask
const faceVertices = [
  // Eyebrows
  { x: -50, y: -60, z: 20 }, { x: -20, y: -65, z: 30 }, { x: 0, y: -60, z: 35 }, { x: 20, y: -65, z: 30 }, { x: 50, y: -60, z: 20 },
  // Eyes
  { x: -35, y: -45, z: 25 }, { x: -15, y: -45, z: 28 }, { x: 15, y: -45, z: 28 }, { x: 35, y: -45, z: 25 },
  // Nose bridge and tip
  { x: 0, y: -40, z: 38 }, { x: 0, y: -15, z: 42 }, { x: 0, y: 5, z: 50 }, { x: -15, y: 10, z: 38 }, { x: 15, y: 10, z: 38 },
  // Cheeks
  { x: -70, y: -10, z: 10 }, { x: -50, y: 10, z: 20 }, { x: 50, y: 10, z: 20 }, { x: 70, y: -10, z: 10 },
  // Mouth
  { x: -25, y: 30, z: 30 }, { x: 0, y: 25, z: 38 }, { x: 25, y: 30, z: 30 }, { x: 0, y: 40, z: 36 },
  // Chin & Jawline
  { x: -65, y: 40, z: 5 }, { x: -45, y: 65, z: 10 }, { x: 0, y: 85, z: 25 }, { x: 45, y: 65, z: 10 }, { x: 65, y: 40, z: 5 },
  // Forehead outline
  { x: -60, y: -80, z: 0 }, { x: -30, y: -95, z: 10 }, { x: 0, y: -100, z: 15 }, { x: 30, y: -95, z: 10 }, { x: 60, y: -80, z: 0 }
];

// Connection lines to render the wireframe mesh structure
const faceEdges = [
  [0, 1], [1, 2], [2, 3], [3, 4], // eyebrows
  [5, 6], [7, 8], // eyes
  [2, 9], [9, 10], [10, 11], // nose bridge
  [11, 12], [11, 13], [12, 10], [13, 10], // nose lobes
  [0, 5], [4, 8], // brow to eyes
  [5, 14], [8, 17], // eye to cheek outline
  [14, 15], [17, 16], // cheeks
  [15, 12], [16, 13], // cheek to nose base
  [12, 18], [13, 20], // nose base to mouth corners
  [18, 19], [19, 20], [20, 21], [21, 18], // lips
  [15, 22], [16, 26], // cheek to jaw
  [22, 23], [23, 24], [24, 25], [25, 26], // jaw outline
  [18, 23], [21, 24], [20, 25], // mouth to jaw internals
  [27, 28], [28, 29], [29, 30], [30, 31], // forehead line
  [27, 0], [31, 4], [29, 2] // forehead to eyebrows
];

export default function FaceRecognition3D() {
  const canvasRef = useRef(null);
  const [scanState, setScanState] = useState('idle'); // idle, scanning, matching, completed
  const [matchPercent, setMatchPercent] = useState(0);
  const [scanProgress, setScanProgress] = useState(-100); // y value coordinate of scan line
  const [extractedVector, setExtractedVector] = useState(null);
  
  // 3D rotation angle
  const [angleY, setAngleY] = useState(0.2);
  const [angleX, setAngleX] = useState(-0.15);
  const mouseRef = useRef({ isDown: false, x: 0, y: 0 });

  // Generate database embedding nodes
  const dbNodesRef = useRef([]);
  if (dbNodesRef.current.length === 0) {
    const nodes = [];
    const names = ['Person A', 'Person B', 'Ajij Nadaf', 'Person D', 'Person E'];
    
    // Cluster them in 3D space
    names.forEach((name, idx) => {
      nodes.push({
        name,
        // Spread clusters
        x: -120 + (idx * 60) + (Math.random() - 0.5) * 20,
        y: 110 + (Math.random() - 0.5) * 15,
        z: (Math.random() - 0.5) * 40,
        isTarget: name === 'Ajij Nadaf'
      });
    });
    dbNodesRef.current = nodes;
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
    setAngleX(prev => Math.max(-Math.PI/4, Math.min(Math.PI/4, prev + dy * 0.007)));
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


  // Start Recognition System Scan
  const startScan = () => {
    if (scanState !== 'idle') return;
    setScanState('scanning');
    setScanProgress(-110);
    setMatchPercent(0);
    setExtractedVector(null);
  };

  const handleReset = () => {
    setScanState('idle');
    setScanProgress(-110);
    setMatchPercent(0);
    setExtractedVector(null);
  };

  // Scanning progress loop
  useEffect(() => {
    if (scanState !== 'scanning') return;
    let timer;
    
    const tick = () => {
      setScanProgress(prev => {
        if (prev >= 95) {
          setScanState('matching');
          return 95;
        }
        return prev + 4;
      });
      timer = setTimeout(tick, 30);
    };
    timer = setTimeout(tick, 30);
    return () => clearTimeout(timer);
  }, [scanState]);

  // Embedding matching loop
  useEffect(() => {
    if (scanState !== 'matching') return;
    let timer;
    let progress = 0;
    
    // Generate a list of random values representing 128D encoding array
    const vector = Array.from({ length: 8 }, () => (Math.random() * 0.5 - 0.25).toFixed(3));
    setExtractedVector(vector);

    const matchTick = () => {
      if (progress >= 100) {
        setScanState('completed');
        setMatchPercent(99.85);
        return;
      }
      progress += 5;
      setMatchPercent(Math.round(progress * 0.9985));
      timer = setTimeout(matchTick, 40);
    };
    timer = setTimeout(matchTick, 40);
    return () => clearTimeout(timer);
  }, [scanState]);

  // Main Canvas Render
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

    // 3D helper math
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
      const cameraDistance = 300;
      const scale = fov / (cameraDistance + z);
      return {
        x: width / 2 + x * scale,
        y: height / 2 + y * scale,
        scale
      };
    };

    ctx.clearRect(0, 0, width, height);

    // Transform vertices
    const projectedVertices = faceVertices.map(v => {
      let r1 = rotateY3D(v.x, v.y - 15, v.z, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let proj = project(r2.x, r2.y, r2.z);
      return { ...v, px: proj.x, py: proj.y, pscale: proj.scale, zDepth: r2.z };
    });

    // Draw Face Mesh wireframe edges
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    faceEdges.forEach(edge => {
      const vStart = projectedVertices[edge[0]];
      const vEnd = projectedVertices[edge[1]];

      // If scanning, highlight edges that are intersected by scanline
      const isScanning = scanState === 'scanning';
      const startInScan = vStart.y <= scanProgress;
      const endInScan = vEnd.y <= scanProgress;
      const intersected = isScanning && (startInScan !== endInScan);
      
      ctx.beginPath();
      ctx.moveTo(vStart.px, vStart.py);
      ctx.lineTo(vEnd.px, vEnd.py);
      
      if (intersected) {
        ctx.strokeStyle = 'hsl(var(--primary))';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'hsl(var(--primary))';
        ctx.shadowBlur = 10;
      } else if (isScanning && startInScan && endInScan) {
        ctx.strokeStyle = `${primaryColor}, 0.25)`;
        ctx.lineWidth = 1;
      } else {
        ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Draw Face Node circles
    projectedVertices.forEach(v => {
      ctx.beginPath();
      const radius = 3 * v.pscale;
      ctx.arc(v.px, v.py, radius, 0, 2 * Math.PI);
      
      // Determine if scanned yet
      const isScanned = scanState === 'scanning' && v.y <= scanProgress;
      const isDoneScan = scanState === 'matching' || scanState === 'completed';
      
      if (isScanned || isDoneScan) {
        ctx.fillStyle = 'hsl(var(--primary))';
        ctx.shadowColor = 'hsl(var(--primary))';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = isLight ? '#e2e8f0' : '#10162a';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw vertical Scanning Bar line
    if (scanState === 'scanning') {
      // Find projected points near scanline and draw laser slice
      let laserY = rotateY3D(0, scanProgress - 15, 0, angleY);
      let laserX = rotateX3D(laserY.x, laserY.y, laserY.z, angleX);
      let projLaser = project(laserX.x, laserX.y, laserX.z);

      ctx.beginPath();
      ctx.moveTo(width / 2 - 120, projLaser.y);
      ctx.lineTo(width / 2 + 120, projLaser.y);
      ctx.strokeStyle = `${primaryColor}, 0.8)`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'hsl(var(--primary))';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Transform database nodes (represented at the bottom)
    const projectedDb = dbNodesRef.current.map(db => {
      let r1 = rotateY3D(db.x, db.y, db.z, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let proj = project(r2.x, r2.y, r2.z);
      return { ...db, px: proj.x, py: proj.y, pscale: proj.scale };
    });

    // Draw Database cluster nodes
    projectedDb.forEach(db => {
      ctx.beginPath();
      ctx.arc(db.px, db.py, 6 * db.pscale, 0, 2 * Math.PI);
      
      const isMatch = scanState === 'completed' && db.isTarget;
      const isSearching = scanState === 'matching';

      if (isMatch) {
        ctx.fillStyle = 'hsl(var(--accent))';
        ctx.strokeStyle = 'hsl(var(--text-primary))';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'hsl(var(--accent))';
        ctx.shadowBlur = 18;
      } else if (isSearching) {
        ctx.fillStyle = Math.random() > 0.5 ? 'hsl(var(--primary))' : isLight ? '#e2e8f0' : '#10162a';
        ctx.strokeStyle = 'rgba(0,240,255,0.4)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 5;
      } else {
        ctx.fillStyle = isLight ? '#f1f5f9' : '#0b0f19';
        ctx.strokeStyle = 'var(--border-color)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw label under node
      ctx.fillStyle = isMatch ? 'hsl(var(--accent))' : 'hsl(var(--text-muted))';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(db.name, db.px, db.py + 15);
    });

    // Draw glowing link between face nose tip and matched database node
    if (scanState === 'completed' || scanState === 'matching') {
      const faceCenter = projectedVertices[11]; // Nose tip node
      const targetDb = projectedDb.find(db => db.isTarget);
      
      if (targetDb) {
        ctx.beginPath();
        ctx.moveTo(faceCenter.px, faceCenter.py);
        ctx.lineTo(targetDb.px, targetDb.py);
        ctx.strokeStyle = scanState === 'completed' ? `${accentColor}, 0.65)` : `${primaryColor}, 0.4)`;
        ctx.lineWidth = scanState === 'completed' ? 2 : 1;
        ctx.setLineDash([4, 4]); // Dashed line
        ctx.stroke();
        ctx.setLineDash([]); // Reset
      }
    }

  }, [angleX, angleY, scanState, scanProgress]);

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
          <div style={styles.dragLabel}>Drag to Rotate Face Mesh</div>
        </div>

        <div style={styles.sidebar}>
          <h3 style={styles.title}>Face Recognition & Matching</h3>
          <p style={styles.desc}>
            Simulates a computer vision pipeline: detects face features, extracts 128D encodings via CNN, and computes cosine distances in embedding space.
          </p>

          <div style={styles.metricsBox}>
            <div style={styles.metricRow}>
              <span>Status:</span>
              <strong style={
                scanState === 'scanning' ? styles.blueText :
                scanState === 'matching' ? styles.violetText :
                scanState === 'completed' ? styles.greenText : styles.mutedText
              }>
                {scanState.toUpperCase()}
              </strong>
            </div>

            {extractedVector && (
              <div style={styles.vectorContainer}>
                <span style={styles.vectorTitle}>Encoding Vector (Extract):</span>
                <div style={styles.vectorBox}>
                  [{extractedVector.join(', ')}...]
                </div>
              </div>
            )}

            <div style={styles.metricRow}>
              <span>Match Accuracy:</span>
              <strong style={styles.greenText}>{matchPercent.toFixed(2)}%</strong>
            </div>
          </div>

          <div style={styles.controlRow}>
            <button 
              onClick={startScan} 
              disabled={scanState !== 'idle'}
              style={scanState !== 'idle' ? styles.btnDisabled : styles.btnPlay}
            >
              <Camera size={15} /> Start Scan
            </button>
            <button onClick={handleReset} style={styles.btnReset}>
              Reset
            </button>
          </div>

          {scanState === 'completed' && (
            <div style={styles.matchCard}>
              <CheckCircle size={18} color="hsl(var(--accent))" />
              <div style={styles.matchDetails}>
                <div style={styles.matchName}>Identity Verified: Ajij Nadaf</div>
                <div style={styles.matchMeta}>Confidence: 99.85% | Database ID: SevenMentor_025</div>
              </div>
            </div>
          )}
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
    gap: '8px'
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'hsl(var(--text-secondary))'
  },
  blueText: {
    color: 'hsl(var(--primary))'
  },
  violetText: {
    color: 'hsl(var(--secondary))'
  },
  greenText: {
    color: 'hsl(var(--accent))'
  },
  mutedText: {
    color: 'hsl(var(--text-muted))'
  },
  vectorContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  vectorTitle: {
    fontSize: '0.78rem',
    color: 'hsl(var(--text-muted))'
  },
  vectorBox: {
    backgroundColor: 'rgba(5, 8, 20, 0.5)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '6px',
    fontFamily: 'monospace',
    fontSize: '0.72rem',
    color: 'hsl(var(--text-secondary))',
    overflowX: 'auto',
    whiteSpace: 'nowrap'
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
  matchCard: {
    backgroundColor: 'rgba(0, 255, 108, 0.05)',
    border: '1px solid rgba(0, 255, 108, 0.25)',
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    animation: 'float 4s ease-in-out infinite'
  },
  matchDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  matchName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#e2e8f0'
  },
  matchMeta: {
    fontSize: '0.72rem',
    color: 'hsl(var(--text-secondary))'
  }
};
