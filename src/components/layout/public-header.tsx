"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const NavLinks = ({ className, onLinkClick }: { className?: string; onLinkClick?: () => void }) => {
  const links = [
    { href: '#features', label: 'Características' },
    { href: '#planes', label: 'Planes' },
    { href: '/contact', label: 'Contacto' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <nav className={cn('flex items-center gap-6 text-sm font-medium', className)}>
      {links.map((link) => (
        <Link 
            key={link.label} 
            href={link.href} 
            onClick={(e) => handleLinkClick(e, link.href)}
            className="text-foreground/80 transition-colors hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};


export default function PublicHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-background/95 shadow-md backdrop-blur-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="hidden sm:inline-block">WebSapMax</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
            <NavLinks />
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 p-6">
                 <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    <span>WebSapMax</span>
                </Link>
                <NavLinks className="flex-col items-start text-lg gap-4" onLinkClick={() => setIsMobileMenuOpen(false)} />
                <div className="flex flex-col gap-2 mt-auto">
                    <Button variant="outline" asChild size="lg">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Iniciar Sesión</Link>
                    </Button>
                    <Button asChild size="lg">
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>Registrarse</Link>
                    </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
