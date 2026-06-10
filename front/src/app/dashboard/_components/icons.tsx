import type { ReactNode, SVGProps } from "react";

// Iconos de línea (24x24) portados del diseño de design-companion.
// Se renderizan con `stroke="currentColor"`, así heredan el color del contenedor.
export type IconName =
  | "home"
  | "people"
  | "calculator"
  | "gear"
  | "envelope"
  | "idcard"
  | "calendar"
  | "arrow"
  | "logout"
  | "hamburger";

const ICONS: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 4l9 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 20v-6h5v6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" strokeLinecap="round" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.8c2 .9 3.5 2.6 3.5 5.2" strokeLinecap="round" />
    </>
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8 7h8" strokeLinecap="round" />
      <path
        d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M8.5 18h7"
        strokeLinecap="round"
      />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path
        d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6"
        strokeLinecap="round"
      />
    </>
  ),
  envelope: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7 7.5 5.5L19.5 7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  idcard: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <circle cx="9" cy="11" r="2.2" />
      <path d="M6 16c.4-1.6 1.6-2.4 3-2.4s2.6.8 3 2.4" strokeLinecap="round" />
      <path d="M14.5 9.5h4M14.5 12.5h3" strokeLinecap="round" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />,
  logout: (
    <>
      <path
        d="M14 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16.5 8.5 20 12l-3.5 3.5M20 12H9.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  hamburger: <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />,
};

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} {...props}>
      {ICONS[name]}
    </svg>
  );
}

// Logo de marca: skyline universitario (siluetas de edificios).
export function Skyline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 28" fill="none" width="28" height="22" {...props}>
      <rect x="1" y="16" width="7" height="12" fill="white" opacity="0.9" rx="0.5" />
      <rect x="3" y="13" width="3" height="3" fill="white" opacity="0.9" rx="0.3" />
      <rect x="12" y="6" width="8" height="22" fill="white" rx="0.5" />
      <polygon points="16,1 12,6 20,6" fill="white" opacity="0.95" />
      <rect x="14" y="9" width="2" height="2.5" fill="#002e6b" opacity="0.35" rx="0.2" />
      <rect x="14" y="13.5" width="2" height="2.5" fill="#002e6b" opacity="0.35" rx="0.2" />
      <rect x="14" y="18" width="2" height="2.5" fill="#002e6b" opacity="0.35" rx="0.2" />
      <rect x="23" y="11" width="7" height="17" fill="white" opacity="0.85" rx="0.5" />
      <rect x="25" y="8.5" width="3" height="2.5" fill="white" opacity="0.85" rx="0.3" />
      <rect x="31" y="18" width="5" height="10" fill="white" opacity="0.75" rx="0.5" />
      <line x1="0" y1="28" x2="36" y2="28" stroke="white" strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
}
