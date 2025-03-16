"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    closeMenu()
  }

  const navItems = [
    { label: "Home", href: "/" },
    { label: "My Games", href: "/my-games" },
    { label: "Past Games", href: "/past-games" },
    { label: "Create Game", href: "/create-game" },
  ]

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-primary">
            Poker Game Planner
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md hover:bg-muted transition-colors ${
                      pathname === item.href ? "bg-muted text-primary" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="ml-4 flex items-center">
                  <span className="mr-4 text-muted-foreground">
                    {user.firstName} {user.lastName}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-border mt-3">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-muted-foreground">
                    {user.firstName} {user.lastName}
                  </div>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-md hover:bg-muted transition-colors ${
                        pathname === item.href ? "bg-muted text-primary" : "text-foreground"
                      }`}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button variant="outline" className="mt-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMenu}>
                    <Button className="w-full">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

