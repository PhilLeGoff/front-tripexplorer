"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Mail, ArrowLeft } from "lucide-react"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateEmail = () => {
    if (!email) {
      setError("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail()) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <Globe className="h-10 w-10 text-primary" />
                <span className="text-2xl font-bold">TripExplorer</span>
              </Link>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Check Your Email</CardTitle>
                <CardDescription>We've sent password reset instructions to your email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <Mail className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground text-center">Didn't receive the email? Check your spam folder or try again.</p>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsSubmitted(false)}>
                  Try Another Email
                </Button>
                <Link href="/auth/signin" className="text-sm text-primary hover:underline">
                  Back to Sign In
                </Link>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Globe className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold">TripExplorer</span>
            </Link>
            <h1 className="text-balance text-3xl font-bold">Forgot Password?</h1>
            <p className="text-pretty text-muted-foreground mt-2">No worries, we'll send you reset instructions</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Enter your email address to receive a reset link</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError("")
                      }}
                      aria-invalid={!!error}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <Link href="/auth/signin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mx-auto">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}


