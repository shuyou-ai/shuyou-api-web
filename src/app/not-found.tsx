import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function NotFoundPage() {
  return (
    <section className="min-h-screen flex justify-center items-center relative">
      <span className="absolute top-0">
        <svg
          width="1222"
          height="283"
          viewBox="0 0 1222 283"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.7" filter="url(#filter0_f_9289_13491)">
            <circle cx="772" cy="-167.171" r="250" fill="#58B1FF" />
          </g>
          <g opacity="0.3" filter="url(#filter1_f_9289_13491)">
            <circle cx="450" cy="-167.171" r="250" fill="#CFEFFF" />
          </g>
          <defs>
            <filter
              id="filter0_f_9289_13491"
              x="322"
              y="-617.171"
              width="900"
              height="900"
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
                result="effect1_foregroundBlur_9289_13491"
              />
            </filter>
            <filter
              id="filter1_f_9289_13491"
              x="0"
              y="-617.171"
              width="900"
              height="900"
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
                result="effect1_foregroundBlur_9289_13491"
              />
            </filter>
          </defs>
        </svg>
      </span>
      <div className="max-w-[451px] mx-auto text-center">
        <Image
          width={450}
          height={240}
          src="/images/404.svg"
          className="mb-10 block dark:hidden"
          alt=""
        />
        <Image
          width={450}
          height={240}
          src="/images/404-white.svg"
          className="mb-10 hidden dark:block"
          alt=""
        />
        <h1 className="text-4xl font-black text-gray-800 mb-2 dark:text-white/90">
          OPPS! Page Not Found
        </h1>
        <p className="text-gray-500 text-base dark:text-gray-400">
          We are sorry, But the page you requested was not found
        </p>
        <Link
          href="/"
          className="inline-flex mt-8 text-white text-sm gap-2 items-center bg-primary-500 rounded-full py-3 px-5 transition hover:bg-primary-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.08301 10.7424C3.08272 10.9347 3.15588 11.127 3.30249 11.2737L8.29915 16.2739C8.59194 16.5669 9.06682 16.5671 9.35981 16.2743C9.65281 15.9815 9.65297 15.5066 9.36018 15.2136L5.64009 11.4909L17.1675 11.4909C17.5817 11.4909 17.9175 11.1551 17.9175 10.7409C17.9175 10.3267 17.5817 9.9909 17.1675 9.9909L5.64554 9.9909L9.36017 6.27391C9.65297 5.98092 9.65282 5.50605 9.35983 5.21325C9.06684 4.92045 8.59197 4.9206 8.29917 5.21358L3.34167 10.1742C3.18321 10.3117 3.08301 10.5146 3.08301 10.7409C3.08301 10.7414 3.08301 10.7419 3.08301 10.7424Z"
              fill="white"
            />
          </svg>
          Back To Home
        </Link>
      </div>
    </section>
  );
}
