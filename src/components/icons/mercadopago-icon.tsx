
import * as React from "react";
import { CreditCard } from "lucide-react";

export default function MercadoPagoIcon(props: React.SVGProps<SVGSVGElement>) {
  // Using a generic icon as a placeholder. For a real app, you'd use the actual Mercado Pago SVG logo.
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 2C9.25 2 7 4.25 7 7C7 9.75 9.25 12 12 12C14.75 12 17 9.75 17 7C17 4.25 14.75 2 12 2ZM12 10C10.34 10 9 8.66 9 7C9 5.34 10.34 4 12 4C13.66 4 15 5.34 15 7C15 8.66 13.66 10 12 10Z"
        fill="#009EE3"
      />
      <path
        d="M12 14C8.13 14 5 17.13 5 21H19C19 17.13 15.87 14 12 14ZM12 20C10.9 20 10 19.1 10 18C10 16.9 10.9 16 12 16C13.1 16 14 16.9 14 18C14 19.1 13.1 20 12 20Z"
        fill="#009EE3"
      />
    </svg>
  );
}
