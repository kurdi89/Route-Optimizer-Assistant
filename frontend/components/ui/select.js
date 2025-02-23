export function Select({ defaultValue, children, onChange }) {
  return (
    <div className="relative">
      <select
        defaultValue={defaultValue}
        onChange={onChange}
        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {children}
      </select>
    </div>
  )
}

export function SelectTrigger({ children, className = "" }) {
  return (
    <div className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
      {children}
    </div>
  )
}

export function SelectContent({ children }) {
  return (
    <div className="relative mt-1 max-h-60 w-full overflow-auto rounded-md bg-background text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
      {children}
    </div>
  )
}

export function SelectItem({ value, children }) {
  return (
    <div className="relative select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-accent hover:text-accent-foreground">
      {children}
    </div>
  )
}

export function SelectValue({ children }) {
  return <span className="block truncate">{children}</span>
} 