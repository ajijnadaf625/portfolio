import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Award } from 'lucide-react';

// Define a structured 3D tree template
// Levels: 0 (root), 1 (2 nodes), 2 (4 nodes)
const createTree = (seed, featureIndices) => {
  return {
    nodes: [
      { id: 0, x: 0, y: -90, z: 0, feature: featureIndices[0], threshold: 50, val: null },
      
      { id: 1, x: -60, y: -20, z: -20, feature: featureIndices[1], threshold: 30, val: null, parent: 0 },
      { id: 2, x: 60, y: -20, z: 20, feature: featureIndices[2], threshold: 70, val: null, parent: 0 },
      
      { id: 3, x: -90, y: 50, z: -40, feature: null, threshold: null, val: 'No Churn', parent: 1 },
      { id: 4, x: -30, y: 50, z: -10, feature: null, threshold: null, val: 'Churn', parent: 1 },
      { id: 5, x: 30, y: 50, z: 10, feature: null, threshold: null, val: 'No Churn', parent: 2 },
      { id: 6, x: 90, y: 50, z: 40, feature: null, threshold: null, val: 'Churn', parent: 2 },
    ]
  };
};

export default function RandomForest3D() {
  const canvasRef = useRef(null);
  const [activeTree, setActiveTree] = useState(0); // 0, 1, 2 for Trees
  const [running, setRunning] = useState(false);
  const [features, setFeatures] = useState({
    contract: 45, // Contract duration (0 to 100)
    charges: 60,  // Monthly charges (0 to 100)
    tenure: 35,   // Tenure months (0 to 100)
  });
  
  // Animation path state
  const [pulseProgress, setPulseProgress] = useState(0); // 0 to 2 (corresponds to level traversal)
  const [votes, setVotes] = useState([null, null, null]);
  
  // 3D rotation state
  const [angleX, setAngleX] = useState(-0.3);
  const [angleY, setAngleY] = useState(0.4);
  const mouseRef = useRef({ isDown: false, x: 0, y: 0 });

  // 3 Trees with different feature weights/thresholds
  const trees = useRef([
    createTree(1, ['contract', 'charges', 'tenure']),
    createTree(2, ['tenure', 'contract', 'charges']),
    createTree(3, ['charges', 'tenure', 'contract'])
  ]);

  // Compute actual paths for current feature settings
  const getDecisionPath = (treeIndex) => {
    const tree = trees.current[treeIndex];
    const path = [0];
    
    // Node 0 feature eval
    const n0 = tree.nodes[0];
    const f0 = features[n0.feature];
    const left = f0 < n0.threshold;
    
    const nextId = left ? 1 : 2;
    path.push(nextId);

    // Node 1/2 feature eval
    const nNext = tree.nodes[nextId];
    const fNext = features[nNext.feature];
    const finalLeft = fNext < nNext.threshold;
    
    if (nextId === 1) {
      path.push(finalLeft ? 3 : 4);
    } else {
      path.push(finalLeft ? 5 : 6);
    }
    
    return path;
  };

  const activePath = getDecisionPath(activeTree);

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


  // Run Inference Animation
  const handleClassify = () => {
    if (running) return;
    setRunning(true);
    setPulseProgress(0);
    setVotes([null, null, null]);
  };

  useEffect(() => {
    if (!running) return;
    let timer;
    
    const tick = () => {
      setPulseProgress(prev => {
        if (prev >= 2) {
          setRunning(false);
          // calculate actual votes of all 3 trees
          const finalVotes = [0, 1, 2].map(idx => {
            const path = getDecisionPath(idx);
            const leafId = path[2];
            return trees.current[idx].nodes[leafId].val;
          });
          setVotes(finalVotes);
          return 2;
        }
        return prev + 0.08;
      });
      timer = setTimeout(tick, 30);
    };
    timer = setTimeout(tick, 30);
    return () => clearTimeout(timer);
  }, [running]);

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

    // 3D Matrix Utilities
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

    const tree = trees.current[activeTree];
    const path = getDecisionPath(activeTree);

    // Calculate node coordinates in 3D projection
    const projectedNodes = tree.nodes.map(node => {
      let r1 = rotateY3D(node.x, node.y, node.z, angleY);
      let r2 = rotateX3D(r1.x, r1.y, r1.z, angleX);
      let proj = project(r2.x, r2.y, r2.z);
      return { ...node, px: proj.x, py: proj.y, pscale: proj.scale, zDepth: r2.z };
    });

    // Draw tree connections (branches)
    projectedNodes.forEach(node => {
      if (node.parent !== undefined) {
        const parentNode = projectedNodes[node.parent];
        
        ctx.beginPath();
        ctx.moveTo(parentNode.px, parentNode.py);
        ctx.lineTo(node.px, node.py);
        
        // Highlight active decision path branches
        const idxInPath = path.indexOf(node.id);
        const parentIdxInPath = path.indexOf(parentNode.id);
        const isActiveBranch = idxInPath !== -1 && parentIdxInPath !== -1 && idxInPath === parentIdxInPath + 1;

        if (isActiveBranch) {
          ctx.strokeStyle = `${primaryColor}, 0.7)`;
          ctx.lineWidth = 3;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1.5;
        }
        ctx.stroke();
      }
    });

    // Draw Nodes
    projectedNodes.forEach(node => {
      const size = node.parent === undefined ? 18 : (node.feature === null ? 14 : 15);
      const scaledSize = size * node.pscale;
      
      const inPath = path.includes(node.id);
      
      ctx.beginPath();
      ctx.arc(node.px, node.py, scaledSize, 0, 2 * Math.PI);
      
      if (inPath) {
        ctx.fillStyle = node.feature === null 
          ? (node.val === 'Churn' ? '#ff528c' : 'hsl(var(--accent))') 
          : 'hsl(var(--primary))';
        ctx.strokeStyle = 'hsl(var(--text-primary))';
        ctx.lineWidth = 2;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 15;
      } else {
        ctx.fillStyle = '#10162a';
        ctx.strokeStyle = 'hsl(var(--text-muted))';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset

      // Write text labels on nodes
      ctx.fillStyle = inPath ? '#000' : 'hsl(var(--text-secondary))';
      ctx.font = `bold ${Math.round(8 * node.pscale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (node.feature) {
        // Feature split abbreviate
        const abbr = node.feature === 'contract' ? 'CTR' : (node.feature === 'charges' ? 'CHG' : 'TEN');
        ctx.fillText(`${abbr}<${node.threshold}`, node.px, node.py);
      } else {
        ctx.fillText(node.val === 'Churn' ? 'CH' : 'NC', node.px, node.py);
      }

      // Add label next to nodes
      if (node.feature) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '9px sans-serif';
        ctx.fillText(node.feature, node.px, node.py - scaledSize - 8);
      } else {
        ctx.fillStyle = node.val === 'Churn' ? '#ff528c' : 'hsl(var(--accent))';
        ctx.font = '9px sans-serif';
        ctx.fillText(node.val, node.px, node.py + scaledSize + 10);
      }
    });

    // Draw electrical pulse animating along decision path
    if (running && pulseProgress > 0) {
      // pulseProgress ranges from 0 to 2
      // 0 to 1: path[0] to path[1]
      // 1 to 2: path[1] to path[2]
      const segment = Math.floor(pulseProgress);
      const remainder = pulseProgress - segment;
      
      if (segment < 2) {
        const startNode = projectedNodes[path[segment]];
        const endNode = projectedNodes[path[segment + 1]];
        
        const px = startNode.px + (endNode.px - startNode.px) * remainder;
        const py = startNode.py + (endNode.py - startNode.py) * remainder;
        const pscale = startNode.pscale + (endNode.pscale - startNode.pscale) * remainder;

        ctx.beginPath();
        ctx.arc(px, py, 8 * pscale, 0, 2 * Math.PI);
        ctx.fillStyle = 'hsl(var(--text-primary))';
        ctx.shadowColor = 'hsl(var(--primary))';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

  }, [angleX, angleY, activeTree, features, running, pulseProgress]);

  // Major voting math
  const finalPrediction = () => {
    const hasVotes = votes.every(v => v !== null);
    if (!hasVotes) return 'Waiting...';
    
    const counts = {};
    votes.forEach(v => counts[v] = (counts[v] || 0) + 1);
    
    let maxVote = null;
    let maxCount = -1;
    Object.entries(counts).forEach(([k, v]) => {
      if (v > maxCount) {
        maxCount = v;
        maxVote = k;
      }
    });
    return maxVote;
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
          <div style={styles.treeTabs}>
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                onClick={() => setActiveTree(idx)}
                style={activeTree === idx ? styles.activeTab : styles.tab}
              >
                Tree {idx + 1}
              </button>
            ))}
          </div>
          <canvas 
            ref={canvasRef} 
            width={450} 
            height={320} 
            style={styles.canvas} 
          />
          <div style={styles.dragLabel}>Drag to Rotate 3D Tree</div>
        </div>

        <div style={styles.sidebar}>
          <h3 style={styles.title}>Random Forest Classifier</h3>
          <p style={styles.desc}>
            An ensemble of decision trees. Adjust customer features below to see individual tree routes and final consensus voting.
          </p>

          <div style={styles.slidersContainer}>
            <div style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span>Contract Type (Duration):</span>
                <span>{features.contract} / 100</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={features.contract} 
                onChange={(e) => setFeatures({...features, contract: parseInt(e.target.value)})}
                style={styles.slider}
              />
            </div>
            
            <div style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span>Monthly Charges ($):</span>
                <span>{features.charges} / 100</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={features.charges} 
                onChange={(e) => setFeatures({...features, charges: parseInt(e.target.value)})}
                style={styles.slider}
              />
            </div>

            <div style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span>Tenure (Months):</span>
                <span>{features.tenure} / 100</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={features.tenure} 
                onChange={(e) => setFeatures({...features, tenure: parseInt(e.target.value)})}
                style={styles.slider}
              />
            </div>
          </div>

          <div style={styles.controlRow}>
            <button 
              onClick={handleClassify} 
              disabled={running}
              style={running ? styles.btnDisabled : styles.btnPlay}
            >
              <Play size={15} /> Run Inference
            </button>
          </div>

          <div style={styles.votingBox}>
            <div style={styles.votingTitle}>Voting Assembly:</div>
            <div style={styles.votesGrid}>
              {[0, 1, 2].map(idx => (
                <div key={idx} style={styles.voteCell}>
                  <span>Tree {idx + 1}:</span>
                  <strong style={votes[idx] === 'Churn' ? styles.pinkText : (votes[idx] === 'No Churn' ? styles.greenText : styles.mutedText)}>
                    {votes[idx] || '?'}
                  </strong>
                </div>
              ))}
            </div>
            <div style={styles.finalPredictionRow}>
              <span>Consensus prediction:</span>
              <strong style={finalPrediction() === 'Churn' ? styles.pinkTextGlow : (finalPrediction() === 'No Churn' ? styles.greenTextGlow : styles.mutedText)}>
                {finalPrediction()}
              </strong>
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
  treeTabs: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    gap: '6px',
    zIndex: 10
  },
  tab: {
    backgroundColor: 'var(--progress-track)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '4px 10px',
    color: 'hsl(var(--text-secondary))',
    fontSize: '11px',
    cursor: 'pointer',
  },
  activeTab: {
    backgroundColor: 'hsl(var(--primary))',
    border: '1px solid hsl(var(--primary))',
    borderRadius: '12px',
    padding: '4px 10px',
    color: 'var(--btn-text)',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  canvas: {
    display: 'block',
    marginTop: '25px', // space for tabs
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    outline: 'none',
    cursor: 'pointer',
    accentColor: 'hsl(var(--primary))'
  },
  controlRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  btnPlay: {
    flex: '1',
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
    flex: '1',
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
  votingBox: {
    backgroundColor: 'var(--progress-track)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  votingTitle: {
    fontSize: '0.8rem',
    color: 'hsl(var(--text-muted))',
    fontWeight: '500'
  },
  votesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px'
  },
  voteCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '4px',
    padding: '4px',
    fontSize: '0.75rem',
    color: 'hsl(var(--text-secondary))'
  },
  pinkText: {
    color: '#ff528c'
  },
  greenText: {
    color: 'hsl(var(--accent))'
  },
  mutedText: {
    color: 'hsl(var(--text-muted))'
  },
  pinkTextGlow: {
    color: '#ff528c',
    textShadow: '0 0 10px rgba(255, 82, 140, 0.4)'
  },
  greenTextGlow: {
    color: 'hsl(var(--accent))',
    textShadow: '0 0 10px rgba(0, 255, 108, 0.4)'
  },
  finalPredictionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '6px',
    marginTop: '2px',
    color: '#e2e8f0'
  }
};
