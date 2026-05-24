import React, { useState } from 'react';
import LogisticRegression3D from '../visualizers/LogisticRegression3D';
import RandomForest3D from '../visualizers/RandomForest3D';
import XGBoost3D from '../visualizers/XGBoost3D';
import Smote3D from '../visualizers/Smote3D';
import FaceRecognition3D from '../visualizers/FaceRecognition3D';
import HouseRegression3D from '../visualizers/HouseRegression3D';
import { Box, Code, Layers, Users, Eye, Home } from 'lucide-react';

const algoList = [
  {
    id: 'logistic',
    name: 'Logistic Regression',
    icon: Box,
    category: 'Classification',
    component: LogisticRegression3D,
    summary: 'Finds the optimal separating plane in higher dimensions.'
  },
  {
    id: 'rf',
    name: 'Random Forest',
    icon: Layers,
    category: 'Ensemble Learning',
    component: RandomForest3D,
    summary: 'Combines decision paths of multiple weak trees to vote on outcome.'
  },
  {
    id: 'xgboost',
    name: 'XGBoost Boosting',
    icon: Code,
    category: 'Gradient Boosting',
    component: XGBoost3D,
    summary: 'Sequentially trains trees to fit and minimize residual errors.'
  },
  {
    id: 'smote',
    name: 'SMOTE Oversampling',
    icon: Users,
    category: 'Data Engineering',
    component: Smote3D,
    summary: 'Synthesizes minority class entries by interpolating between neighbors.'
  },
  {
    id: 'face',
    name: 'Face Recognition',
    icon: Eye,
    category: 'Computer Vision',
    component: FaceRecognition3D,
    summary: 'Translates camera pixels into 128D facial embedding metrics.'
  },
  {
    id: 'house',
    name: 'House Price Regression',
    icon: Home,
    category: 'Regression',
    component: HouseRegression3D,
    summary: 'Plots Area & Bedrooms to model house value surface manifolds.'
  }
];

export default function AlgorithmSandbox() {
  const [selectedAlgo, setSelectedAlgo] = useState('logistic');
  const activeAlgo = algoList.find(a => a.id === selectedAlgo) || algoList[0];
  const ActiveComponent = activeAlgo.component;

  return (
    <section id="sandbox" style={styles.section}>
      <div className="container">
        <h2 className="section-title">3D ML Algorithm Sandbox</h2>
        
        <div className="sandbox-layout glass-panel">
          {/* Tabs Sidebar */}
          <div style={styles.tabsSidebar} className="sandbox-sidebar">
            <div style={styles.sidebarHeader}>Select Algorithm</div>
            <div style={styles.tabList} className="tab-list">
              {algoList.map(algo => {
                const IconComponent = algo.icon;
                const isSelected = algo.id === selectedAlgo;
                return (
                  <button
                    key={algo.id}
                    onClick={() => setSelectedAlgo(algo.id)}
                    style={isSelected ? styles.activeTabButton : styles.tabButton}
                  >
                    <IconComponent size={16} color="currentColor" style={{ color: isSelected ? 'var(--btn-text)' : 'hsl(var(--primary))' }} />
                    <div style={styles.tabMeta}>
                      <span style={isSelected ? styles.activeTextName : styles.textName}>{algo.name}</span>
                      <span style={isSelected ? styles.activeTextCat : styles.textCat}>{algo.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visualization Area */}
          <div style={styles.visualizerPanel}>
            <div style={styles.panelHeader}>
              <span className="badge-tag">{activeAlgo.category}</span>
              <p style={styles.summary}>{activeAlgo.summary}</p>
            </div>
            
            <div style={styles.canvasContainer}>
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '80px 0',
    backgroundColor: 'hsl(var(--bg-deep))'
  },
  sandboxContainer: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '520px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
  },
  tabsSidebar: {
    width: '280px',
    backgroundColor: 'rgba(var(--input-bg), 0.4)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '20px 24px',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'hsl(var(--text-muted))',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border-color)'
  },
  tabList: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    gap: '6px',
    flex: 1,
    overflowY: 'auto'
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  activeTabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'hsl(var(--primary))',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: '0 4px 15px var(--border-glow)',
    transition: 'all 0.2s ease',
  },
  tabMeta: {
    display: 'flex',
    flexDirection: 'column'
  },
  textName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'hsl(var(--text-primary))'
  },
  activeTextName: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--btn-text)'
  },
  textCat: {
    fontSize: '0.72rem',
    color: 'hsl(var(--text-secondary))'
  },
  activeTextCat: {
    fontSize: '0.72rem',
    color: 'var(--btn-text)',
    opacity: 0.8
  },
  visualizerPanel: {
    flex: 1,
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--progress-track)',
    minWidth: '320px'
  },
  panelHeader: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  summary: {
    fontSize: '0.95rem',
    color: 'hsl(var(--text-secondary))'
  },
  canvasContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
};
