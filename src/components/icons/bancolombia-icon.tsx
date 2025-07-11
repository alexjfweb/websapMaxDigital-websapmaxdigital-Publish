
import * as React from "react";

export default function BancolombiaIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FFD700"/>
        <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="#005B9A"/>
        <path d="M2 7V17L12 12V2L2 7Z" fill="#FCD116"/>
        <path d="M22 7V17L12 12V2L22 7Z" fill="#CE1126"/>
    </svg>
  );
}
