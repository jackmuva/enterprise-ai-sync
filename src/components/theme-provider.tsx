"use client"

import { useEffect } from "react"

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove any existing theme classes
    root.classList.remove("light", "dark")
    
    // Check system preference and apply appropriate theme
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches ? "dark" : "light"
    
    root.classList.add(systemTheme)
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent) => {
      root.classList.remove("light", "dark")
      root.classList.add(e.matches ? "dark" : "light")
    }
    
    mediaQuery.addEventListener("change", handleChange)
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return <>{children}</>
} 