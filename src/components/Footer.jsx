import React from 'react';

const Footer = () => {
  return (
    <footer className="text-center py-8 px-4 animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-neutral-muted text-sm">
          <span className="font-semibold">Asta Production</span>
        </div>
        <div className="h-[2px] w-28 bg-neutral-500"></div>
        <p className="text-neutral-muted text-xs">
          © 2025 All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;

