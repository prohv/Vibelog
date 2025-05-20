import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} Vibelog. All rights reserved.
    </footer>
  );
};

export default Footer;