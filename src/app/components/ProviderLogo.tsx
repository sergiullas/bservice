import React from 'react';
import svgPaths from '../assets/CloudProviderLogos/svg-8kehzgdago';

export function AwsLogo({ size = 24 }: { size?: number }) {
  const h = Math.round(size * (16 / 27));
  return (
    <svg fill="none" height={h} viewBox="0 0 27 16" width={size}>
      <path d={svgPaths.p31437000} fill="#232F3E" />
    </svg>
  );
}

export function GoogleCloudLogo({ size = 22 }: { size?: number }) {
  const h = Math.round(size * (18.4896 / 23));
  return (
    <svg fill="none" height={h} viewBox="0 0 23 18.4896" width={size}>
      <path d={svgPaths.p27030000} fill="#EA4335" />
      <path d={svgPaths.p1720e280} fill="#4285F4" />
      <path d={svgPaths.p2fdf3c00} fill="#34A853" />
      <path d={svgPaths.p2b812200} fill="#FBBC05" />
    </svg>
  );
}

// Each Azure instance gets its own gradient IDs to avoid SVG defs conflicts.
let _azureCounter = 0;
export function AzureLogo({ size = 20 }: { size?: number }) {
  const [uid] = React.useState(() => `az${++_azureCounter}`);
  return (
    <svg fill="none" height={size} viewBox="0 0 18 18" width={size}>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id={`${uid}-a`} x1="8.03025" x2="2.96006" y1="2.379" y2="17.3576">
          <stop stopColor="#114A8B" />
          <stop offset="1" stopColor="#0669BC" />
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" id={`${uid}-b`} x1="9.61406" x2="8.44125" y1="9.35944" y2="9.756">
          <stop stopOpacity="0.3" />
          <stop offset="0.071" stopOpacity="0.2" />
          <stop offset="0.321" stopOpacity="0.1" />
          <stop offset="0.623" stopOpacity="0.05" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" id={`${uid}-c`} x1="8.96906" x2="14.5346" y1="1.94213" y2="16.7698">
          <stop stopColor="#3CCBF4" />
          <stop offset="1" stopColor="#2892DF" />
        </linearGradient>
      </defs>
      <path d={svgPaths.p3918e400} fill={`url(#${uid}-a)`} />
      <path d={svgPaths.p37627780} fill="#0078D4" />
      <path d={svgPaths.p3049c280} fill={`url(#${uid}-b)`} />
      <path d={svgPaths.p1fb08400} fill={`url(#${uid}-c)`} />
    </svg>
  );
}
