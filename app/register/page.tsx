"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Eye, EyeOff } from "lucide-react"

export default function Register() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  const { register, error, clearError } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Clear any existing auth errors when component mounts
    clearError?.()
  }, [clearError])

  // Add new useEffect to check password requirements in real-time
  useEffect(() => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    })
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const unmetRequirements = Object.values(passwordRequirements).filter(met => !met).length
    if (unmetRequirements > 0) {
      setFormError("Please meet all password requirements")
      return
    }

    setIsLoading(true)

    try {
      await register(email, password, firstName, lastName)
      router.push("/")
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>Create an account to start scheduling poker games</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="space-y-1">
                  {Object.values(passwordRequirements).every(req => req) ? (
                    <div className="text-center">
                      <p className="text-base font-semibold text-[hsl(142.1,76.2%,36.3%)]">Password requirements achieved!</p>
                      <p className="text-sm text-[hsl(142.1,76.2%,36.3%)]">That's a dope password</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-base font-semibold text-destructive">Password must:</p>
                      <ul className="text-sm text-destructive list-disc pl-5 space-y-1">
                        {!passwordRequirements.length && (
                          <li>Be at least 8 characters</li>
                        )}
                        {!passwordRequirements.uppercase && (
                          <li>Contain an uppercase letter</li>
                        )}
                        {!passwordRequirements.lowercase && (
                          <li>Contain a lowercase letter</li>
                        )}
                        {!passwordRequirements.number && (
                          <li>Contain a number</li>
                        )}
                        {!passwordRequirements.special && (
                          <li>Contain a special character</li>
                        )}
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {(error || formError) && <div className="text-sm text-destructive">{error || formError}</div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Register"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-primary px-2 py-1 rounded-md transition-colors duration-200 hover:bg-primary/10"
              >
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

