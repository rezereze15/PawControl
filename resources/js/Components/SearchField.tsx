interface SearchFieldProps {
  value: string
  placeholder: string
  className: string
  onChange: (value: string) => void
}

export default function SearchField({
  value,
  placeholder,
  className,
  onChange,
}: SearchFieldProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      />
    </div>
  )
}
