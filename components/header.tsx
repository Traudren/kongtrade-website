
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, Settings, Youtube, Send } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation } from '@/hooks/useTranslation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { data: session, status } = useSession()
  const { t } = useTranslation()
  const router = useRouter()

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
  ]

  const resourcesLinks = [
    { name: 'FAQ', href: '#faq', icon: '❓', external: false, anchor: true },
    { name: 'Support', href: '#contact', icon: '💬', external: false, anchor: true },
    { name: 'API Guide', href: 'https://youtu.be/BCSwSqgH4A0', icon: '🔧', external: true },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-effect shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="KongTrade"
                width={60}
                height={60}
                className="h-14 w-14 rounded-lg"
              />
              <span className="ml-3 text-xl font-bold">
                <span className="text-white">Kong</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Trade</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                    Resources
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-effect border-white/20 rounded-xl min-w-[200px]">
                  {resourcesLinks.map((link) => {
                    const handleAnchorClick = () => {
                      // Check if we're on the home page
                      const isHomePage = window.location.pathname === '/'
                      if (isHomePage) {
                        // Scroll to element on current page
                        // Since FAQ and Footer are lazy loaded, we need to wait for them
                        const scrollToElement = (attempts = 0) => {
                          const element = document.querySelector(link.href)
                          if (element) {
                            const headerOffset = 80 // Account for fixed header
                            const elementPosition = element.getBoundingClientRect().top
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                            window.scrollTo({
                              top: offsetPosition,
                              behavior: 'smooth'
                            })
                          } else if (attempts < 10) {
                            // Retry up to 10 times (waiting for lazy loaded components)
                            setTimeout(() => scrollToElement(attempts + 1), 100)
                          } else {
                            console.warn(`Element not found after retries: ${link.href}`)
                          }
                        }
                        
                        // Start scrolling after a short delay to ensure lazy components are loaded
                        requestAnimationFrame(() => {
                          requestAnimationFrame(() => {
                            scrollToElement()
                          })
                        })
                      } else {
                        // Navigate to home page with hash
                        router.push(link.href)
                      }
                    }

                    return (
                      <DropdownMenuItem 
                        key={link.name} 
                        asChild={link.external}
                        onSelect={(e) => {
                          if (link.anchor) {
                            e.preventDefault()
                            // Small delay to ensure dropdown closes before scrolling
                            setTimeout(() => handleAnchorClick(), 50)
                          }
                        }}
                        onPointerDown={(e) => {
                          if (link.anchor) {
                            e.preventDefault()
                            e.stopPropagation()
                          }
                        }}
                        onClick={(e) => {
                          if (link.anchor) {
                            e.preventDefault()
                            e.stopPropagation()
                            handleAnchorClick()
                          }
                        }}
                        className="text-white rounded-lg text-sm flex items-center cursor-pointer focus:bg-white/10"
                      >
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center w-full"
                          >
                            <span className="mr-2">{link.icon}</span>
                            {link.name}
                          </a>
                        ) : link.anchor ? (
                          <div className="flex items-center w-full">
                            <span className="mr-2">{link.icon}</span>
                            {link.name}
                          </div>
                        ) : (
                          <Link
                            href={link.href}
                            className="flex items-center w-full"
                          >
                            <span className="mr-2">{link.icon}</span>
                            {link.name}
                          </Link>
                        )}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Social Media Links */}
            <div className="flex items-center space-x-3 border-l border-white/20 pl-4">
              <Link href="https://x.com/KongTrade_bot" target="_blank" className="text-gray-300 hover:text-cyan-400 transition-colors" title="X (Twitter)">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              <Link href="https://t.me/KongTrade_bot" target="_blank" className="text-gray-300 hover:text-cyan-400 transition-colors" title="Telegram">
                <Send className="h-4 w-4" />
              </Link>
              <Link href="https://www.youtube.com/channel/UCbiTXrgXZJzdfJAwjnxIXhg" target="_blank" className="text-gray-300 hover:text-cyan-400 transition-colors" title="YouTube">
                <Youtube className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">            
            {!mounted || status === 'loading' ? (
              <div className="w-8 h-8 bg-white/10 rounded-xl animate-pulse" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-cyan-400 hover:bg-white/10 rounded-xl text-sm">
                    <User className="h-4 w-4 mr-2" />
                    {session.user.name || session.user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-effect border-white/20 rounded-xl">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="text-white rounded-lg text-sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="text-white rounded-lg text-sm">
                        <User className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="text-white rounded-lg text-sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:text-cyan-400 hover:bg-white/10 rounded-xl text-sm px-4 py-2">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white hover-glow rounded-xl text-sm px-4 py-2">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 glass-effect rounded-xl mt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-300 hover:text-white transition-colors rounded-lg text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <p className="text-gray-300 font-medium mb-2 text-sm">Resources</p>
                {resourcesLinks.map((link) => (
                  link.external ? (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                    </a>
                  ) : link.anchor ? (
                    <a
                      key={link.name}
                      href={link.href}
                      className="block px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg text-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsMobileMenuOpen(false)
                        // Check if we're on the home page
                        const isHomePage = window.location.pathname === '/'
                        if (isHomePage) {
                          // Scroll to element on current page
                          setTimeout(() => {
                            const element = document.querySelector(link.href)
                            if (element) {
                              const headerOffset = 80 // Account for fixed header
                              const elementPosition = element.getBoundingClientRect().top
                              const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                              window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                              })
                            }
                          }, 100)
                        } else {
                          // Navigate to home page with hash
                          window.location.href = `/${link.href}`
                        }
                      }}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                    </Link>
                  )
                ))}
              </div>
              
              {/* Mobile Social Links */}
              <div className="flex items-center space-x-4 px-3 py-2 border-t border-white/10 pt-4">
                <Link href="https://x.com/KongTrade_bot" target="_blank" className="text-gray-300 hover:text-cyan-400 transition-colors" title="X (Twitter)">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </Link>
                <Link href="https://t.me/KongTrade_bot" target="_blank" className="text-gray-300 hover:text-cyan-400 transition-colors" title="Telegram">
                  <Send className="h-4 w-4" />
                </Link>
                <Link href="https://www.youtube.com/channel/UCbiTXrgXZJzdfJAwjnxIXhg" target="_blank" className="text-gray-300 hover:text-cyan-400 transition-colors" title="YouTube">
                  <Youtube className="h-4 w-4" />
                </Link>
              </div>

              <div className="pt-4 border-t border-white/10">                
                {mounted && session?.user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-gray-300 hover:text-white transition-colors rounded-lg text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {session.user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-3 py-2 text-gray-300 hover:text-white transition-colors rounded-lg text-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleSignOut()
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors rounded-lg text-sm"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-gray-300 hover:text-white transition-colors rounded-lg text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl text-sm">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
