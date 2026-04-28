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
import { Menu } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-background px-4 md:px-8">
      <div className="flex h-16 items-center justify-between">

        {/* LEFT: Logo */}
        <div className="text-xl font-bold">
          <Link to="/">YoLab</Link>
        </div>

        {/* CENTER: Desktop Menu */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <Link to="/services">Services</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/products">Products</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/pricing">Pricing</Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* RIGHT: Avatar (Desktop) */}
        <div className="hidden md:flex items-center">
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

            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-6 mt-6">

                {/* Logo */}
                <div className="text-lg font-bold">YoLab</div>

                {/* Links */}
                <Link to="/services">Services</Link>
                <Link to="/products">Products</Link>
                <Link to="/pricing">Pricing</Link>

                {/* Avatar */}
                <div className="pt-4 border-t">
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