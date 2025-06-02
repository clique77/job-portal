import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import './Landing.scss';
import { useRef, useState, useEffect } from 'react';

const features = [
  {
    icon: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#e3eafe"/><path d="M24 14v20M14 24h20" stroke="#1a237e" strokeWidth="3" strokeLinecap="round"/></svg>
    ),
    title: 'Smart Search',
    desc: 'Find the perfect match with our advanced search algorithms',
  },
  {
    icon: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><rect x="8" y="16" width="32" height="24" rx="4" fill="#e3eafe"/><rect x="16" y="8" width="16" height="8" rx="2" fill="#c7d2fe"/><rect x="12" y="20" width="24" height="12" rx="2" fill="#fff" stroke="#1a237e" strokeWidth="2"/></svg>
    ),
    title: 'Verified Companies',
    desc: 'Work with trusted employers and verified job listings',
  },
  {
    icon: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><rect x="8" y="8" width="32" height="32" rx="8" fill="#e3eafe"/><rect x="16" y="16" width="16" height="16" rx="4" fill="#fff" stroke="#1a237e" strokeWidth="2"/></svg>
    ),
    title: 'Mobile Friendly',
    desc: 'Access opportunities on any device, anywhere',
  },
];

const aboutHeading = 'Welcome to Your Modern Job Portal';
const aboutText = `This platform is designed to make your job search and hiring process as smooth as possible. Whether you are looking for your next career move or searching for the perfect candidate, our portal offers a seamless, user-friendly experience.\n\nEnjoy advanced job search, easy applications, and a clean, distraction-free interface. We focus on privacy, speed, and accessibility, so you can focus on what matters most—finding the right fit.\n\nStart exploring opportunities or post your openings today. Your next step is just a click away!`;

function useTypewriter(text: string, speed = 30, start = true, delay = 0) {
  const [displayed, setDisplayed] = useState('');
  const i = useRef(0);
  useEffect(() => {
    if (!start) return;
    setDisplayed('');
    i.current = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i.current++;
        setDisplayed(text.slice(0, i.current));
        if (i.current >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, start, delay]);
  return displayed;
}

const Landing = () => {
  const { user } = useAuth();
  const heading = useTypewriter(aboutHeading, 12, true, 0);
  const showParagraph = heading.length === aboutHeading.length;
  const paragraph = useTypewriter(aboutText, 13, showParagraph, 400);

  return (
    <div className="landing-page">
      <motion.section className="hero-section" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <motion.div className="hero-content" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.7 }}>
          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}>
            Find Your Dream Job or Perfect Candidate
          </motion.h1>
          <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.7 }}>
            Connect with top employers and talented professionals in one place
          </motion.p>
          {!user && (
            <motion.div className="cta-buttons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
              <Link to="/jobs" className="cta-btn primary">Find Jobs</Link>
              <Link to="/registration" className="cta-btn secondary">Post a Job</Link>
            </motion.div>
          )}
        </motion.div>
        <motion.div className="hero-bg-anim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}>
          {/* Animated SVG background shapes */}
          <svg width="400" height="400" className="floating-shape shape1"><circle cx="200" cy="200" r="120" fill="#c7d2fe" opacity="0.18"/></svg>
          <svg width="200" height="200" className="floating-shape shape2"><rect x="40" y="40" width="120" height="120" rx="60" fill="#fff" opacity="0.12"/></svg>
        </motion.div>
      </motion.section>

      <section className="about-portal-section">
        <motion.div className="about-portal-content wide" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <div className="typewriter-container">
            <h2>
              <span className="typewriter-heading">{heading}</span>
              <span className="typewriter-cursor">{heading.length !== aboutHeading.length ? '|' : ''}</span>
            </h2>
            <div className="typewriter-paragraph-container">
              <p style={{ whiteSpace: 'pre-line', minHeight: '15em' }}>
                <span className="typewriter-paragraph">{paragraph}</span>
                <span className="typewriter-cursor">{showParagraph && paragraph.length !== aboutText.length ? '|' : ''}</span>
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="features-section">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
          Why Choose Our Platform
        </motion.h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              className="feature-card"
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing; 