import { Button } from "./ui/button"
import { useTheme } from "./theme-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export function Header({ onSettingsClick, onMapStyleChange }) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-semibold">Route Optimization AI</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </Button>

            <Select defaultValue="light-streets" onChange={onMapStyleChange}>
              <SelectTrigger>
                <SelectValue>Map Style</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light-streets">Streets Light</SelectItem>
                <SelectItem value="light-minimal">Minimal Light</SelectItem>
                <SelectItem value="tracestrack-topo">Topo</SelectItem>
                <SelectItem value="dark-streets">Streets Dark</SelectItem>
                <SelectItem value="dark-minimal">Minimal Dark</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary">Generate 20 Orders</Button>
            <Button variant="secondary">Generate Fleets</Button>
            <Button variant="secondary">Reset Orders</Button>
            <Button onClick={onSettingsClick}>Settings</Button>
          </div>
        </div>
      </div>
    </header>
  )
} 