import React from 'react';
import { Database, Code, Eye, LineChart, Cpu } from 'lucide-react';

export default function Skills() {
  const skillCategories = [
    {
      title: 'Languages & Databases',
      icon: Database,
      skills: [
        { name: 'Python', level: 90 },
        { name: 'SQL', level: 85 },
        { name: 'MySQL', level: 80 },
        { name: 'Firebase', level: 70 }
      ]
    },
    {
      title: 'Libraries & Frameworks',
      icon: Code,
      skills: [
        { name: 'Pandas & NumPy', level: 85 },
        { name: 'Scikit-learn', level: 85 },
        { name: 'Flask', level: 75 },
        { name: 'OpenCV & Dlib', level: 80 },
        { name: 'Matplotlib & Seaborn', level: 80 },
        { name: 'cvzone', level: 75 }
      ]
    },
    {
      title: 'BI & Visualization',
      icon: LineChart,
      skills: [
        { name: 'Power BI', level: 85 },
        { name: 'Dashboard Dev', level: 80 },
        { name: 'Data Visualization', level: 85 }
      ]
    },
    {
      title: 'Data Engineering Skills',
      icon: Eye,
      skills: [
        { name: 'Data Cleaning', level: 90 },
        { name: 'EDA (Exploratory)', level: 85 },
        { name: 'Statistical Analysis', level: 80 },
        { name: 'Feature Engineering', level: 80 }
      ]
    },
    {
      title: 'Machine Learning & AI',
      icon: Cpu,
      skills: [
        { name: 'Logistic Regression', level: 85 },
        { name: 'Random Forest', level: 85 },
        { name: 'XGBoost', level: 80 },
        { name: 'SMOTE (Oversampling)', level: 85 },
        { name: 'Face Recognition', level: 80 },
        { name: 'Classification & Regression', level: 90 }
      ]
    }
  ];

  return (
    <section id="skills" style={styles.section}>
      <div className="container">
        <h2 className="section-title">Technical Skills</h2>
        
        <div style={styles.grid}>
          {skillCategories.map((cat, idx) => {
            const CatIcon = cat.icon;
            return (
              <div key={idx} style={styles.catCard} className="glass-panel-glow">
                
                <div style={styles.catHeader}>
                  <div style={styles.iconWrapper}>
                    <CatIcon size={18} color="currentColor" style={{ color: 'hsl(var(--primary))' }} />
                  </div>
                  <h3 style={styles.catTitle}>{cat.title}</h3>
                </div>

                <div style={styles.skillsList}>
                  {cat.skills.map((skill, sIdx) => (
                    <div key={sIdx} style={styles.skillItem}>
                      <div style={styles.skillLabelRow}>
                        <span style={styles.skillName}>{skill.name}</span>
                        <span style={styles.skillPercent}>{skill.level}%</span>
                      </div>
                      
                      <div style={styles.progressContainer}>
                        <div 
                          style={{
                            ...styles.progressBar, 
                            width: `${skill.level}%`,
                            background: idx % 2 === 0 
                              ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))' 
                              : 'linear-gradient(90deg, hsl(var(--secondary)), hsl(var(--accent)))'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    marginTop: '40px'
  },
  catCard: {
    padding: '24px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  catHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px'
  },
  iconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'var(--badge-bg)',
    border: '1px solid var(--badge-border)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  catTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  skillsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  skillItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  skillLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
    fontWeight: '500'
  },
  skillName: {
    color: 'hsl(var(--text-primary))'
  },
  skillPercent: {
    color: 'hsl(var(--text-muted))'
  },
  progressContainer: {
    width: '100%',
    height: '5px',
    backgroundColor: 'var(--progress-track)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
    boxShadow: '0 0 10px var(--border-glow)'
  }
};
