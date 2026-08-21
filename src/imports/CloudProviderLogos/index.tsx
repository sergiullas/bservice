import svgPaths from "./svg-8kehzgdago";

function Group() {
  return (
    <div className="absolute inset-[9.77%_0_9.84%_0]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" height="18.4896" preserveAspectRatio="none" viewBox="0 0 23 18.4896" width="23">
        <g id="Group">
          <path d={svgPaths.p27030000} fill="#EA4335" id="Vector" />
          <path d={svgPaths.p1720e280} fill="#4285F4" id="Vector_2" />
          <path d={svgPaths.p2fdf3c00} fill="#34A853" id="Vector_3" />
          <path d={svgPaths.p2b812200} fill="#FBBC05" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

function GoogleCloud() {
  return (
    <div className="absolute left-[65px] overflow-clip size-[23px] top-[108px]" data-name="google-cloud 1">
      <Group />
    </div>
  );
}

function MicrosoftAzure() {
  return (
    <div className="absolute left-[67px] size-[18px] top-[147px]" data-name="Microsoft_Azure 1">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="Microsoft_Azure 1">
          <path d={svgPaths.p3918e400} fill="url(#paint0_linear_0_9)" id="Vector" />
          <path d={svgPaths.p37627780} fill="#0078D4" id="Vector_2" />
          <path d={svgPaths.p3049c280} fill="url(#paint1_linear_0_9)" id="Vector_3" />
          <path d={svgPaths.p1fb08400} fill="url(#paint2_linear_0_9)" id="Vector_4" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_0_9" x1="8.03025" x2="2.96006" y1="2.379" y2="17.3576">
            <stop stopColor="#114A8B" />
            <stop offset="1" stopColor="#0669BC" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_0_9" x1="9.61406" x2="8.44125" y1="9.35944" y2="9.756">
            <stop stopOpacity="0.3" />
            <stop offset="0.071" stopOpacity="0.2" />
            <stop offset="0.321" stopOpacity="0.1" />
            <stop offset="0.623" stopOpacity="0.05" />
            <stop offset="1" stopOpacity="0" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_0_9" x1="8.96906" x2="14.5346" y1="1.94213" y2="16.7698">
            <stop stopColor="#3CCBF4" />
            <stop offset="1" stopColor="#2892DF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[9.77%_0_9.84%_0]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" height="643.117" preserveAspectRatio="none" viewBox="0 0 800 643.117" width="800">
        <g id="Group">
          <path d={svgPaths.p1a102580} fill="#EA4335" id="Vector" />
          <path d={svgPaths.pdf3db00} fill="#4285F4" id="Vector_2" />
          <path d={svgPaths.p29bc1700} fill="#34A853" id="Vector_3" />
          <path d={svgPaths.p3618d300} fill="#FBBC05" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

function GoogleCloud1() {
  return (
    <div className="absolute left-[-59px] overflow-clip size-[800px] top-[-166px]" data-name="google-cloud 1">
      <Group1 />
    </div>
  );
}

export default function CloudProviderLogos() {
  return (
    <div className="bg-white relative size-full" data-name="cloud-provider-logos">
      <div className="absolute h-[16px] left-[61px] top-[62px] w-[27px]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 27 16" width="27">
          <path d={svgPaths.p31437000} fill="black" id="Vector" />
        </svg>
      </div>
      <GoogleCloud />
      <MicrosoftAzure />
      <GoogleCloud1 />
    </div>
  );
}