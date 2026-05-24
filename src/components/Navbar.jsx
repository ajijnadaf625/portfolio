import React, { useEffect, useState } from 'react';
import { Mail, Phone, Menu, X, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Track page scroll to toggle sticky glass background & update active section spy
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['hero', 'sandbox', 'projects', 'experience', 'skills', 'education', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'hero', label: 'About' },
    { id: 'sandbox', label: '3D Sandbox' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav style={scrolled ? styles.navScrolled : styles.navNormal}>
      <div style={styles.navContainer}>
        {/* Logo */}
        <div style={styles.logo} onClick={() => handleNavClick('hero')}>
          <span style={styles.logoBracket}>&lt;</span>
          <span style={styles.logoText}>Ajij Nadaf</span>
          <span style={styles.logoBracket}>/&gt;</span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={activeSection === item.id ? styles.activeNavLink : styles.navLink}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Social Icons / Contact Shortcuts */}
        <div className="nav-socials">
          <a href="https://www.linkedin.com/in/ajijnadaf625" target="_blank" rel="noreferrer" className="social-link-icon" title="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a href="https://github.com/ajijnadaf625" target="_blank" rel="noreferrer" className="social-link-icon" title="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
          <a href="mailto:ajijnadaf625@gmail.com" className="social-link-icon" title="Email">
            <Mail size={18} />
          </a>
          <a href="tel:+919975017972" className="social-link-icon" title="Phone">
            <Phone size={16} />
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn" 
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={18} color="#00f0ff" /> : <Moon size={18} color="#6a24e3" />}
          </button>
          
          {/* Mobile Menu Button */}
          <button className="mobile-menu-toggle" style={styles.mobileMenuButton} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={styles.mobileDropdown}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={activeSection === item.id ? styles.mobileActiveLink : styles.mobileLink}
            >
              {item.label}
            </button>
          ))}
          <div style={styles.mobileSocialRow}>
            <a href="https://www.linkedin.com/in/ajijnadaf625" target="_blank" rel="noreferrer" className="social-link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://github.com/ajijnadaf625" target="_blank" rel="noreferrer" className="social-link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
            <a href="mailto:ajijnadaf625@gmail.com" className="social-link-icon">
              <Mail size={20} />
            </a>
            <a href="tel:+919975017972" className="social-link-icon">
              <Phone size={18} />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

const styles = {
  navNormal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '70px',
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center'
  },
  navScrolled: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '70px',
    backgroundColor: 'rgba(var(--nav-bg), 0.75)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border-color)',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center'
  },
  navContainer: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.25rem',
    fontWeight: '700'
  },
  logoBracket: {
    color: '#00f0ff',
    fontWeight: '700'
  },
  logoText: {
    color: 'hsl(var(--text-primary))',
    margin: '0 2px'
  },
  desktopMenu: {
    display: 'flex',
    gap: '24px',
  },
  navLink: {
    background: 'none',
    border: 'none',
    color: 'hsl(var(--text-secondary))',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '6px 0',
    position: 'relative',
    transition: 'color 0.2s ease'
  },
  activeNavLink: {
    background: 'none',
    border: 'none',
    color: 'hsl(var(--primary))',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '6px 0',
    transition: 'color 0.2s ease',
    textShadow: '0 0 10px var(--border-glow)'
  },
  socialShortcuts: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  mobileMenuButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'hsl(var(--text-primary))',
    cursor: 'pointer',
  },
  mobileDropdown: {
    position: 'absolute',
    top: '70px',
    left: 0,
    width: '100%',
    backgroundColor: 'hsl(var(--bg-deep))',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 24px 24px 24px',
    gap: '16px',
    zIndex: 999
  },
  mobileLink: {
    background: 'none',
    border: 'none',
    color: 'hsl(var(--text-secondary))',
    fontSize: '1rem',
    fontFamily: "'Outfit', sans-serif",
    textAlign: 'left',
    padding: '8px 0',
    cursor: 'pointer'
  },
  mobileActiveLink: {
    background: 'none',
    border: 'none',
    color: 'hsl(var(--primary))',
    fontSize: '1.05rem',
    fontWeight: '600',
    fontFamily: "'Outfit', sans-serif",
    textAlign: 'left',
    padding: '8px 0',
    cursor: 'pointer'
  },
  mobileSocialRow: {
    display: 'flex',
    gap: '20px',
    marginTop: '8px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px'
  }
};
// Add manual media queries support in React style definitions by using a utility or plain selector overrides.
// We will write raw media overrides in index.css as it is cleaner for layout responsive issues.
// Let's add them to index.css if needed, or handle it via classNames. We already have class rules in CSS,
// and we can also add helper classes for desktop/mobile. We will add navigation selectors to src/index.css for complete safety.
