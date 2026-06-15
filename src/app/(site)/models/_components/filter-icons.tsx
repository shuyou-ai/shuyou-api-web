import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function ModelTypeFilterIcon(props: IconProps) {
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
        d="M2.66699 2.66666H6.00033V6.00001H2.66699V2.66666ZM10.0003 2.66666H13.3337V6.00001H10.0003V2.66666ZM2.66699 10H6.00033V13.3333H2.66699V10ZM10.0003 10H13.3337V13.3333H10.0003V10Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ProviderFilterIcon(props: IconProps) {
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
        d="M8.66699 1.33334H4.66699C3.56242 1.33334 2.66699 2.22877 2.66699 3.33334V12.6667C2.66699 13.7712 3.56242 14.6667 4.66699 14.6667H11.3337C12.4382 14.6667 13.3337 13.7712 13.3337 12.6667V5.33334L8.66699 1.33334ZM8.66699 2.27667L12.3903 6.00001H9.33366C8.96547 6.00001 8.66699 5.70153 8.66699 5.33334V2.27667ZM4.66699 3.33334H7.33366V5.33334C7.33366 6.43891 8.22909 7.33334 9.33366 7.33334H11.3337V12.6667H4.66699V3.33334Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TokenGroupFilterIcon(props: IconProps) {
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
        d="M8.00033 1.33334C5.0548 1.33334 2.66699 3.72115 2.66699 6.66668C2.66699 9.6122 5.0548 12 8.00033 12C10.9459 12 13.3337 9.6122 13.3337 6.66668C13.3337 3.72115 10.9459 1.33334 8.00033 1.33334ZM8.00033 2.66668C10.2095 2.66668 12.0003 4.45754 12.0003 6.66668C12.0003 8.87581 10.2095 10.6667 8.00033 10.6667C5.79119 10.6667 4.00033 8.87581 4.00033 6.66668C4.00033 4.45754 5.79119 2.66668 8.00033 2.66668Z"
        fill="currentColor"
      />
      <path
        d="M3.33366 11.3333C2.59728 11.3333 2.00033 11.9303 2.00033 12.6667V13.3333C2.00033 14.0697 2.59728 14.6667 3.33366 14.6667H12.667C13.4034 14.6667 14.0003 14.0697 14.0003 13.3333V12.6667C14.0003 11.9303 13.4034 11.3333 12.667 11.3333H11.3337C10.4132 12.0533 9.26033 12.5 8.00033 12.5C6.74033 12.5 5.58747 12.0533 4.66699 11.3333H3.33366Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BillingTypeFilterIcon(props: IconProps) {
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
        d="M2.66699 4.00001C2.66699 3.26363 3.26394 2.66668 4.00033 2.66668H12.0003C12.7367 2.66668 13.3337 3.26363 13.3337 4.00001V12C13.3337 12.7364 12.7367 13.3333 12.0003 13.3333H4.00033C3.26394 13.3333 2.66699 12.7364 2.66699 12V4.00001ZM4.00033 4.00001V5.33334H12.0003V4.00001H4.00033ZM4.00033 6.66668V12H12.0003V6.66668H4.00033ZM5.33366 9.33334H7.33366C7.70185 9.33334 8.00033 9.63182 8.00033 10C8.00033 10.3682 7.70185 10.6667 7.33366 10.6667H5.33366C4.96547 10.6667 4.66699 10.3682 4.66699 10C4.66699 9.63182 4.96547 9.33334 5.33366 9.33334Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function EndpointTypeFilterIcon(props: IconProps) {
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
        d="M3.33366 2.66668C2.59728 2.66668 2.00033 3.26363 2.00033 4.00001V6.66668C2.00033 7.40306 2.59728 8.00001 3.33366 8.00001H5.33366V12C5.33366 12.7364 5.93061 13.3333 6.66699 13.3333H12.667C13.4034 13.3333 14.0003 12.7364 14.0003 12V4.00001C14.0003 3.26363 13.4034 2.66668 12.667 2.66668H3.33366ZM3.33366 4.00001H12.667V6.66668H3.33366V4.00001ZM6.66699 8.00001H12.667V12H6.66699V8.00001Z"
        fill="currentColor"
      />
    </svg>
  );
}

export const FILTER_CATEGORY_ICONS = {
  'model-type': ModelTypeFilterIcon,
  provider: ProviderFilterIcon,
  'token-group': TokenGroupFilterIcon,
  'billing-type': BillingTypeFilterIcon,
  'endpoint-type': EndpointTypeFilterIcon,
} as const;
