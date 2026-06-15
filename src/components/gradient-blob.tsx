import Image from 'next/image';

type SVGPropsType = React.SVGProps<SVGSVGElement>;

export function GradientBlob() {
  return (
    <div className="overflow-hidden">
      <Image
        src="/images/gen-glow.png"
        className="absolute bottom-0 w-full left-1/2 z-10 -translate-x-1/2 pointer-events-none"
        role="presentation"
        alt=""
        width={1200}
        height={240}
      />
    </div>
  );
}

export function GradientBlob2(props: SVGPropsType) {
  return (
    <svg
      width="930"
      height="760"
      viewBox="0 0 930 760"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g opacity="0.3" filter="url(#filter0_f_9248_10254)">
        <circle cx="380.335" cy="380.335" r="179.665" fill="#FF58D5" />
      </g>
      <g opacity="0.7" filter="url(#filter1_f_9248_10254)">
        <circle cx="549.665" cy="380.335" r="179.665" fill="#4E6EFF" />
      </g>
      <defs>
        <filter
          id="filter0_f_9248_10254"
          x="0.669922"
          y="0.6698"
          width="759.33"
          height="759.33"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="100"
            result="effect1_foregroundBlur_9248_10254"
          />
        </filter>
        <filter
          id="filter1_f_9248_10254"
          x="170"
          y="0.6698"
          width="759.33"
          height="759.33"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="100"
            result="effect1_foregroundBlur_9248_10254"
          />
        </filter>
      </defs>
    </svg>
  );
}
