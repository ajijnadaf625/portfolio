import React from 'react';
import { GraduationCap, Award, BookOpen, Calendar, MapPin } from 'lucide-react';

export default function Education() {
  const educationList = [
    {
      degree: 'Master of Computer Applications (MCA)',
      period: '2023 -- 2025',
      institution: 'Savitribai Phule Pune University',
      location: 'Pune, India',
      details: 'Specialized in Computer Science, Database Management, and Advanced Software Engineering. Active participant in data science labs.'
    },
    {
      degree: 'Bachelor of Computer Applications (BCA)',
      period: '2020 -- 2023',
      institution: 'Shivaji University',
      location: 'Kolhapur, India',
      details: 'Built core foundations in Programming Languages (C, Java, Python), SQL Databases, Web Development, and Statistics.'
    },
    {
      degree: 'Higher Secondary Certificate (HSC) -- 50%',
      period: '2020',
      institution: 'Higher Secondary Certificate Examination',
      location: 'Kolhapur, India',
      details: 'Science stream with focus on Physics, Chemistry, and Mathematics.'
    },
    {
      degree: 'Secondary School Certificate (SSC) -- 53%',
      period: '2018',
      institution: 'Secondary School Certificate Examination',
      location: 'Kolhapur, India',
      details: 'General core high school curriculum.'
    }
  ];

  const certifications = [
    'Python Programming',
    'SQL Databases',
    'Power BI for Data Analysis',
    'Machine Learning Models',
    'Statistics for Data Analysts'
  ];

  return (
    <section id="education" style={styles.section}>
      <div className="container">
        <h2 className="section-title">Education & Certifications</h2>
        
        <div className="education-grid">
          {/* Left Column: Academics */}
          <div style={styles.academicsCol}>
            <div style={styles.colHeader}>
              <GraduationCap size={22} color="currentColor" style={{ color: 'hsl(var(--primary))' }} />
              <h3 style={styles.colTitle}>Academic History</h3>
            </div>
            
            <div style={styles.cardsStack}>
              {educationList.map((edu, idx) => (
                <div key={idx} style={styles.eduCard} className="glass-panel">
                  <div style={styles.eduHeader}>
                    <h4 style={styles.degreeTitle}>{edu.degree}</h4>
                    <span style={styles.periodBadge}>{edu.period}</span>
                  </div>
                  <div style={styles.metaRow}>
                    <div style={styles.metaItem}>
                      <BookOpen size={13} color="currentColor" style={{ color: 'hsl(var(--text-muted))' }} />
                      <span>{edu.institution}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <MapPin size={13} color="currentColor" style={{ color: 'hsl(var(--text-muted))' }} />
                      <span>{edu.location}</span>
                    </div>
                  </div>
                  <p style={styles.eduDetails}>{edu.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Certifications */}
          <div style={styles.certsCol}>
            <div style={styles.colHeader}>
              <Award size={22} color="currentColor" style={{ color: 'hsl(var(--secondary))' }} />
              <h3 style={styles.colTitle}>Professional Certifications</h3>
            </div>

            <div style={styles.certWrapper} className="glass-panel-glow">
              <h4 style={styles.certOrg}>SevenMentor Training Institute</h4>
              <p style={styles.certDesc}>
                Comprehensive hand-on curriculum completing practical projects, model architectures, and database queries.
              </p>
              
              <div style={styles.certList}>
                {certifications.map((cert, idx) => (
                  <div key={idx} style={styles.certItem}>
                    <span style={styles.certBullet}>&bull;</span>
                    <span style={styles.certName}>{cert}</span>
                  </div>
                ))}
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
    borderTop: '1px solid var(--border-color)'
  },
  academicsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  certsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  colHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px'
  },
  colTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  cardsStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  eduCard: {
    padding: '20px 24px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  eduHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: '14px',
    flexWrap: 'wrap'
  },
  degreeTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  periodBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'hsl(var(--primary))',
    backgroundColor: 'var(--badge-bg)',
    border: '1px solid var(--badge-border)',
    padding: '2px 10px',
    borderRadius: '20px',
    whiteSpace: 'nowrap'
  },
  metaRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    color: 'hsl(var(--text-secondary))'
  },
  eduDetails: {
    fontSize: '0.85rem',
    color: 'hsl(var(--text-muted))',
    lineHeight: '1.5'
  },
  certWrapper: {
    padding: '30px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  certOrg: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  certDesc: {
    fontSize: '0.88rem',
    color: 'hsl(var(--text-secondary))',
    lineHeight: '1.5'
  },
  certList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '6px'
  },
  certItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.9rem'
  },
  certBullet: {
    color: 'hsl(var(--secondary))',
    fontSize: '1.25rem',
    lineHeight: 1
  },
  certName: {
    color: 'hsl(var(--text-primary))',
    fontWeight: '500'
  }
};
// Media queries styled in index.css
