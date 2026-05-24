import React from 'react';
import { Briefcase, Calendar, MapPin, Database, BarChart, CheckSquare, Layers } from 'lucide-react';

export default function Experience() {
  const internshipPoints = [
    {
      title: 'Expense Tracker Application',
      desc: 'Developed an Expense Tracker application using Python and SQL, enabling real-time financial data management.',
      icon: Database,
      tag: 'Backend & SQL'
    },
    {
      title: 'Power BI Dashboards',
      desc: 'Built interactive Power BI dashboards for expense monitoring, reducing manual reporting time by providing visual KPIs.',
      icon: BarChart,
      tag: 'BI & Visualization'
    },
    {
      title: 'Data Cleaning & Preprocessing',
      desc: 'Performed data cleaning and preprocessing on structured financial datasets using Python (Pandas, NumPy).',
      icon: Layers,
      tag: 'Data Prep'
    },
    {
      title: 'Statistical Analysis',
      desc: 'Applied statistical analysis methods to identify spending patterns and generate actionable business insights.',
      icon: CheckSquare,
      tag: 'Data Analysis'
    }
  ];

  return (
    <section id="experience" style={styles.section}>
      <div className="container">
        <h2 className="section-title">Professional Experience</h2>

        <div style={styles.timelineContainer}>
          
          {/* Main Timeline Card */}
          <div style={styles.internshipCard} className="glass-panel-glow">
            
            {/* Header info */}
            <div style={styles.cardHeader}>
              <div style={styles.iconWrapper}>
                <Briefcase size={24} color="currentColor" style={{ color: 'var(--btn-text)' }} />
              </div>
              <div style={styles.titleInfo}>
                <h3 style={styles.role}>Data Science Intern</h3>
                <h4 style={styles.company}>SevenMentor Private Limited</h4>
              </div>
              
              <div style={styles.metaRow}>
                <div style={styles.metaItem}>
                  <Calendar size={14} color="currentColor" style={{ color: 'hsl(var(--primary))' }} />
                  <span>Jan 2025 -- Jun 2025</span>
                </div>
                <div style={styles.metaItem}>
                  <MapPin size={14} color="currentColor" style={{ color: 'hsl(var(--secondary))' }} />
                  <span>Pune, India</span>
                </div>
              </div>
            </div>

            <p style={styles.overview}>
              Contributed to data-driven engineering projects, cleaning structured datasets, implementing backend trackers, and assembling dashboard visualizers for executives.
            </p>

            {/* Achievement Timeline Nodes */}
            <div className="grid-2" style={{ gap: '20px', marginTop: '10px' }}>
              {internshipPoints.map((point, idx) => {
                const PointIcon = point.icon;
                return (
                  <div key={idx} style={styles.pointNode} className="glass-panel">
                    <div style={styles.pointHeader}>
                      <div style={styles.pointIconBox}>
                        <PointIcon size={16} color="currentColor" style={{ color: 'hsl(var(--primary))' }} />
                      </div>
                      <span className="badge-tag">{point.tag}</span>
                    </div>
                    <h4 style={styles.pointTitle}>{point.title}</h4>
                    <p style={styles.pointDesc}>{point.desc}</p>
                  </div>
                );
              })}
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
  timelineContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '40px'
  },
  internshipCard: {
    width: '100%',
    maxWidth: '900px',
    padding: '40px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '20px'
  },
  timelineLine: {
    position: 'absolute',
    left: '20px',
    top: 0,
    bottom: 0,
    width: '2px',
    background: 'linear-gradient(to bottom, hsl(var(--primary)), transparent)'
  },
  timelineDot: {
    position: 'absolute',
    left: '15px',
    top: '24px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'hsl(var(--bg-card))',
    border: '2px solid hsl(var(--primary))',
    boxShadow: '0 0 10px var(--border-glow)'
  },
  date: {
    fontSize: '0.85rem',
    color: 'hsl(var(--primary))',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'block'
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'hsl(var(--primary))',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 20px var(--border-glow)'
  },
  titleInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: '220px'
  },
  role: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  company: {
    fontSize: '1.05rem',
    color: 'hsl(var(--text-secondary))',
    fontWeight: '500'
  },
  descList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  bullet: {
    fontSize: '0.95rem',
    color: 'hsl(var(--text-secondary))',
    lineHeight: '1.5',
    position: 'relative',
    paddingLeft: '20px'
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-start'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: 'hsl(var(--text-secondary))'
  },
  overview: {
    fontSize: '0.98rem',
    color: 'hsl(var(--text-secondary))',
    lineHeight: '1.6'
  },
  pointNode: {
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: 'var(--progress-track)'
  },
  pointHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pointIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'var(--badge-bg)',
    border: '1px solid var(--badge-border)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pointTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  pointDesc: {
    fontSize: '0.85rem',
    color: 'hsl(var(--text-secondary))',
    lineHeight: '1.4'
  }
};
