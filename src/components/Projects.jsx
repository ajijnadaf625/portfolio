import React, { useState } from 'react';
import { ShieldCheck, UserCheck, TrendingUp, Sliders, Smartphone, AlertCircle, BarChart2 } from 'lucide-react';

export default function Projects() {
  // Project 1 Churn Calculator state
  const [churnInputs, setChurnInputs] = useState({ tenure: 12, charges: 75, contract: 0 }); // contract 0=month, 1=1yr, 2=2yr
  const [churnResult, setChurnResult] = useState(null);

  // Project 2 Attendance Scanner state
  const [scanActive, setScanActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Project 3 House Price Calculator state
  const [houseInputs, setHouseInputs] = useState({ sqft: 1800, rooms: 2, quality: 6 });
  const [houseResult, setHouseResult] = useState(null);

  // Compute Churn Risk
  const calculateChurnRisk = () => {
    // contract weighting: month=0.8, 1yr=0.3, 2yr=0.1
    const contractWeight = churnInputs.contract === 0 ? 0.8 : (churnInputs.contract === 1 ? 0.35 : 0.1);
    const tenureWeight = Math.max(0.05, 1 - (churnInputs.tenure / 72)); // longer tenure, less churn
    const chargesWeight = churnInputs.charges / 120; // higher charges, more churn
    
    const prob = Math.min(99, Math.round((contractWeight * 0.4 + tenureWeight * 0.3 + chargesWeight * 0.3) * 100));
    setChurnResult({
      probability: prob,
      label: prob > 50 ? 'High Risk' : 'Low Risk'
    });
  };

  // Simulate Face Attendance Check-in
  const runAttendanceSim = () => {
    if (scanActive) return;
    setScanActive(true);
    setScanResult(null);
    
    setTimeout(() => {
      setScanActive(false);
      setScanResult({
        name: 'Ajij Nadaf',
        time: new Date().toLocaleTimeString(),
        status: 'Checked-in',
        db: 'Firebase synced'
      });
    }, 2000);
  };

  // Compute House Price
  const calculateHousePrice = () => {
    // Price = 110 * sqft + 25000 * rooms + 15000 * quality + base
    const price = 110 * houseInputs.sqft + 25000 * houseInputs.rooms + 15000 * houseInputs.quality + 8000;
    setHouseResult(price);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section id="projects" style={styles.section}>
      <div className="container">
        <h2 className="section-title">Machine Learning Projects</h2>
        
        <div style={styles.projectsGrid}>
          
          {/* Card 1: Customer Churn */}
          <div style={styles.projectCard} className="glass-panel">
            <div style={styles.cardHeader}>
              <BarChart2 size={24} color="currentColor" style={{ color: 'hsl(var(--primary))' }} />
              <h3 style={styles.cardTitle}>Customer Churn Prediction</h3>
            </div>
            <p style={styles.cardDesc}>
              Built a classification model on the Telco Customer Churn dataset. Preprocessed data, handled class imbalances using SMOTE, and evaluated Logistic Regression, Random Forest, and XGBoost.
            </p>
            <div style={styles.techList}>
              <span className="tech-tag">Python</span>
              <span className="tech-tag">Scikit-Learn</span>
              <span className="tech-tag">SMOTE</span>
              <span className="tech-tag">XGBoost</span>
            </div>

            {/* Interactive Widget: Churn Risk Predictor */}
            <div style={styles.widget} className="glass-panel-glow">
              <div style={styles.widgetTitle}>Interactive Risk Calculator</div>
              
              <div style={styles.widgetBody}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tenure: {churnInputs.tenure} months</label>
                  <input 
                    type="range" min="1" max="72" value={churnInputs.tenure}
                    onChange={(e) => setChurnInputs({...churnInputs, tenure: parseInt(e.target.value)})}
                    style={styles.rangeInput}
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Monthly Charges: ${churnInputs.charges}</label>
                  <input 
                    type="range" min="20" max="120" value={churnInputs.charges}
                    onChange={(e) => setChurnInputs({...churnInputs, charges: parseInt(e.target.value)})}
                    style={styles.rangeInput}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Contract Type</label>
                  <div style={styles.buttonGroup}>
                    {['Month-to-month', 'One Year', 'Two Year'].map((name, idx) => (
                      <button
                        key={idx}
                        onClick={() => setChurnInputs({...churnInputs, contract: idx})}
                        style={churnInputs.contract === idx ? styles.activeSelectBtn : styles.selectBtn}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={calculateChurnRisk} className="btn-secondary" style={{ marginTop: '6px' }}>
                  Evaluate Churn Probability
                </button>

                {churnResult && (
                  <div style={styles.resultBox}>
                    <div style={styles.resultRow}>
                      <span>Risk Level:</span>
                      <strong style={churnResult.label === 'High Risk' ? styles.dangerText : styles.safeText}>
                        {churnResult.label} ({churnResult.probability}%)
                      </strong>
                    </div>
                    <div style={styles.recommendation}>
                      {churnResult.probability > 50 
                        ? 'Recommendation: Proactively contact user with discount bundle.' 
                        : 'Recommendation: Maintain current contract settings.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Face Recognition Attendance */}
          <div style={styles.projectCard} className="glass-panel">
            <div style={styles.cardHeader}>
              <UserCheck size={24} color="currentColor" style={{ color: 'hsl(var(--secondary))' }} />
              <h3 style={styles.cardTitle}>Face Attendance System</h3>
            </div>
            <p style={styles.cardDesc}>
              Developed an automated attendance system using Dlib, Face Recognition, and OpenCV. Features anti-spoofing detection, multi-role login support, and instant database logging.
            </p>
            <div style={styles.techList}>
              <span className="tech-tag">Python</span>
              <span className="tech-tag">OpenCV</span>
              <span className="tech-tag">Flask</span>
              <span className="tech-tag">MySQL</span>
              <span className="tech-tag">Firebase</span>
            </div>

            {/* Interactive Widget: Live Recognition Simulation */}
            <div style={styles.widget} className="glass-panel-glow">
              <div style={styles.widgetTitle}>Interactive Camera Scanner</div>
              
              <div style={styles.cameraBox}>
                {scanActive ? (
                  <div style={styles.scanningFrame}>
                    <div style={styles.scanLaser}></div>
                    <div style={styles.faceTarget}></div>
                    <span style={styles.cameraText}>Analyzing Facial Vector Encodings...</span>
                  </div>
                ) : scanResult ? (
                  <div style={styles.successFrame}>
                    <ShieldCheck size={36} color="currentColor" style={{ color: 'hsl(var(--accent))' }} />
                    <span style={styles.successText}>Log Created successfully!</span>
                    <div style={styles.logDetails}>
                      <div>Name: {scanResult.name}</div>
                      <div>Time: {scanResult.time}</div>
                      <div>DB Sync: {scanResult.db}</div>
                    </div>
                  </div>
                ) : (
                  <div style={styles.cameraIdle}>
                    <Smartphone size={32} color="currentColor" style={{ color: 'hsl(var(--text-muted))', marginBottom: '8px'}} />
                    <span style={styles.cameraIdleText}>Device Offline</span>
                  </div>
                )}
              </div>

              <button 
                onClick={runAttendanceSim} 
                disabled={scanActive} 
                className={scanActive ? "btn-secondary" : "btn-secondary"}
                style={scanActive ? { opacity: 0.5, cursor: 'not-allowed', marginTop: '6px' } : { marginTop: '6px' }}
              >
                {scanActive ? 'Scanning mesh...' : 'Simulate Attendance Check-in'}
              </button>
            </div>
          </div>

          {/* Card 3: House Price Prediction */}
          <div style={styles.projectCard} className="glass-panel">
            <div style={styles.cardHeader}>
              <TrendingUp size={24} color="currentColor" style={{ color: 'hsl(var(--accent))' }} />
              <h3 style={styles.cardTitle}>House Price Regression</h3>
            </div>
            <p style={styles.cardDesc}>
              Designed a regression model to estimate house valuations based on location details, rooms, quality, and area size. Attained an R² test rating range of 0.85--0.92.
            </p>
            <div style={styles.techList}>
              <span className="tech-tag">Python</span>
              <span className="tech-tag">Pandas</span>
              <span className="tech-tag">Scikit-Learn</span>
              <span className="tech-tag">Regression</span>
            </div>

            {/* Interactive Widget: Valuation Calculator */}
            <div style={styles.widget} className="glass-panel-glow">
              <div style={styles.widgetTitle}>Interactive Valuation Estimator</div>
              
              <div style={styles.widgetBody}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Builtup Area: {houseInputs.sqft} Sq Ft</label>
                  <input 
                    type="range" min="600" max="4000" step="50" value={houseInputs.sqft}
                    onChange={(e) => setHouseInputs({...houseInputs, sqft: parseInt(e.target.value)})}
                    style={styles.rangeInput}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>BHK Layout (Rooms): {houseInputs.rooms} BHK</label>
                  <input 
                    type="range" min="1" max="5" value={houseInputs.rooms}
                    onChange={(e) => setHouseInputs({...houseInputs, rooms: parseInt(e.target.value)})}
                    style={styles.rangeInput}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Construction Quality: {houseInputs.quality}/10</label>
                  <input 
                    type="range" min="1" max="10" value={houseInputs.quality}
                    onChange={(e) => setHouseInputs({...houseInputs, quality: parseInt(e.target.value)})}
                    style={styles.rangeInput}
                  />
                </div>

                <button onClick={calculateHousePrice} className="btn-secondary" style={{ marginTop: '6px' }}>
                  Estimate Value
                </button>

                {houseResult !== null && (
                  <div style={styles.resultBox}>
                    <div style={styles.resultRow}>
                      <span>Estimated Price:</span>
                      <strong style={styles.cyanText}>{formatCurrency(houseResult)}</strong>
                    </div>
                  </div>
                )}
              </div>
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
    backgroundColor: 'hsl(var(--bg-deep))',
    borderTop: '1px solid rgba(255, 255, 255, 0.02)'
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
    marginTop: '40px'
  },
  projectCard: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderRadius: '16px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: 'hsl(var(--text-secondary))',
    lineHeight: '1.5'
  },
  techList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '10px'
  },
  techTag: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: 'rgba(var(--card-bg), 0.06)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '4px 10px'
  },
  widget: {
    marginTop: 'auto',
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: 'var(--progress-track)',
    border: '1px solid var(--border-color)'
  },
  widgetTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'hsl(var(--text-muted))',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '6px'
  },
  widgetBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '0.75rem',
    color: 'hsl(var(--text-secondary))'
  },
  rangeInput: {
    width: '100%',
    WebkitAppearance: 'none',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    outline: 'none',
    cursor: 'pointer',
    accentColor: '#00f0ff'
  },
  buttonGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px'
  },
  selectBtn: {
    fontSize: '0.7rem',
    color: 'hsl(var(--text-secondary))',
    backgroundColor: 'var(--progress-track)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '6px 0',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif"
  },
  activeSelectBtn: {
    fontSize: '0.7rem',
    color: 'var(--btn-text)',
    backgroundColor: 'hsl(var(--primary))',
    border: '1px solid hsl(var(--primary))',
    borderRadius: '6px',
    padding: '6px 0',
    cursor: 'pointer',
    fontWeight: '600',
    fontFamily: "'Outfit', sans-serif"
  },
  widgetBtn: {
    backgroundColor: 'rgba(var(--card-bg), 0.1)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'hsl(var(--text-primary))',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Outfit', sans-serif",
    marginTop: '6px',
    ':hover': {
      backgroundColor: '#00f0ff',
      color: '#050814',
      borderColor: '#00f0ff'
    }
  },
  widgetBtnDisabled: {
    backgroundColor: 'rgba(var(--card-bg), 0.04)',
    border: '1px solid var(--border-color)',
    color: '#64748b',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'not-allowed',
    fontFamily: "'Outfit', sans-serif",
    marginTop: '6px'
  },
  resultBox: {
    backgroundColor: 'var(--progress-track)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: 'hsl(var(--text-secondary))'
  },
  dangerText: {
    color: '#ff528c'
  },
  safeText: {
    color: 'hsl(var(--accent))'
  },
  cyanText: {
    color: 'hsl(var(--primary))'
  },
  recommendation: {
    fontSize: '0.68rem',
    color: 'hsl(var(--text-muted))',
    lineHeight: '1.3'
  },
  cameraBox: {
    height: '140px',
    backgroundColor: 'hsl(var(--bg-deep))',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '12px'
  },
  cameraIdle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  cameraIdleText: {
    fontSize: '0.78rem',
    color: 'hsl(var(--text-muted))'
  },
  scanningFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scanLaser: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '2px',
    backgroundColor: 'hsl(var(--secondary))',
    boxShadow: '0 0 10px hsl(var(--secondary))',
    animation: 'scan-line 2s linear infinite'
  },
  faceTarget: {
    width: '70px',
    height: '70px',
    border: '2px dashed hsl(var(--primary))',
    borderRadius: '50%',
    marginBottom: '10px',
    animation: 'float 3s ease-in-out infinite'
  },
  cameraText: {
    fontSize: '0.72rem',
    color: 'hsl(var(--text-secondary))'
  },
  successFrame: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  },
  successText: {
    fontSize: '0.8rem',
    color: 'hsl(var(--accent))',
    fontWeight: '600'
  },
  logDetails: {
    fontSize: '0.7rem',
    color: 'hsl(var(--text-secondary))',
    textAlign: 'center'
  }
};
// hover events are handled via standard hover states or classNames
