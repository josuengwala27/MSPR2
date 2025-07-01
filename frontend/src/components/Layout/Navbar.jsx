import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Navigation principale">
      <div className="navbar-container">
        {/* Logo et titre */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link" aria-label="Accueil - OMS COVID & MPOX">
            <div className="logo">
              <span className="logo-icon">🦠</span>
              <span className="logo-text">OMS COVID & MPOX</span>
            </div>
          </Link>
        </div>

        {/* Menu burger pour mobile */}
        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="navbar-menu"
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Menu de navigation */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`} id="navbar-menu">
          <ul className="navbar-nav" role="menubar">
            <li className="nav-item" role="none">
              <Link 
                to="/" 
                className={isActive('/')}
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
            
            <li className="nav-item" role="none">
              <Link 
                to="/predictions/rt" 
                className={isActive('/predictions/rt')}
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                Prédiction Rt
              </Link>
            </li>
            
            <li className="nav-item" role="none">
              <Link 
                to="/predictions/mortality" 
                className={isActive('/predictions/mortality')}
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                Mortalité
              </Link>
            </li>
            
            <li className="nav-item" role="none">
              <Link 
                to="/predictions/spread" 
                className={isActive('/predictions/spread')}
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                Propagation
              </Link>
            </li>
            
            <li className="nav-item" role="none">
              <Link 
                to="/about" 
                className={isActive('/about')}
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                À Propos
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 