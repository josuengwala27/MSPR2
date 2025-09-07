import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import LanguageSelector from '../LanguageSelector';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="language-container">
        <LanguageSelector />
      </div>
      <main className="main-content" role="main">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 