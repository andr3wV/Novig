import { Button } from "@/components/ui/button"
import { LogOut, HelpCircle } from "lucide-react"

export function NavBar() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-primary">WEATHER.IO</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title="Help">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" title="Sign Out">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
