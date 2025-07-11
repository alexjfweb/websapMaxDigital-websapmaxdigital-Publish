import * as React from "react";

export default function NequiIcon(props: React.SVGProps<SVGSVGElement>) {
  // Simplified Nequi logo SVG
  return (
    <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#210049"/>
        <path d="M12.01 17.07L7.06 12.12L8.47 10.71L12.01 14.24L15.54 10.71L16.95 12.12L12.01 17.07Z" fill="white"/>
    </svg>
  );
}
