import * as React from "react";

function SvgComponent(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={40}
      height={40}
      viewBox="0 0 64 64"
      {...props}
    >
      {/* Background Frame */}
      <rect x="4" y="8" width="56" height="48" rx="4" fill="#0b093b" stroke="#f2b300" strokeWidth="2" />
      
      {/* X-ray Screen */}
      <rect x="10" y="16" width="44" height="32" rx="2" fill="#ffffff" />
      
      {/* Skeleton (Ribs & Spine) */}
      <line x1="32" y1="20" x2="32" y2="40" stroke="#0b093b" strokeWidth="2" />
      <circle cx="32" cy="16" r="4" fill="#0b093b" />
      <line x1="26" y1="24" x2="38" y2="24" stroke="#0b093b" strokeWidth="2" />
      <line x1="26" y1="28" x2="38" y2="28" stroke="#0b093b" strokeWidth="2" />
      <line x1="26" y1="32" x2="38" y2="32" stroke="#0b093b" strokeWidth="2" />
      <line x1="26" y1="36" x2="38" y2="36" stroke="#0b093b" strokeWidth="2" />
    </svg>
  );
}

export default SvgComponent;
    
