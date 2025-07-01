import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
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