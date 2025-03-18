
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t py-2 px-4 text-center text-sm text-muted-foreground">
      <div className="container">
        <p>© {new Date().getFullYear()} TodosCal. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
