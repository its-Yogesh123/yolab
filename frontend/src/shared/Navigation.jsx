import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Moon, Sun } from "lucide-react"

export default function Navbar() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      const darkMode = savedTheme === "dark"
      setIsDark(darkMode)
      document.documentElement.classList.toggle("dark", darkMode)
      return
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDark(prefersDark)
    document.documentElement.classList.toggle("dark", prefersDark)
  }, [])

  const toggleTheme = () => {
    const nextThemeIsDark = !isDark
    setIsDark(nextThemeIsDark)
    document.documentElement.classList.toggle("dark", nextThemeIsDark)
    localStorage.setItem("theme", nextThemeIsDark ? "dark" : "light")
  }

  return (
    <nav className="w-full border-b border-[#1f2937] bg-[#111827]/95 backdrop-blur px-4 md:px-8">
      <div className="flex h-16 items-center justify-between">

        {/* LEFT: Logo */}
        <div className="text-xl font-bold text-[#e2e8f0]">
          <Link to="/" className="hover:text-[#3b82f6] transition-colors">YoLab</Link>
        </div>

        {/* CENTER: Desktop Menu */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-6 text-[#9ca3af]">
              <NavigationMenuItem>
                <Link to="/services" className="hover:text-[#e5e7eb] transition-colors">Services</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/products" className="hover:text-[#e5e7eb] transition-colors">Products</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/about" className="hover:text-[#e5e7eb] transition-colors">About</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/pricing" className="hover:text-[#e5e7eb] transition-colors">Pricing</Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* RIGHT: Theme + Avatar (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="text-[#9ca3af] hover:text-[#a855f7] hover:bg-[#1f2937]">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>YK</AvatarFallback>
          </Avatar>
        </div>

        {/* MOBILE MENU */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-64 border-[#1f2937] bg-[#111827] text-[#e2e8f0]">
              <div className="flex flex-col gap-6 mt-6 text-[#9ca3af]">

                {/* Logo */}
                <div className="text-lg font-bold text-[#e2e8f0]">YoLab</div>

                {/* Links */}
                <Link to="/services" className="hover:text-[#e5e7eb] transition-colors">Services</Link>
                <Link to="/products" className="hover:text-[#e5e7eb] transition-colors">Products</Link>
                <Link to="/about" className="hover:text-[#e5e7eb] transition-colors">About</Link>
                <Link to="/pricing" className="hover:text-[#e5e7eb] transition-colors">Pricing</Link>

                {/* Theme Toggle */}
                <Button variant="outline" onClick={toggleTheme} className="w-fit border-[#1f2937] bg-[#020617] text-[#e2e8f0] hover:border-[#a855f7] hover:text-[#a855f7]">
                  {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  {isDark ? "Light mode" : "Dark mode"}
                </Button>

                {/* Avatar */}
                <div className="pt-4 border-t border-[#1f2937]">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>YK</AvatarFallback>
                  </Avatar>
                </div>

              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </nav>
  )
}