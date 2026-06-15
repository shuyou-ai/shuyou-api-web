import type { Metadata } from 'next';
import Link from 'next/link';
import SignupForm from './signup-form';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default function SignUpPage() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="wrapper">
        <div className="relative max-w-[600px] mx-auto">
          <div className="contact-wrapper border p-14 relative z-30 bg-white dark:bg-dark-primary dark:border-dark-primary border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-gray-800 dark:text-white/90 font-bold text-3xl mb-2">
                Sign Up
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Enter your details to create a account
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <button className="bg-gray-100 w-full h-12 justify-center dark:hover:bg-white/10 dark:hover:text-white/90 dark:bg-white/5 transition dark:text-gray-400 font-normal text-sm hover:bg-gray-200 rounded-full text-gray-700 hover:text-gray-800 flex items-center gap-3 px-8 py-2.5">
                <svg
                  width="21"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
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
                Sign up with Google
              </button>
              <button className="bg-gray-100 w-full h-12 justify-center dark:hover:bg-white/10 dark:hover:text-white/90 dark:bg-white/5 transition dark:text-gray-400 font-normal text-sm hover:bg-gray-200 rounded-full text-gray-700 hover:text-gray-800 flex items-center gap-3 px-8 py-2.5">
                <svg
                  className="size-6"
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  transform="rotate(0 0 0)"
                >
                  <path
                    d="M12 2.24902C6.51613 2.24902 2 6.70064 2 12.249C2 16.6361 4.87097 20.3781 8.87097 21.7329C9.3871 21.8297 9.54839 21.5071 9.54839 21.2813C9.54839 21.0555 9.54839 20.4103 9.51613 19.5393C6.74194 20.1845 6.16129 18.1845 6.16129 18.1845C5.70968 17.0555 5.03226 16.7329 5.03226 16.7329C4.12903 16.0877 5.06452 16.0877 5.06452 16.0877C6.06452 16.12 6.6129 17.12 6.6129 17.12C7.48387 18.6684 8.96774 18.2168 9.51613 17.9264C9.6129 17.2813 9.87097 16.8297 10.1613 16.5716C7.96774 16.3458 5.6129 15.4748 5.6129 11.6684C5.6129 10.5716 6.03226 9.70064 6.64516 9.02322C6.54839 8.79741 6.19355 7.76515 6.74194 6.37806C6.74194 6.37806 7.6129 6.11999 9.51613 7.41031C10.3226 7.18451 11.1613 7.05548 12.0323 7.05548C12.9032 7.05548 13.7742 7.15225 14.5484 7.41031C16.4516 6.15225 17.2903 6.37806 17.2903 6.37806C17.8387 7.73289 17.5161 8.79741 17.3871 9.02322C18.0323 9.70064 18.4194 10.6039 18.4194 11.6684C18.4194 15.4748 16.0645 16.3458 13.871 16.5716C14.2258 16.8942 14.5484 17.5393 14.5484 18.4426C14.5484 19.7974 14.5161 20.8619 14.5161 21.1845C14.5161 21.4426 14.7097 21.7329 15.1935 21.6361C19.129 20.3135 22 16.6039 22 12.1845C21.9677 6.70064 17.4839 2.24902 12 2.24902Z"
                    fill="currentColor"
                  />
                </svg>
                Sign up with Github
              </button>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-dark-primary sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>
            <SignupForm />
            <div className="mt-5">
              <p className="text-gray-700 dark:text-gray-400 font-normal text-sm">
                Already have an account?{' '}
                <Link
                  href="/signin"
                  className="text-sm font-semibold text-primary-500"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <span className="absolute -bottom-32 left-1/2 -translate-x-1/2 z-0">
        <svg
          width="930"
          height="760"
          viewBox="0 0 930 760"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.3" filter="url(#filter0_f_9248_10254)">
            <circle cx="380.335" cy="380.335" r="179.665" fill="#CFEFFF" />
          </g>
          <g opacity="0.7" filter="url(#filter1_f_9248_10254)">
            <circle cx="549.665" cy="380.335" r="179.665" fill="#58B1FF" />
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
      </span>
    </section>
  );
}
