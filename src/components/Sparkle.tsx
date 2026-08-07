type Props = {
  className?: string
}

export default function Sparkle({ className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0c.6 4.6 1.9 7.6 4 9.7 2 2 5 3.3 8 4-4.6.6-7.6 1.9-9.7 4-2 2-3.3 5-4 8-.6-4.6-1.9-7.6-4-9.7-2-2-5-3.3-8-4 4.6-.6 7.6-1.9 9.7-4 2-2 3.3-5 4-8z" />
    </svg>
  )
}
