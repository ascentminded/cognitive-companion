import React from 'react';
import { motion } from 'framer-motion';
import logo from '../images/logo_white.png';
import FloatingContact from './Floating_contact';
import '../App.css';

function Layout({ children }) {
  return (
    <div className="App">
      <header className="header">
        <div className="header-left">
          <a href="/"><img src={logo} alt="NB.ai Logo" className="header-logo" />NB.ai</a>
        </div>

        <div className="header-right">
          <a href="http://github.com/ascentminded/" target="_blank" rel="noopener noreferrer">other projects</a>
          <a href="./index.js">contact me </a>
        </div>
      </header>


      <main className="main">
        <motion.div
          className="page-box"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {children}

        </motion.div>
        
      </main>
      <FloatingContact /> 
    </div>
  );
}

export default Layout;