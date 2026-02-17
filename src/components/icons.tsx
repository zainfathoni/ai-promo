export const RefreshIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="14"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
    width="14"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 3v5h-5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 21v-5h5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type HeartIconProps = {
  filled?: boolean;
  className?: string;
};

export const HeartIcon = ({ filled = false, className }: HeartIconProps) => (
  <svg
    aria-hidden="true"
    className={className}
    fill={filled ? "currentColor" : "none"}
    focusable="false"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.8 4.6a5.5 5.5 0 0 0-7.78 0L12 5.62l-1.02-1.02a5.5 5.5 0 0 0-7.78 7.78l1.02 1.02L12 20.9l7.78-7.48 1.02-1.02a5.5 5.5 0 0 0 0-7.78Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

