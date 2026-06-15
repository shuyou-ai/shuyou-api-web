type IconProps = React.SVGProps<SVGSVGElement>;

export function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
    >
      <path
        d="M13.4017 5.2793L6.12172 12.5593L2.59839 9.036"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-xl text-current"
    >
      <g clipPath="url(#clip0_9283_3101)">
        <path
          d="M11 11.9194V5.91943H13V11.9194H19V13.9194H13V19.9194H11V13.9194H5V11.9194H11Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_9283_3101">
          <rect
            width="24"
            height="24"
            fill="currentColor"
            transform="translate(0 0.919434)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export function MinusIcon() {
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-xl text-gray-400"
    >
      <g clipPath="url(#clip0_9283_3094)">
        <path d="M5 11.9194V13.9194H19V11.9194H5Z" fill="currentColor" />
      </g>
      <defs>
        <clipPath id="clip0_9283_3094">
          <rect
            width="24"
            height="24"
            fill="currentColor"
            transform="translate(0 0.919434)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export function TextGeneratorIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="42"
      height="42"
      viewBox="0 0 42 42"
      fill="none"
    >
      <g filter="url(#filter0_d_11466_4983)">
        <g filter="url(#filter1_i_11466_4983)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.65016 30.069L8.65172 30.0672L8.66373 30.0529C8.67509 30.0393 8.69298 30.0176 8.71661 29.9884C8.76388 29.9299 8.83392 29.8415 8.92024 29.727C9.09325 29.4974 9.32961 29.166 9.57857 28.7639C10.0262 28.041 10.4852 27.1362 10.7156 26.2116C9.27786 24.168 8.43335 21.6756 8.43335 18.9882C8.43335 12.0479 14.0596 6.42157 21 6.42157C27.9404 6.42157 33.5667 12.0479 33.5667 18.9882C33.5667 25.9286 27.9404 31.5549 21 31.5549C19.4278 31.5549 17.9211 31.2657 16.5317 30.737C15.1235 31.2652 13.374 31.4628 12.0023 31.5368C11.2414 31.5779 10.5659 31.5822 10.0802 31.5763C9.83698 31.5733 9.6405 31.5678 9.50367 31.5629C9.43523 31.5605 9.38166 31.5582 9.34455 31.5565L9.30143 31.5545L9.2895 31.5539L9.28489 31.5536L9.33335 30.6549C9.28419 31.5536 9.28489 31.5536 9.28489 31.5536C8.94277 31.5349 8.64025 31.3235 8.50567 31.0084C8.37122 30.6936 8.42761 30.3291 8.65016 30.069ZM15.1666 17.4885C14.3381 17.4885 13.6666 18.16 13.6666 18.9885C13.6666 19.8169 14.3381 20.4885 15.1666 20.4885H15.1799C16.0083 20.4885 16.6799 19.8169 16.6799 18.9885C16.6799 18.16 16.0083 17.4885 15.1799 17.4885H15.1666ZM20.9999 17.4885C20.1715 17.4885 19.4999 18.16 19.4999 18.9885C19.4999 19.8169 20.1715 20.4885 20.9999 20.4885H21.0132C21.8417 20.4885 22.5132 19.8169 22.5132 18.9885C22.5132 18.16 21.8417 17.4885 21.0132 17.4885H20.9999ZM26.8332 17.4885C26.0048 17.4885 25.3332 18.16 25.3332 18.9885C25.3332 19.8169 26.0048 20.4885 26.8332 20.4885H26.8466C27.675 20.4885 28.3466 19.8169 28.3466 18.9885C28.3466 18.16 27.675 17.4885 26.8466 17.4885H26.8332Z"
            fill="url(#paint0_radial_11466_4983)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_11466_4983"
          x="-3"
          y="-3"
          width="48"
          height="48"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.498039 0 0 0 0 0.407843 0 0 0 0 1 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_11466_4983"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_11466_4983"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_i_11466_4983"
          x="8.43335"
          y="6.42157"
          width="26.6571"
          height="26.6807"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="1.52381" dy="1.52381" />
          <feGaussianBlur stdDeviation="1.14286" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_11466_4983"
          />
        </filter>
        <radialGradient
          id="paint0_radial_11466_4983"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(22.0839 27.1287) rotate(-60.1772) scale(24.8321 24.8204)"
        >
          <stop stopColor="#7F68FF" />
          <stop offset="1" stopColor="#BEB2FF" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ImageGeneratorIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
    >
      <g filter="url(#filter0_d_9279_147)">
        <g filter="url(#filter1_i_9279_147)">
          <path
            d="M13.6522 10.124C12.8594 10.124 12.2166 10.7667 12.2166 11.5596C12.2166 12.3524 12.8594 12.9951 13.6522 12.9951C14.445 12.9951 15.0877 12.3524 15.0877 11.5596C15.0877 10.7667 14.445 10.124 13.6522 10.124Z"
            fill="url(#paint0_radial_9279_147)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 6.4375C10.0325 6.4375 8.4375 8.03249 8.4375 10V20C8.4375 21.9675 10.0325 23.5625 12 23.5625H22C23.9675 23.5625 25.5625 21.9675 25.5625 20V10C25.5625 8.03249 23.9675 6.4375 22 6.4375H12ZM9.5625 10C9.5625 8.65381 10.6538 7.5625 12 7.5625H22C23.3462 7.5625 24.4375 8.65381 24.4375 10V12.5688C23.8719 12.4375 23.2829 12.3681 22.6783 12.3681C19.4925 12.3681 16.7568 14.29 15.5652 17.0367C14.629 16.121 13.3471 15.5556 11.933 15.5556C11.0795 15.5556 10.2734 15.7619 9.5625 16.127V10Z"
            fill="url(#paint1_radial_9279_147)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_9279_147"
          x="-3"
          y="-3"
          width="40"
          height="40"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.435294 0 0 0 0 0.345098 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_9279_147"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_9279_147"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_i_9279_147"
          x="8.4375"
          y="6.4375"
          width="18.6488"
          height="18.6488"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="1.52381" dy="1.52381" />
          <feGaussianBlur stdDeviation="1.14286" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_9279_147"
          />
        </filter>
        <radialGradient
          id="paint0_radial_9279_147"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(13.9454 22.1904) rotate(-58.7716) scale(25.6788 25.6788)"
        >
          <stop stopColor="#FF6F58" />
          <stop offset="1" stopColor="#FFA293" />
        </radialGradient>
        <radialGradient
          id="paint1_radial_9279_147"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(13.9454 22.1904) rotate(-58.7716) scale(25.6788 25.6788)"
        >
          <stop stopColor="#FF6F58" />
          <stop offset="1" stopColor="#FFA293" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function CodeGeneratorIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
    >
      <g filter="url(#filter0_d_9279_150)">
        <g filter="url(#filter1_i_9279_150)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.4375 10C8.4375 8.03249 10.0325 6.4375 12 6.4375H22C23.9675 6.4375 25.5625 8.03249 25.5625 10V20C25.5625 21.9675 23.9675 23.5625 22 23.5625H12C10.0325 23.5625 8.4375 21.9675 8.4375 20V10ZM18.4373 11.123C18.5047 10.8197 18.3134 10.5193 18.0102 10.4519C17.7069 10.3845 17.4065 10.5757 17.3391 10.879L15.5618 18.8766C15.4944 19.1798 15.6856 19.4803 15.9889 19.5477C16.2922 19.6151 16.5926 19.4239 16.66 19.1206L18.4373 11.123ZM20.2665 12.8471C20.0469 12.6275 19.6907 12.6274 19.471 12.8471C19.2513 13.0668 19.2513 13.4229 19.471 13.6426L20.8282 14.9999L19.471 16.357C19.2513 16.5767 19.2513 16.9329 19.471 17.1525C19.6907 17.3722 20.0468 17.3722 20.2665 17.1525L22.0214 15.3977C22.241 15.178 22.241 14.8219 22.0214 14.6022L20.2665 12.8471ZM14.5224 13.6494C14.742 13.4297 14.742 13.0736 14.5223 12.8539C14.3027 12.6343 13.9465 12.6343 13.7268 12.854L11.9788 14.6022C11.7591 14.8219 11.7591 15.178 11.9788 15.3977L13.7269 17.1457C13.9465 17.3654 14.3027 17.3654 14.5224 17.1457C14.742 16.926 14.742 16.5699 14.5224 16.3502L13.172 14.9999L14.5224 13.6494Z"
            fill="url(#paint0_radial_9279_150)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_9279_150"
          x="-3"
          y="-3"
          width="40"
          height="40"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0901961 0 0 0 0 0.654902 0 0 0 0 1 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_9279_150"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_9279_150"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_i_9279_150"
          x="8.4375"
          y="6.4375"
          width="18.125"
          height="18.125"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="1" dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_9279_150"
          />
        </filter>
        <radialGradient
          id="paint0_radial_9279_150"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(17.7385 20.5335) rotate(-60.1541) scale(16.9079 16.9079)"
        >
          <stop stopColor="#17A7FF" />
          <stop offset="1" stopColor="#84D0FF" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function VideoGeneratorIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="38"
      height="32"
      viewBox="0 0 38 32"
      fill="none"
    >
      <g filter="url(#filter0_d_9279_153)">
        <g filter="url(#filter1_i_9279_153)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.875 10.1305C8.875 8.10037 10.5208 6.45459 12.551 6.45459H25.449C27.4792 6.45459 29.125 8.10037 29.125 10.1305V17.8694C29.125 19.8996 27.4792 21.5454 25.449 21.5454H12.551C10.5208 21.5454 8.875 19.8996 8.875 17.8694V10.1305ZM21.8102 13.429C22.227 13.6955 22.227 14.3043 21.8102 14.5708L18.0934 16.9471C17.6424 17.2355 17.0509 16.9116 17.0509 16.3762V11.6236C17.0509 11.0882 17.6424 10.7643 18.0934 11.0527L21.8102 13.429Z"
            fill="url(#paint0_radial_9279_153)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_9279_153"
          x="-1"
          y="-4"
          width="40"
          height="40"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.67451 0 0 0 0 0.0980392 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_9279_153"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_9279_153"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_i_9279_153"
          x="8.875"
          y="6.45459"
          width="21.7738"
          height="16.6146"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="1.52381" dy="1.52381" />
          <feGaussianBlur stdDeviation="1.14286" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_9279_153"
          />
        </filter>
        <radialGradient
          id="paint0_radial_9279_153"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(19.8733 18.8761) rotate(-52.4062) scale(16.3099 18.2642)"
        >
          <stop stopColor="#FFAC19" />
          <stop offset="1" stopColor="#FFCE78" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function EmailGeneratorIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="32"
      viewBox="0 0 36 32"
      fill="none"
    >
      <g filter="url(#filter0_d_9279_160)">
        <g filter="url(#filter1_i_9279_160)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 10.1784C8 8.17331 9.62546 6.54785 11.6306 6.54785H24.3694C26.3745 6.54785 28 8.17332 28 10.1784V17.8217C28 19.8268 26.3745 21.4523 24.3694 21.4523H11.6306C9.62546 21.4523 8 19.8268 8 17.8217V10.1784ZM12.3775 10.6036C12.1178 10.4225 11.7605 10.4862 11.5794 10.7459C11.3983 11.0056 11.462 11.3629 11.7217 11.544L16.7981 15.0839C17.5204 15.5877 18.4803 15.5877 19.2026 15.0839L24.279 11.544C24.5387 11.3629 24.6024 11.0056 24.4213 10.7459C24.2402 10.4862 23.8829 10.4225 23.6232 10.6036L18.5468 14.1435C18.2185 14.3725 17.7822 14.3725 17.4539 14.1435L12.3775 10.6036Z"
            fill="url(#paint0_radial_9279_160)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_9279_160"
          x="-2"
          y="-4"
          width="40"
          height="40"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.168627 0 0 0 0 0.811765 0 0 0 0 1 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_9279_160"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_9279_160"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_i_9279_160"
          x="8"
          y="6.54785"
          width="21.5238"
          height="16.4284"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="1.52381" dy="1.52381" />
          <feGaussianBlur stdDeviation="1.14286" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_9279_160"
          />
        </filter>
        <radialGradient
          id="paint0_radial_9279_160"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(18.8625 18.816) rotate(-52.4062) scale(16.1086 18.0387)"
        >
          <stop stopColor="#2BCFFF" />
          <stop offset="1" stopColor="#8EE5FF" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function CheckIconSm() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.0002 13.862C7.23361 13.862 4.86803 12.1373 3.92328 9.7025C4.86804 7.2677 7.23361 5.54306 10.0002 5.54306C12.7667 5.54306 15.1323 7.26771 16.0771 9.70252C15.1323 12.1373 12.7667 13.862 10.0002 13.862ZM10.0002 4.04306C6.48191 4.04306 3.49489 6.30927 2.4155 9.45939C2.3615 9.61697 2.3615 9.78803 2.41549 9.94561C3.49488 13.0957 6.48191 15.362 10.0002 15.362C13.5184 15.362 16.5055 13.0958 17.5849 9.94564C17.6389 9.78806 17.6389 9.61699 17.5849 9.45941C16.5055 6.30928 13.5184 4.04306 10.0002 4.04306ZM9.99151 7.84422C8.96527 7.84422 8.13333 8.67616 8.13333 9.7024C8.13333 10.7286 8.96527 11.5606 9.99151 11.5606H10.0064C11.0326 11.5606 11.8646 10.7286 11.8646 9.7024C11.8646 8.67616 11.0326 7.84422 10.0064 7.84422H9.99151Z"
        fill="currentColor"
      />
    </svg>
  );
}
export function EyeCloseIcon() {
  return (
    <svg
      x-show="showPassword"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212ZM16.0771 9.70249C15.7843 10.4569 15.3552 11.1432 14.8199 11.7311L15.8813 12.7925C16.6329 11.9813 17.2187 11.0143 17.5849 9.94561C17.6389 9.78803 17.6389 9.61696 17.5849 9.45938C16.5055 6.30925 13.5184 4.04303 10.0002 4.04303C9.13525 4.04303 8.30244 4.17999 7.52218 4.43338L8.75139 5.66259C9.1556 5.58413 9.57311 5.54303 10.0002 5.54303C12.7667 5.54303 15.1323 7.26768 16.0771 9.70249Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg
      width={24}
      height={24}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg
      width={24}
      height={24}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.75211 6.7963C8.75211 5.3555 9.92011 4.1875 11.3609 4.1875C12.8017 4.1875 13.9697 5.3555 13.9697 6.7963C13.9697 8.2371 12.8017 9.4051 11.3609 9.4051C9.92011 9.4051 8.75211 8.2371 8.75211 6.7963ZM11.3609 2.6875C9.09168 2.6875 7.25211 4.52707 7.25211 6.7963C7.25211 9.06553 9.09168 10.9051 11.3609 10.9051C13.6301 10.9051 15.4697 9.06553 15.4697 6.7963C15.4697 4.52707 13.6301 2.6875 11.3609 2.6875ZM9.81431 12.208C6.38418 12.208 3.60352 14.9887 3.60352 18.4188V18.7367C3.60352 19.1509 3.9393 19.4867 4.35352 19.4867C4.76773 19.4867 5.10352 19.1509 5.10352 18.7367V18.4188C5.10352 15.8171 7.21261 13.708 9.81431 13.708H12.9088C15.5105 13.708 17.6196 15.8171 17.6196 18.4188V18.7367C17.6196 19.1509 17.9554 19.4867 18.3696 19.4867C18.7838 19.4867 19.1196 19.1509 19.1196 18.7367V18.4188C19.1196 14.9887 16.3389 12.208 12.9088 12.208H9.81431Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.61304 3.27092L12.3927 3.27092C12.7295 3.27092 13.0027 3.54406 13.0027 3.88104C13.0027 5.50501 14.7607 6.52057 16.1675 5.7084C16.4591 5.54 16.8321 5.63994 17.0005 5.93161L18.3905 8.33918C18.559 8.63101 18.459 9.00417 18.1672 9.17266C16.7604 9.98485 16.7604 12.0153 18.1672 12.8275C18.459 12.996 18.559 13.3692 18.3905 13.661L17.0005 16.0686C16.8321 16.3603 16.4591 16.4602 16.1674 16.2918C14.7607 15.4796 13.0027 16.4952 13.0027 18.1192C13.0027 18.4561 12.7295 18.7293 12.3927 18.7293H9.61303C9.27596 18.7293 9.00271 18.456 9.00271 18.1189C9.00271 16.4942 7.2438 15.4793 5.83708 16.2915C5.54502 16.4601 5.17158 16.36 5.00304 16.0681L3.61337 13.6611C3.44488 13.3692 3.54487 12.9961 3.83671 12.8276C5.2435 12.0154 5.24347 9.98484 3.8367 9.17264C3.54485 9.00414 3.44486 8.63095 3.61335 8.33911L5.00301 5.93215C5.17156 5.64022 5.545 5.54012 5.83706 5.70875C7.24379 6.52092 9.00271 5.50595 9.00271 3.88125C9.00271 3.54417 9.27597 3.27092 9.61304 3.27092ZM12.3927 1.77092L9.61304 1.77092C8.44754 1.77092 7.50271 2.71575 7.50271 3.88125C7.50271 4.3509 6.9941 4.64471 6.58706 4.40971C5.57769 3.82695 4.28681 4.17265 3.70397 5.18215L2.31431 7.58911C1.7316 8.5984 2.07742 9.88897 3.0867 10.4717C3.49349 10.7065 3.49348 11.2937 3.08671 11.5285C2.07743 12.1112 1.73162 13.4018 2.31433 14.4111L3.704 16.8181C4.28684 17.8276 5.57772 18.1732 6.58708 17.5905C6.99411 17.3555 7.50271 17.6493 7.50271 18.1189C7.50271 19.2844 8.44753 20.2293 9.61303 20.2293H12.3927C13.5581 20.2293 14.5027 19.2844 14.5027 18.1192C14.5027 17.6495 15.0111 17.3562 15.4174 17.5908C16.4266 18.1735 17.7169 17.8277 18.2995 16.8186L19.6895 14.411C20.2722 13.4017 19.9264 12.1112 18.9172 11.5285C18.5104 11.2937 18.5104 10.7066 18.9172 10.4717C19.9264 9.889 20.2723 8.59845 19.6896 7.58918L18.2995 5.18161C17.7169 4.1725 16.4266 3.82675 15.4175 4.40936C15.0111 4.644 14.5027 4.35067 14.5027 3.88104C14.5027 2.71579 13.5581 1.77092 12.3927 1.77092ZM8.92395 11C8.92395 9.85242 9.85427 8.9221 11.0019 8.9221C12.1495 8.9221 13.0798 9.85242 13.0798 11C13.0798 12.1476 12.1495 13.0779 11.0019 13.0779C9.85427 13.0779 8.92395 12.1476 8.92395 11ZM11.0019 7.4221C9.02584 7.4221 7.42395 9.02399 7.42395 11C7.42395 12.976 9.02584 14.5779 11.0019 14.5779C12.9779 14.5779 14.5798 12.976 14.5798 11C14.5798 9.02399 12.9779 7.4221 11.0019 7.4221Z"
        fill="currentColor"
      />
    </svg>
  );
}
export function InfoIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.27148 11C3.27148 6.7313 6.73195 3.27083 11.0007 3.27083C15.2694 3.27083 18.7298 6.7313 18.7298 11C18.7298 15.2687 15.2694 18.7292 11.0007 18.7292C6.73195 18.7292 3.27148 15.2687 3.27148 11ZM11.0007 1.77083C5.90352 1.77083 1.77148 5.90287 1.77148 11C1.77148 16.0971 5.90352 20.2292 11.0007 20.2292C16.0978 20.2292 20.2298 16.0971 20.2298 11C20.2298 5.90287 16.0978 1.77083 11.0007 1.77083ZM10 7.94734C10 8.49962 10.4478 8.94734 11 8.94734H11.0008C11.5531 8.94734 12.0008 8.49962 12.0008 7.94734C12.0008 7.39505 11.5531 6.94734 11.0008 6.94734H11C10.4478 6.94734 10 7.39505 10 7.94734ZM11 15.3214C10.5858 15.3214 10.25 14.9856 10.25 14.5714L10.25 10.699C10.25 10.2848 10.5858 9.94902 11 9.94902C11.4143 9.94902 11.75 10.2848 11.75 10.699L11.75 14.5714C11.75 14.9856 11.4143 15.3214 11 15.3214Z"
        fill="currentColor"
      />
    </svg>
  );
}
export function LogOutIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.9679 17.5805C13.5537 17.5805 13.2179 17.2448 13.2179 16.8305L13.2179 13.2454L11.7179 13.2454L11.7179 16.8305C11.7179 18.0732 12.7253 19.0805 13.9679 19.0805H16.8346C18.0773 19.0805 19.0846 18.0732 19.0846 16.8305V5.16309C19.0846 3.92045 18.0773 2.91309 16.8346 2.91309L13.9679 2.91309C12.7253 2.91309 11.7179 3.92045 11.7179 5.16309V8.74543L13.2179 8.74542V5.16309C13.2179 4.74887 13.5537 4.41309 13.9679 4.41309L16.8346 4.41309C17.2488 4.41309 17.5846 4.74887 17.5846 5.16309V16.8305C17.5846 17.2448 17.2488 17.5805 16.8346 17.5805H13.9679ZM2.91797 10.9986C2.91797 11.2142 3.00896 11.4086 3.15464 11.5454L7.37668 15.7701C7.66948 16.0631 8.14436 16.0632 8.43734 15.7704C8.73033 15.4776 8.73048 15.0028 8.43768 14.7098L5.47835 11.7486H14.668C15.0822 11.7486 15.418 11.4128 15.418 10.9986C15.418 10.5844 15.0822 10.2486 14.668 10.2486L5.48212 10.2486L8.4377 7.29092C8.73049 6.99793 8.73032 6.52306 8.43733 6.23026C8.14433 5.93747 7.66946 5.93764 7.37667 6.23064L3.18798 10.4223C3.02297 10.5598 2.91797 10.7669 2.91797 10.9986Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
export function MoreVerticalIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.74561 4.5C7.74561 3.80964 8.30525 3.25 8.99561 3.25H9.00311C9.69346 3.25 10.2531 3.80964 10.2531 4.5C10.2531 5.19036 9.69346 5.75 9.00311 5.75H8.99561C8.30525 5.75 7.74561 5.19036 7.74561 4.5ZM7.74561 13.5C7.74561 12.8096 8.30525 12.25 8.99561 12.25H9.00311C9.69346 12.25 10.2531 12.8096 10.2531 13.5C10.2531 14.1904 9.69346 14.75 9.00311 14.75H8.99561C8.30525 14.75 7.74561 14.1904 7.74561 13.5ZM8.99561 7.75C8.30525 7.75 7.74561 8.30964 7.74561 9C7.74561 9.69036 8.30525 10.25 8.99561 10.25H9.00311C9.69346 10.25 10.2531 9.69036 10.2531 9C10.2531 8.30964 9.69346 7.75 9.00311 7.75H8.99561Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.85442 4.12576C5.85442 3.83581 6.08947 3.60076 6.37942 3.60076H13.8739C14.1638 3.60076 14.3989 3.83581 14.3989 4.12576L14.3989 11.6217C14.3989 11.9117 14.1638 12.1467 13.8739 12.1467H6.37942C6.08947 12.1467 5.85442 11.9117 5.85442 11.6217V4.12576ZM6.37942 2.40076C5.42673 2.40076 4.65442 3.17307 4.65442 4.12576V4.65991H4.12649C3.1738 4.65991 2.40149 5.43222 2.40149 6.38491V13.8747C2.40149 14.8273 3.1738 15.5997 4.12649 15.5997H11.6162C12.5689 15.5997 13.3412 14.8273 13.3412 13.8747V13.3467H13.8739C14.8266 13.3467 15.5989 12.5744 15.5989 11.6217L15.5989 4.12575C15.5989 3.17306 14.8266 2.40076 13.8739 2.40076H6.37942ZM12.1412 13.3467H6.37942C5.42673 13.3467 4.65442 12.5744 4.65442 11.6217V5.85991H4.12649C3.83654 5.85991 3.60149 6.09496 3.60149 6.38491V13.8747C3.60149 14.1646 3.83654 14.3997 4.12649 14.3997H11.6162C11.9062 14.3997 12.1412 14.1646 12.1412 13.8747L12.1412 13.3467Z"
        fill="#98A2B3"
      />
    </svg>
  );
}

export function ThumbsUpIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <path
        d="M6.14116 6.74646C6.14116 6.45637 6.25322 6.1775 6.45393 5.96807L9.77187 2.50587C9.9492 2.32082 10.1944 2.21619 10.4507 2.21619C11.0537 2.21619 11.5008 2.77574 11.3678 3.36386L10.7049 6.29443H14.8105C15.596 6.29443 16.1397 7.07897 15.8639 7.81444L13.7946 13.3325C13.6299 13.7716 13.2102 14.0625 12.7412 14.0625H7.26616C6.64484 14.0625 6.14116 13.5588 6.14116 12.9375V6.74646Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.06287 7.60674C2.06287 7.19252 2.39865 6.85674 2.81287 6.85674H3.64329C4.0575 6.85674 4.39329 7.19252 4.39329 7.60674V13.2922C4.39329 13.7064 4.0575 14.0422 3.64329 14.0422H2.81287C2.39865 14.0422 2.06287 13.7064 2.06287 13.2922V7.60674Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThumbsDownIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <path
        d="M6.14116 11.2572C6.14116 11.5473 6.25322 11.8262 6.45393 12.0356L9.77187 15.4978C9.9492 15.6828 10.1944 15.7875 10.4507 15.7875C11.0537 15.7875 11.5008 15.2279 11.3678 14.6398L10.7049 11.7092H14.8105C15.596 11.7092 16.1397 10.9247 15.8639 10.1892L13.7946 4.67115C13.6299 4.23206 13.2102 3.94116 12.7412 3.94116H7.26616C6.64484 3.94116 6.14116 4.44484 6.14116 5.06616V11.2572Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.06287 10.3969C2.06287 10.8111 2.39865 11.1469 2.81287 11.1469H3.64329C4.0575 11.1469 4.39329 10.8111 4.39329 10.3969V4.71146C4.39329 4.29724 4.0575 3.96146 3.64329 3.96146H2.81287C2.39865 3.96146 2.06287 4.29724 2.06287 4.71146V10.3969Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.58347 7.49905C2.58347 4.78457 4.78456 2.58374 7.50013 2.58374C10.2157 2.58374 12.4168 4.78457 12.4168 7.49905C12.4168 10.2135 10.2157 12.4144 7.50013 12.4144C4.78456 12.4144 2.58347 10.2135 2.58347 7.49905ZM7.50013 1.08374C3.95647 1.08374 1.08347 3.9558 1.08347 7.49905C1.08347 11.0423 3.95647 13.9144 7.50013 13.9144C9.00119 13.9144 10.3819 13.399 11.4749 12.5357L13.6356 14.6966C13.9285 14.9895 14.4034 14.9895 14.6963 14.6966C14.9892 14.4037 14.9892 13.9289 14.6963 13.636L12.5359 11.4754C13.4006 10.3823 13.9168 9.00095 13.9168 7.49905C13.9168 3.9558 11.0438 1.08374 7.50013 1.08374Z"
        fill="#98A2B3"
      />
    </svg>
  );
}

export function CheckMarkIcon(props: IconProps) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19.28 6.763a.75.75 0 010 1.06L9.863 17.24a.75.75 0 01-1.06 0L4.72 13.157a.75.75 0 011.06-1.06l3.553 3.552 8.887-8.886a.75.75 0 011.06 0z"
        fill="#98A2B3"
      />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.303 3.78a2.25 2.25 0 00-3.182 0L14.35 5.551a.607.607 0 00-.033.033l-8.483 8.483a2.25 2.25 0 00-.562.936l-1.22 4.01a.75.75 0 00.936.935l4.009-1.22c.353-.108.675-.3.936-.562L20.22 7.88a2.25 2.25 0 000-3.182l-.917-.917zm-4.44 3.378l-7.969 7.97a.75.75 0 00-.187.312l-.81 2.664 2.663-.811a.75.75 0 00.312-.187l7.97-7.97-1.978-1.978zm3.04.918l1.256-1.257a.75.75 0 000-1.061l-.917-.917a.75.75 0 00-1.06 0l-1.257 1.257 1.977 1.978z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LongArrowUpIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.639 3.05a.748.748 0 01.567-.26h.001c.192 0 .385.073.531.22l5 4.997a.75.75 0 11-1.06 1.06l-3.722-3.72v11.528a.75.75 0 11-1.5 0V5.353L5.739 9.068a.75.75 0 01-1.06-1.061l4.96-4.958z"
        fill="#fff"
      />
    </svg>
  );
}

export function AttachmentIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.668 12.035V13.454a.668.668 0 11-1.336 0V5.127a.75.75 0 00-1.5 0v8.325a2.168 2.168 0 104.337 0V5.129v-.03a3.587 3.587 0 00-7.174.03v8.326a5.005 5.005 0 0010.01 0v-5.49a.75.75 0 10-1.5 0v5.49a3.505 3.505 0 11-7.01 0v-5.49a.79.79 0 000-.018V5.128a2.087 2.087 0 114.173 0v6.907z"
        fill="#667085"
      />
    </svg>
  );
}

export function ChevronDown2Icon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      {...props}
    >
      <path
        d="M4.33301 5.91666L8.49967 10.0833L12.6663 5.91666"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.75 2.292a.75.75 0 00-1.5 0v.544a6.376 6.376 0 00-5.625 6.331v5.292h-.292a.75.75 0 000 1.5h13.333a.75.75 0 100-1.5h-.291V9.167a6.376 6.376 0 00-5.625-6.331v-.544zm4.125 12.167V9.167a4.875 4.875 0 10-9.75 0v5.292h9.75zM8 17.709c0 .414.335.75.75.75h2.5a.75.75 0 000-1.5h-2.5a.75.75 0 00-.75.75z"
        fill="currentColor"
      />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.22 7.281a.75.75 0 011.06-1.06L12 10.939l4.719-4.718a.75.75 0 111.06 1.06L13.06 12l4.718 4.719a.75.75 0 11-1.06 1.06l-4.719-4.718-4.719 4.718a.75.75 0 01-1.06-1.06L10.938 12 6.22 7.281z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CodeXmlIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <path
        d="M5.0625 5.99976L2.0625 9.00003L5.0625 12M12.9375 5.99976L15.9375 9.00003L12.9375 12M10.3329 2.99994L7.66626 14.9999"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoogleIcon(props: IconProps) {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19.2511 10.1943C19.2511 9.47489 19.1915 8.94989 19.0626 8.40546H10.6797V11.6526H15.6003C15.5011 12.4596 14.9654 13.6749 13.7749 14.4915L13.7582 14.6002L16.4087 16.6125L16.5924 16.6305C18.2788 15.104 19.2511 12.8582 19.2511 10.1943Z"
        fill="#4285F4"
      />
      <path
        d="M10.6788 18.75C13.0895 18.75 15.1133 17.9722 16.5915 16.6305L13.774 14.4916C13.0201 15.0069 12.0081 15.3666 10.6788 15.3666C8.31773 15.3666 6.31379 13.8402 5.59944 11.7305L5.49473 11.7392L2.73868 13.8295L2.70264 13.9277C4.17087 16.786 7.18674 18.75 10.6788 18.75Z"
        fill="#34A853"
      />
      <path
        d="M5.60014 11.7305C5.41165 11.1861 5.30257 10.6027 5.30257 9.99998C5.30257 9.39716 5.41165 8.81385 5.59022 8.26941L5.58523 8.15346L2.79464 6.0296L2.70333 6.07216C2.0982 7.25829 1.75098 8.59026 1.75098 9.99998C1.75098 11.4097 2.0982 12.7416 2.70333 13.9277L5.60014 11.7305Z"
        fill="#FBBC05"
      />
      <path
        d="M10.6789 4.63331C12.3554 4.63331 13.4864 5.34303 14.1312 5.93612L16.6511 3.525C15.1035 2.11528 13.0895 1.25 10.6789 1.25C7.18676 1.25 4.17088 3.21387 2.70264 6.07218L5.58953 8.26943C6.31381 6.15972 8.31776 4.63331 10.6789 4.63331Z"
        fill="#EB4335"
      />
    </svg>
  );
}

export function GithubIcon(props: IconProps) {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      transform="rotate(0 0 0)"
      {...props}
    >
      <path
        d="M12 2.24902C6.51613 2.24902 2 6.70064 2 12.249C2 16.6361 4.87097 20.3781 8.87097 21.7329C9.3871 21.8297 9.54839 21.5071 9.54839 21.2813C9.54839 21.0555 9.54839 20.4103 9.51613 19.5393C6.74194 20.1845 6.16129 18.1845 6.16129 18.1845C5.70968 17.0555 5.03226 16.7329 5.03226 16.7329C4.12903 16.0877 5.06452 16.0877 5.06452 16.0877C6.06452 16.12 6.6129 17.12 6.6129 17.12C7.48387 18.6684 8.96774 18.2168 9.51613 17.9264C9.6129 17.2813 9.87097 16.8297 10.1613 16.5716C7.96774 16.3458 5.6129 15.4748 5.6129 11.6684C5.6129 10.5716 6.03226 9.70064 6.64516 9.02322C6.54839 8.79741 6.19355 7.76515 6.74194 6.37806C6.74194 6.37806 7.6129 6.11999 9.51613 7.41031C10.3226 7.18451 11.1613 7.05548 12.0323 7.05548C12.9032 7.05548 13.7742 7.15225 14.5484 7.41031C16.4516 6.15225 17.2903 6.37806 17.2903 6.37806C17.8387 7.73289 17.5161 8.79741 17.3871 9.02322C18.0323 9.70064 18.4194 10.6039 18.4194 11.6684C18.4194 15.4748 16.0645 16.3458 13.871 16.5716C14.2258 16.8942 14.5484 17.5393 14.5484 18.4426C14.5484 19.7974 14.5161 20.8619 14.5161 21.1845C14.5161 21.4426 14.7097 21.7329 15.1935 21.6361C19.129 20.3135 22 16.6039 22 12.1845C21.9677 6.70064 17.4839 2.24902 12 2.24902Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CheckMarkIcon2(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <path
        d="M16.7522 5.45L7.65222 14.55L3.24805 10.1459"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.54093 3.79167C6.54093 2.54903 7.54829 1.54167 8.79093 1.54167H11.2076C12.4502 1.54167 13.4576 2.54903 13.4576 3.79167V4.04167H15.6247H16.6655C17.0797 4.04167 17.4155 4.37745 17.4155 4.79167C17.4155 5.20588 17.0797 5.54167 16.6655 5.54167H16.3747V8.24654V13.2465V16.2083C16.3747 17.451 15.3673 18.4583 14.1247 18.4583H5.87467C4.63203 18.4583 3.62467 17.451 3.62467 16.2083V13.2465V8.24654V5.54167H3.33301C2.91879 5.54167 2.58301 5.20588 2.58301 4.79167C2.58301 4.37745 2.91879 4.04167 3.33301 4.04167H4.37467H6.54093V3.79167ZM14.8747 13.2465V8.24654V5.54167H13.4576H12.7076H7.29093H6.54093H5.12467V8.24654V13.2465V16.2083C5.12467 16.6225 5.46046 16.9583 5.87467 16.9583H14.1247C14.5389 16.9583 14.8747 16.6225 14.8747 16.2083V13.2465ZM8.04093 4.04167H11.9576V3.79167C11.9576 3.37745 11.6218 3.04167 11.2076 3.04167H8.79093C8.37672 3.04167 8.04093 3.37745 8.04093 3.79167V4.04167ZM8.33301 8C8.74722 8 9.08301 8.33579 9.08301 8.75V13.75C9.08301 14.1642 8.74722 14.5 8.33301 14.5C7.91879 14.5 7.58301 14.1642 7.58301 13.75V8.75C7.58301 8.33579 7.91879 8 8.33301 8ZM12.4163 8.75C12.4163 8.33579 12.0806 8 11.6663 8C11.2521 8 10.9163 8.33579 10.9163 8.75V13.75C10.9163 14.1642 11.2521 14.5 11.6663 14.5C12.0806 14.5 12.4163 14.1642 12.4163 13.75V8.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChatGPTIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      {...props}
    >
      <path
        d="M27.4632 12.3444C27.7913 11.3591 27.9051 10.3152 27.797 9.28236C27.6889 8.24956 27.3615 7.25178 26.8366 6.35577C26.0585 5.00052 24.8699 3.92751 23.4424 3.29158C22.0149 2.65566 20.4223 2.4897 18.8942 2.81764C18.205 2.04095 17.3579 1.42043 16.4095 0.997616C15.4611 0.57481 14.4333 0.359464 13.3949 0.365997C11.8328 0.362226 10.3097 0.854655 9.04539 1.7723C7.78107 2.68993 6.84085 3.98536 6.36024 5.47182C5.34255 5.68014 4.38109 6.10346 3.54024 6.71345C2.69939 7.32344 1.99856 8.106 1.48465 9.00878C0.700313 10.3603 0.365514 11.926 0.528533 13.4801C0.691553 15.0342 1.34396 16.4963 2.39168 17.6556C2.06363 18.6409 1.94983 19.6848 2.05789 20.7176C2.16596 21.7504 2.4934 22.7482 3.01829 23.6442C3.79649 24.9994 4.98507 26.0723 6.41257 26.7083C7.84005 27.3442 9.43268 27.5102 10.9606 27.1823C11.6498 27.9591 12.497 28.5795 13.4454 29.0024C14.3938 29.4252 15.4216 29.6405 16.4599 29.634C18.0229 29.6381 19.5468 29.1454 20.8115 28.2272C22.0764 27.309 23.0168 26.0126 23.497 24.5253C24.5146 24.317 25.4761 23.8937 26.317 23.2837C27.1578 22.6737 27.8586 21.8911 28.3726 20.9883C29.1559 19.6369 29.4899 18.0716 29.3265 16.5181C29.1631 14.9647 28.5106 13.5032 27.4632 12.3444ZM16.4623 27.7207C15.1792 27.7225 13.9365 27.2731 12.9512 26.4513C12.9957 26.4271 13.0736 26.3843 13.1244 26.3532L18.952 22.987C19.0982 22.9038 19.2197 22.7832 19.3039 22.6374C19.3881 22.4917 19.4319 22.3261 19.4309 22.1579V13.9421L21.8941 15.3644C21.907 15.3708 21.9181 15.3803 21.9265 15.3921C21.9349 15.4039 21.9401 15.4176 21.9419 15.4319V22.2358C21.9401 23.689 21.3624 25.0823 20.3353 26.1103C19.3082 27.1384 17.9154 27.7175 16.4623 27.7207ZM4.67773 22.6876C4.03507 21.5772 3.80345 20.2761 4.02342 19.0121C4.06669 19.0381 4.14228 19.0842 4.19652 19.1154L10.0241 22.4816C10.1694 22.5664 10.3346 22.6112 10.5028 22.6112C10.6709 22.6112 10.8362 22.5664 10.9814 22.4816L18.0963 18.3734V21.218C18.0971 21.2325 18.0943 21.247 18.0882 21.2602C18.082 21.2734 18.0728 21.2849 18.0611 21.2936L12.17 24.6949C10.9099 25.4207 9.41336 25.6169 8.00878 25.2405C6.60416 24.8642 5.40621 23.9461 4.67773 22.6876ZM3.14466 9.96541C3.78453 8.85351 4.79519 8.00224 5.99962 7.56051C5.99962 7.61071 5.99674 7.69961 5.99674 7.76129V14.4937C5.99571 14.6618 6.03949 14.8272 6.12356 14.9729C6.20762 15.1185 6.32895 15.239 6.47507 15.3222L13.5899 19.4299L11.1268 20.8521C11.1147 20.8602 11.1007 20.865 11.0862 20.8663C11.0717 20.8676 11.0571 20.8654 11.0437 20.8597L5.15202 17.4554C3.89413 16.7269 2.97643 15.5294 2.60014 14.1253C2.22384 12.7213 2.41966 11.2253 3.14466 9.96541ZM23.3822 14.6748L16.2672 10.5667L18.7304 9.14495C18.7426 9.13698 18.7565 9.13207 18.771 9.13076C18.7855 9.12944 18.8001 9.13178 18.8135 9.13749L24.7052 12.5388C25.6078 13.0602 26.3432 13.828 26.8253 14.7522C27.3073 15.6764 27.5161 16.7188 27.4272 17.7574C27.3383 18.796 26.9552 19.7877 26.3231 20.6165C25.6909 21.4453 24.8357 22.0769 23.8576 22.4371C23.8576 22.3864 23.8576 22.2975 23.8576 22.2358V15.5034C23.8589 15.3356 23.8156 15.1703 23.7321 15.0247C23.6485 14.8791 23.5278 14.7584 23.3822 14.6748ZM25.8338 10.985C25.7905 10.9584 25.7149 10.9128 25.6607 10.8817L19.833 7.51551C19.6878 7.43078 19.5226 7.38607 19.3544 7.38607C19.1863 7.38607 19.021 7.43078 18.8758 7.51551L11.7609 11.6238V8.77917C11.7601 8.76461 11.7629 8.75012 11.769 8.73695C11.7752 8.72378 11.7845 8.71229 11.7961 8.70359L17.6872 5.30506C18.5897 4.78466 19.6218 4.53202 20.6626 4.5767C21.7035 4.62138 22.71 4.96154 23.5647 5.55737C24.4192 6.15321 25.0865 6.98008 25.4883 7.94129C25.8902 8.90246 26.01 9.95817 25.8338 10.985ZM10.4217 16.055L7.95792 14.6328C7.94505 14.6263 7.93385 14.6168 7.92551 14.605C7.91717 14.5932 7.91183 14.5796 7.91007 14.5652V7.76129C7.91073 6.71923 8.20824 5.69889 8.7677 4.81973C9.32724 3.94056 10.1256 3.23897 11.0694 2.79705C12.0131 2.35514 13.0632 2.1912 14.0967 2.32441C15.1303 2.45763 16.1045 2.88249 16.9054 3.54927C16.861 3.5735 16.7836 3.61621 16.7323 3.64736L10.9047 7.01354C10.7584 7.09667 10.637 7.21724 10.5528 7.36288C10.4686 7.50849 10.4248 7.67393 10.4258 7.84207L10.4217 16.055ZM11.7597 13.1701L14.9286 11.3399L18.0974 13.1689V16.8282L14.9286 18.6573L11.7597 16.8282V13.1701Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MidjourneyIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="42"
      height="42"
      viewBox="0 0 42 42"
      fill="none"
      {...props}
    >
      <path
        d="M7.13672 32.5664C7.95703 32.5664 9.1875 30.8438 10.623 30.5977C11.4434 30.5977 12.0586 32.3203 14.1094 32.5664C15.5449 32.5664 16.1602 30.8438 17.5957 30.8438C19.0312 30.8438 19.6465 32.5664 21.082 32.5664C22.5176 32.5664 23.1328 30.8438 24.5684 30.8438C26.0039 30.8438 26.6191 32.5664 28.0547 32.5664C29.4902 32.5664 30.1055 30.8438 31.541 30.8438C32.9766 30.8438 33.5918 32.5664 35.0273 32.5664"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.94219 30.852L9.00293 29.0555L33.2021 27.4969C31.299 29.2277 28.8545 30.6305 26.3813 31.7789"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.6377 12.3211C22.7557 13.5803 28.5143 19.6629 30.4748 26.2008C29.4002 25.7783 28.5963 25.3477 27.0869 25.7332C25.6268 20.4217 23.0141 15.348 18.6377 12.3211Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.9803 9.41309C16.2549 11.6689 23.49 17.9484 24.8189 26.3115C18.7363 23.8588 14.1057 25.1672 10.8818 27.1564C15.7996 20.9057 13.593 13.7977 10.9803 9.41309Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FigmaIcon(props: IconProps) {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8 24C10.2091 24 12 22.2091 12 20V16H8C5.79086 16 4 17.7909 4 20C4 22.2091 5.79086 24 8 24Z"
        fill="#0ACF83"
      />
      <path
        d="M4 12C4 9.79086 5.79086 8 8 8H12V16H8C5.79086 16 4 14.2091 4 12Z"
        fill="#A259FF"
      />
      <path
        d="M4 4C4 1.79086 5.79086 0 8 0H12V8H8C5.79086 8 4 6.20914 4 4Z"
        fill="#F24E1E"
      />
      <path
        d="M12 0H16C18.2091 0 20 1.79086 20 4C20 6.20914 18.2091 8 16 8H12V0Z"
        fill="#FF7262"
      />
      <path
        d="M20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12Z"
        fill="#1ABCFE"
      />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.00149 12.75C8.7867 12.75 8.59299 12.6597 8.45626 12.515L5.00111 9.06205C4.70813 8.76925 4.70797 8.29438 5.00078 8.00139C5.29358 7.7084 5.76845 7.70825 6.06143 8.00105L8.25149 10.1897L8.25149 3C8.25149 2.58579 8.58728 2.25 9.00149 2.25C9.4157 2.25 9.75149 2.58579 9.75149 3L9.75149 10.1866L11.9386 8.00104C12.2316 7.70825 12.7065 7.70841 12.9993 8.00141C13.2921 8.2944 13.2919 8.76928 12.9989 9.06207L9.57359 12.485C9.43602 12.6471 9.23077 12.75 9.00149 12.75ZM3.75 12C3.75 11.5858 3.41421 11.25 3 11.25C2.58579 11.25 2.25 11.5858 2.25 12V13.5C2.25 14.7426 3.25736 15.75 4.5 15.75H13.5007C14.7433 15.75 15.7507 14.7426 15.7507 13.5V12C15.7507 11.5858 15.4149 11.25 15.0007 11.25C14.5864 11.25 14.2507 11.5858 14.2507 12V13.5C14.2507 13.9142 13.9149 14.25 13.5007 14.25H4.5C4.08579 14.25 3.75 13.9142 3.75 13.5V12Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TextTypeIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path 
        d="M11.7037 5.03705H4.29634V6.51853H7.2593V11.7037H8.74078V6.51853H11.7037V5.03705ZM2.07411 1.33334H13.926C14.1224 1.33334 14.3108 1.41139 14.4497 1.5503C14.5887 1.68922 14.6667 1.87763 14.6667 2.07408V13.9259C14.6667 14.1224 14.5887 14.3108 14.4497 14.4497C14.3108 14.5886 14.1224 14.6667 13.926 14.6667H2.07411C1.87766 14.6667 1.68925 14.5886 1.55033 14.4497C1.41142 14.3108 1.33337 14.1224 1.33337 13.9259V2.07408C1.33337 1.87763 1.41142 1.68922 1.55033 1.5503C1.68925 1.41139 1.87766 1.33334 2.07411 1.33334Z" 
        fill="currentColor"
      />
    </svg>
  )
}

export function ImageTypeIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path 
        d="M8.92191 11.5333L6.83887 8.92991C6.50964 8.51876 5.91058 8.45291 5.50104 8.78054C5.44644 8.82391 5.39665 8.8753 5.35168 8.92991L2.28575 12.7619H13.7143L11.6184 9.96901C11.3037 9.54823 10.7062 9.46311 10.2854 9.77789C10.2132 9.8325 10.1489 9.89674 10.0943 9.96901L8.92191 11.5333ZM2.28575 1.33334H13.7143C14.2395 1.33334 14.6667 1.75894 14.6667 2.28572V13.7143C14.6667 14.2395 14.2411 14.6667 13.7143 14.6667H2.28575C1.76058 14.6667 1.33337 14.2411 1.33337 13.7143V2.28572C1.33337 1.76055 1.76058 1.33334 2.28575 1.33334ZM10.8572 7.04763C11.9091 7.04763 12.7619 6.19482 12.7619 5.14287C12.7619 4.09091 11.9091 3.23811 10.8572 3.23811C9.80523 3.23811 8.95242 4.09091 8.95242 5.14287C8.95242 6.19482 9.80523 7.04763 10.8572 7.04763Z" 
        fill="currentColor"
      />
    </svg>
  )
}

export function FileTypeIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path 
        d="M13.8201 14.661H2.25452C2.25452 14.661 1.33337 14.8186 1.33337 13.4684V2.55512C1.33337 2.55512 1.35385 1.34004 2.4797 1.34004H6.53278C6.53278 1.34004 7.02407 1.22753 7.43347 1.92507C7.8224 2.60013 8.04758 3.02766 8.04758 3.02766C8.04758 3.02766 8.19087 3.20766 8.51839 3.20766C8.23181 3.20766 13.7383 3.20766 13.7383 3.20766C13.7383 3.20766 14.6594 3.09515 14.6594 4.22022V13.5359C14.6594 13.5359 14.8027 14.661 13.8201 14.661H13.8201ZM12.9604 6.11039C12.9604 5.84037 12.7557 5.61535 12.51 5.61535H3.50319C3.23708 5.61535 3.03238 5.84038 3.03238 6.11039V6.15539C3.03238 6.44791 3.23708 6.67293 3.50319 6.67293H12.51C12.7557 6.67293 12.9604 6.4479 12.9604 6.15539V6.11039Z" 
        fill="currentColor"
      />
    </svg>
  )
}

export function VideoTypeIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path 
        d="M7.15946 3.75755L5.18845 1.33331H2.95657L4.92758 3.75755H7.15946ZM12.9566 3.75755L10.9855 1.33331H8.75367L10.7247 3.75755H12.9566ZM10.058 3.75755L8.087 1.33331H5.85511L7.82613 3.75755H10.058ZM13.7971 1.33331H11.6522L13.6232 3.75755H14.6667V2.2424C14.6667 1.72725 14.2899 1.33331 13.7971 1.33331ZM2.2899 1.33331H2.20294C1.71019 1.33331 1.33337 1.72725 1.33337 2.2424V3.75755H4.26091L2.2899 1.33331ZM1.33337 13.7576C1.33337 14.2727 1.71019 14.6666 2.20294 14.6666H13.7971C14.2899 14.6666 14.6667 14.2727 14.6667 13.7576V4.36361H1.33337V13.7576ZM5.97106 7.09089C5.97106 6.57573 6.37685 6.33332 6.84063 6.33332C6.98554 6.33332 7.15946 6.36362 7.30439 6.45452L10.6087 8.45453C11.1884 8.78786 11.1884 9.63634 10.6087 9.96968L7.30439 11.9697C7.15946 12.0606 7.01454 12.0909 6.84063 12.0909C6.37685 12.0909 5.97106 11.8485 5.97106 11.3333V7.09089Z" 
        fill="currentColor"
      />
    </svg>
  )
}

export function AudioTypeIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M8.27604 3.11109H14C14.1768 3.11109 14.3464 3.20474 14.4714 3.37144C14.5965 3.53814 14.6667 3.76423 14.6667 3.99998V14C14.6667 14.1768 14.5965 14.3464 14.4714 14.4714C14.3464 14.5964 14.1768 14.6666 14 14.6666H2.00004C1.82323 14.6666 1.65366 14.5964 1.52864 14.4714C1.40361 14.3464 1.33337 14.1768 1.33337 14V2.2222C1.33337 1.98645 1.40361 1.76036 1.52864 1.59366C1.65366 1.42696 1.82323 1.33331 2.00004 1.33331H6.94271L8.27604 3.11109ZM7.33337 8.69998C6.9964 8.63119 6.64639 8.66834 6.33136 8.80633C6.01633 8.94431 5.7517 9.17638 5.57376 9.4707C5.39583 9.76502 5.3133 10.1072 5.3375 10.4502C5.36171 10.7933 5.49145 11.1205 5.70894 11.3869C5.92643 11.6534 6.22102 11.846 6.5523 11.9384C6.88358 12.0308 7.23533 12.0184 7.55932 11.903C7.8833 11.7876 8.16365 11.5748 8.36191 11.2937C8.56017 11.0127 8.66664 10.6772 8.66671 10.3333V5.99998H10.6667V4.66665H7.33337V8.69998Z" 
        fill="currentColor"
      />
    </svg>
  )
}

export function ApiKeysIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M7.9998 1.00313C4.14199 1.00313 1.00293 4.14219 1.00293 8C1.00293 11.8578 4.14199 14.9969 7.9998 14.9969C11.8576 14.9969 14.9967 11.8578 14.9967 8C14.9967 4.14219 11.8576 1.00313 7.9998 1.00313ZM7.9998 13.8922C4.75137 13.8922 2.10762 11.2484 2.10762 8C2.10762 4.75157 4.75137 2.10782 7.9998 2.10782C11.2482 2.10782 13.892 4.75157 13.892 8C13.892 11.2484 11.2482 13.8922 7.9998 13.8922Z"
        fill="currentColor"
      />
      <path
        d="M11.4157 5.32813L10.5688 4.81563L10.6454 4.68906C10.8032 4.42813 10.7188 4.08906 10.4579 3.93125C10.1969 3.77344 9.85789 3.85781 9.70007 4.11875L9.33757 4.71875L7.26257 8.15C6.37664 7.89844 5.39695 8.25469 4.89851 9.07969C4.30164 10.0688 4.61882 11.3578 5.60789 11.9563C5.94539 12.1609 6.31882 12.2578 6.68757 12.2578C7.39695 12.2578 8.0907 11.8984 8.48289 11.2469C8.98133 10.4219 8.8407 9.38906 8.20633 8.72188L8.91258 7.55313L9.78758 8.08281C9.87664 8.1375 9.97508 8.1625 10.0735 8.1625C10.261 8.1625 10.4423 8.06719 10.5469 7.89531C10.7048 7.63438 10.6204 7.29531 10.3594 7.1375L9.48445 6.60781L9.99539 5.7625L10.8423 6.275C10.9313 6.32969 11.0298 6.35469 11.1282 6.35469C11.3157 6.35469 11.4969 6.25938 11.6016 6.0875C11.761 5.825 11.6766 5.48594 11.4157 5.32813ZM7.53914 10.675C7.40164 10.9016 7.18601 11.0609 6.9282 11.1234C6.67195 11.1875 6.40632 11.1469 6.17976 11.0094C5.9532 10.8719 5.79382 10.6563 5.73132 10.3984C5.66726 10.1422 5.70789 9.875 5.84539 9.65C5.98289 9.42344 6.19851 9.26406 6.45633 9.20156C6.53601 9.18125 6.6157 9.17188 6.69539 9.17188C6.87351 9.17188 7.04851 9.22031 7.20633 9.31563C7.67039 9.59844 7.82039 10.2078 7.53914 10.675Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function BillingIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M6.66699 10.167C6.53438 10.167 6.40721 10.2197 6.31344 10.3134C6.21967 10.4072 6.16699 10.5344 6.16699 10.667C6.16699 10.7996 6.21967 10.9268 6.31344 11.0205C6.40721 11.1143 6.53438 11.167 6.66699 11.167H7.66699C7.7996 11.167 7.92678 11.1143 8.02055 11.0205C8.11431 10.9268 8.16699 10.7996 8.16699 10.667C8.16699 10.5344 8.11431 10.4072 8.02055 10.3134C7.92678 10.2197 7.7996 10.167 7.66699 10.167H6.66699ZM9.16599 10.667C9.16599 10.5344 9.21867 10.4072 9.31244 10.3134C9.40621 10.2197 9.53338 10.167 9.66599 10.167H12C12.1326 10.167 12.2598 10.2197 12.3535 10.3134C12.4473 10.4072 12.5 10.5344 12.5 10.667C12.5 10.7996 12.4473 10.9268 12.3535 11.0205C12.2598 11.1143 12.1326 11.167 12 11.167H9.66599C9.53338 11.167 9.40621 11.1143 9.31244 11.0205C9.21867 10.9268 9.16599 10.7996 9.16599 10.667Z"
        fill="currentColor"
      />
      <path
        d="M9.03201 2.16701H6.96801C5.74201 2.16701 4.77901 2.16701 4.02001 2.25201C3.24601 2.34001 2.61701 2.52201 2.09501 2.93501C1.93901 3.05801 1.79401 3.19501 1.66201 3.34201C1.21801 3.84101 1.01901 4.44401 0.925008 5.18501C0.833008 5.90501 0.833008 6.81501 0.833008 7.96501V8.03501C0.833008 9.18501 0.833008 10.095 0.925008 10.815C1.01901 11.555 1.21801 12.159 1.66201 12.657C1.79401 12.805 1.93901 12.942 2.09501 13.065C2.61701 13.477 3.24501 13.66 4.02001 13.748C4.78001 13.833 5.74201 13.833 6.96801 13.833H9.03201C10.258 13.833 11.22 13.833 11.979 13.748C12.754 13.66 13.383 13.478 13.905 13.065C14.061 12.942 14.206 12.805 14.338 12.657C14.782 12.159 14.98 11.556 15.075 10.815C15.167 10.095 15.167 9.18501 15.167 8.03501V7.96501C15.167 6.81501 15.167 5.90501 15.075 5.18501C14.98 4.44501 14.782 3.84101 14.338 3.34201C14.2058 3.19402 14.0609 3.05783 13.905 2.93501C13.383 2.52201 12.755 2.34001 11.98 2.25201C11.22 2.16701 10.258 2.16701 9.03201 2.16701ZM2.71501 3.72001C3.02901 3.47101 3.44501 3.32401 4.13301 3.24601C4.82901 3.16701 5.73501 3.16601 7.00001 3.16601H9.00001C10.264 3.16601 11.17 3.16701 11.867 3.24601C12.555 3.32401 12.971 3.47101 13.285 3.72001C13.396 3.80701 13.499 3.90401 13.591 4.00801C13.849 4.29801 14.001 4.67601 14.083 5.31201C14.091 5.37201 14.098 5.43501 14.104 5.50001H1.89601C1.90201 5.43501 1.90901 5.37301 1.91701 5.31201C1.99801 4.67601 2.15101 4.29701 2.40801 4.00801C2.50101 3.90401 2.60401 3.80801 2.71501 3.72001ZM1.84301 6.50001H14.157C14.167 6.93001 14.167 7.42501 14.167 8.00001C14.167 9.19201 14.166 10.04 14.083 10.688C14.002 11.323 13.849 11.703 13.591 11.992C13.499 12.096 13.396 12.192 13.285 12.28C12.971 12.528 12.555 12.676 11.867 12.754C11.171 12.833 10.264 12.834 9.00001 12.834H7.00001C5.73501 12.834 4.82901 12.832 4.13301 12.754C3.44501 12.676 3.02901 12.528 2.71501 12.28C2.60449 12.1931 2.50176 12.0968 2.40801 11.992C2.15101 11.702 1.99801 11.323 1.91701 10.688C1.83401 10.039 1.83301 9.19201 1.83301 8.00001C1.83301 7.42501 1.83301 6.93001 1.84301 6.50001Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function UsageIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M8.01037 8.53165C7.74494 8.53165 7.47951 8.26582 7.47951 8V1.53165C7.47951 1.26582 7.74494 1 8.01037 1C11.9033 1 15 4.10127 15 8C15 8.26582 14.7346 8.53165 14.4691 8.53165H8.01037ZM8.54123 7.46835H13.8498V7.37975C13.6729 6.05063 13.0535 4.81013 12.1688 3.83544C11.1955 2.86076 9.95685 2.32911 8.62971 2.1519H8.54123V7.46835Z"
        fill="currentColor"
      />
      <path
        d="M8.01037 15C7.03713 15 6.15237 14.8228 5.26761 14.4684C1.72856 12.962 0.0475051 8.79747 1.5516 5.25316C2.25941 3.56962 3.58656 2.32911 5.17913 1.62025C5.26761 1.62025 5.35608 1.53165 5.44456 1.53165C5.70999 1.53165 5.88694 1.62025 5.97542 1.88608C6.06389 2.1519 5.97542 2.50633 5.70999 2.59494C2.70179 3.92405 1.28617 7.37975 2.61332 10.3924C3.58656 12.519 5.62151 13.9367 8.01037 13.9367C8.80666 13.9367 9.60295 13.7595 10.3992 13.4051C11.8149 12.7848 12.8766 11.7215 13.4959 10.3038C13.5844 10.1266 13.7613 9.94937 14.0268 9.94937H14.2037C14.3807 10.038 14.4691 10.1266 14.4691 10.2152C14.5576 10.3924 14.5576 10.481 14.4691 10.6582C13.319 13.3165 10.8416 15 8.01037 15Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function LogsIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M14.0201 2.66667H2.28682C1.84682 2.66667 1.48682 3.02667 1.48682 3.46667V13.8667C1.48682 14.3067 1.84682 14.6667 2.28682 14.6667H14.0201C14.4601 14.6667 14.8201 14.3067 14.8201 13.8667V3.46667C14.8201 3.02667 14.4668 2.66667 14.0201 2.66667ZM13.7535 13.6H2.55348V3.73334H13.7535V13.6Z"
        fill="currentColor"
      />
      <path
        d="M11.6399 10.9333H5.20656C4.91989 10.9333 4.69322 10.7 4.69322 10.42V10.3867C4.69322 10.1 4.92656 9.87333 5.20656 9.87333H11.6399C11.9266 9.87333 12.1532 10.1067 12.1532 10.3867V10.42C12.1532 10.7 11.9266 10.9333 11.6399 10.9333ZM11.6199 8.53333H8.15322C7.85989 8.53333 7.61989 8.29333 7.61989 7.99999C7.61989 7.70666 7.85989 7.46666 8.15322 7.46666H11.6199C11.9132 7.46666 12.1532 7.70666 12.1532 7.99999C12.1532 8.29333 11.9199 8.53333 11.6199 8.53333ZM11.2199 4.8C10.9266 4.8 10.6866 4.56 10.6866 4.26666V1.86666C10.6866 1.57333 10.9266 1.33333 11.2199 1.33333C11.5132 1.33333 11.7532 1.57333 11.7532 1.86666V4.26666C11.7532 4.56 11.5199 4.8 11.2199 4.8ZM5.08656 4.8C4.79322 4.8 4.55322 4.56 4.55322 4.26666V1.86666C4.55322 1.57333 4.79322 1.33333 5.08656 1.33333C5.37989 1.33333 5.61989 1.57333 5.61989 1.86666V4.26666C5.61989 4.56 5.38656 4.8 5.08656 4.8Z"
        fill="currentColor"
      />
    </svg>
  )
}