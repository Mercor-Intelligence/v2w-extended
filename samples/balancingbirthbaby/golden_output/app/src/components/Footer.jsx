import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col footer-brand">
          <img src="/assets/images/balancing-birth-baby-white-300x78.jpg" alt="Balancing Birth to Baby" />
          <p>Childbirth education & doula services in the Waterloo Region. Supporting families from pregnancy through postpartum.</p>
        </div>
        <div className="footer-col">
          <h5>Services</h5>
          <ul>
            <li><Link to="/doula/birth">Doula</Link></li>
            <li><Link to="/classes/prenatal">Classes</Link></li>
            <li><Link to="/birth-coaching">Birth Coaching</Link></li>
            <li><Link to="/shop">Shop</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Resources</h5>
          <ul>
            <li><Link to="/blog">Blog</Link></li>
            <li><a href="#careers">Careers</a></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/classes/calendar">Class Calendar</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Legal</h5>
          <ul>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#refund">Refund Policy</a></li>
            <li><a href="#terms">Terms & Conditions</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Social</h5>
          <ul className="social-list">
            <li><a href="#facebook" aria-label="Facebook">Facebook</a></li>
            <li><a href="#instagram" aria-label="Instagram">Instagram</a></li>
            <li><a href="#twitter" aria-label="Twitter">Twitter</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Balancing Birth to Baby. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
