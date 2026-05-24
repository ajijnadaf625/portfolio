import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);

    // Simulate sending message to backend
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Fire confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#8c52ff', '#00ff6c']
      });

      // Reset form
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <section id="contact" style={styles.section}>
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>

        <div style={styles.grid}>
          {/* Left Column: Direct info */}
          <div style={styles.infoCol} className="glass-panel-glow">
            <h3 style={styles.infoTitle}>Connect Directly</h3>
            <p style={styles.infoDesc}>
              Have an opening, a freelance project, or just want to talk about data analysis and machine learning? Feel free to reach out.
            </p>

            <div style={styles.contactDetails}>
              <a href="mailto:ajijnadaf625@gmail.com" style={styles.contactLink}>
                <div style={styles.iconBox}>
                  <Mail size={18} color="currentColor" style={{ color: 'hsl(var(--primary))' }} />
                </div>
                <div style={styles.linkInfo}>
                  <span style={styles.linkLabel}>Email</span>
                  <span style={styles.linkVal}>ajijnadaf625@gmail.com</span>
                </div>
              </a>

              <a href="tel:+919975017972" style={styles.contactLink}>
                <div style={styles.iconBox}>
                  <Phone size={18} color="currentColor" style={{ color: 'hsl(var(--secondary))' }} />
                </div>
                <div style={styles.linkInfo}>
                  <span style={styles.linkLabel}>Phone</span>
                  <span style={styles.linkVal}>+91-9975017972</span>
                </div>
              </a>

              <div style={styles.contactLinkStatic}>
                <div style={styles.iconBox}>
                  <MapPin size={18} color="currentColor" style={{ color: 'hsl(var(--accent))' }} />
                </div>
                <div style={styles.linkInfo}>
                  <span style={styles.linkLabel}>Location</span>
                  <span style={styles.linkVal}>Pune, India</span>
                </div>
              </div>
            </div>

            <div style={styles.socialRow}>
              <a href="https://www.linkedin.com/in/ajijnadaf625" target="_blank" rel="noreferrer" style={styles.socialBtn} className="glass-panel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                <span>LinkedIn</span>
              </a>
              <a href="https://github.com/ajijnadaf625" target="_blank" rel="noreferrer" style={styles.socialBtn} className="glass-panel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Right Column: Form */}
          <div style={styles.formCol} className="glass-panel">
            {success ? (
              <div style={styles.successWrapper}>
                <CheckCircle size={48} color="currentColor" style={{ color: 'hsl(var(--accent))', marginBottom: '16px' }} />
                <h3 style={styles.successTitle}>Message Sent!</h3>
                <p style={styles.successDesc}>
                  Thank you for reaching out. Your message has been sent successfully. Ajij will get back to you shortly.
                </p>
                <button onClick={() => setSuccess(false)} className="btn-secondary">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formHeader}>
                  <MessageSquare size={20} color="currentColor" style={{ color: 'hsl(var(--primary))' }} />
                  <h3 style={styles.formTitle}>Send a Message</h3>
                </div>

                <div style={styles.inputGroup}>
                  <label htmlFor="name" style={styles.label}>Your Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter your name"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label htmlFor="email" style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    placeholder="name@example.com"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label htmlFor="message" style={styles.label}>Message</label>
                  <textarea
                    id="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input"
                    placeholder="Write your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={loading ? { opacity: 0.6, cursor: 'not-allowed', marginTop: '6px' } : { marginTop: '6px' }}
                >
                  {loading ? 'Sending message...' : 'Send Message'}
                  <Send size={15} style={{ marginLeft: '6px' }} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          &copy; {new Date().getFullYear()} Ajij Nadaf. All rights reserved. Designed for AI/ML Performance.
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '80px 0 40px 0',
    backgroundColor: 'hsl(var(--bg-deep))',
    borderTop: '1px solid var(--border-color)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
    marginTop: '40px'
  },
  infoCol: {
    padding: '40px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  infoTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  infoDesc: {
    fontSize: '0.92rem',
    color: 'hsl(var(--text-secondary))',
    lineHeight: '1.6'
  },
  contactDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '10px'
  },
  contactLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: 'rgba(var(--card-bg), 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: 'rgba(0, 240, 255, 0.25)',
      backgroundColor: 'rgba(var(--card-bg), 0.04)'
    }
  },
  contactLinkStatic: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: 'rgba(var(--card-bg), 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px'
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(var(--card-bg), 0.06)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  linkInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  linkLabel: {
    fontSize: '0.72rem',
    color: 'hsl(var(--text-muted))',
    fontWeight: '500'
  },
  linkVal: {
    fontSize: '0.92rem',
    color: 'hsl(var(--text-primary))',
    fontWeight: '600'
  },
  socialRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px'
  },
  socialBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 0',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'hsl(var(--text-primary))',
    borderRadius: '12px',
    transition: 'all 0.2s ease'
  },
  formCol: {
    padding: '40px',
    borderRadius: '20px',
    backgroundColor: 'var(--progress-track)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px'
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif"
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.8rem',
    color: 'hsl(var(--text-secondary))',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'rgb(var(--input-bg))',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'hsl(var(--text-primary))',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'all 0.2s ease',
    ':focus': {
      borderColor: '#00f0ff',
      boxShadow: '0 0 10px rgba(0, 240, 255, 0.15)'
    }
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'rgb(var(--input-bg))',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'hsl(var(--text-primary))',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    resize: 'none',
    transition: 'all 0.2s ease',
    ':focus': {
      borderColor: '#00f0ff',
      boxShadow: '0 0 10px rgba(0, 240, 255, 0.15)'
    }
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00f0ff',
    color: '#050814',
    border: 'none',
    borderRadius: '24px',
    padding: '12px 24px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 4px 15px rgba(0, 240, 255, 0.25)',
    transition: 'all 0.2s ease',
    marginTop: '6px'
  },
  submitBtnDisabled: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(var(--card-bg), 0.1)',
    color: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '24px',
    padding: '12px 24px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'not-allowed',
    fontFamily: "'Outfit', sans-serif",
    marginTop: '6px'
  },
  successWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: '100%',
    padding: '20px'
  },
  successTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'hsl(var(--text-primary))',
    fontFamily: "'Outfit', sans-serif",
    marginBottom: '8px'
  },
  successDesc: {
    fontSize: '0.9rem',
    color: 'hsl(var(--text-secondary))',
    lineHeight: '1.5',
    maxWidth: '300px',
    marginBottom: '20px'
  },
  resetBtn: {
    background: 'none',
    border: '1px solid rgba(0, 240, 255, 0.3)',
    borderRadius: '20px',
    color: '#00f0ff',
    padding: '8px 20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Outfit', sans-serif"
  },
  footer: {
    marginTop: '80px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '30px',
    textAlign: 'center',
    fontSize: '0.78rem',
    color: 'hsl(var(--text-muted))'
  }
};
// Hover effects are configured using custom class declarations in index.css
