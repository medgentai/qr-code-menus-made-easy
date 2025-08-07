import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isDarkSection, setIsDarkSection] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Check if we're over a dark section
      const navbarHeight = 80; // Approximate navbar height
      const elementAtNavbar = document.elementFromPoint(window.innerWidth / 2, navbarHeight);
      
      if (elementAtNavbar) {
        const computedStyle = window.getComputedStyle(elementAtNavbar);
        const backgroundColor = computedStyle.backgroundColor;
        const parentElement = elementAtNavbar.closest('section, div[class*="bg-"], footer, header');
        
        let isDark = false;
        
        if (parentElement) {
          const classList = parentElement.classList;
          // Check for dark background classes
          isDark = Array.from(classList).some(className => 
            className.includes('bg-navy') || 
            className.includes('bg-gray-900') || 
            className.includes('bg-black') ||
            className.includes('bg-slate-900') ||
            className.includes('bg-zinc-900')
          );
        }
        
        setIsDarkSection(isDark);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navbarBg = isDarkSection 
    ? (scrolled ? 'bg-black/10 backdrop-blur-md' : 'bg-black/20 backdrop-blur-sm')
    : (scrolled ? 'bg-white/99 backdrop-blur-md' : 'bg-white/95 backdrop-blur-sm');
  
  const textColor = isDarkSection ? 'text-white' : 'text-navy-800';
  const logoColor = isDarkSection ? 'text-white' : 'text-navy-800';
  const linkColor = isDarkSection ? 'text-white hover:text-orange-300' : 'text-navy-800 hover:text-orange-500';

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${navbarBg} ${scrolled ? 'shadow-lg py-3' : 'shadow-sm py-4'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className={`text-2xl font-bold transition-colors duration-300 ${logoColor}`}>
              Tap<span className="text-orange-500">Dodo</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={`font-medium transition-colors duration-300 relative ${isActive('/') ? 'text-orange-500 after:w-full' : linkColor} after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-orange-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full`}>Home</Link>
            <Link to="/features" className={`font-medium transition-colors duration-300 relative ${isActive('/features') ? 'text-orange-500 after:w-full' : linkColor} after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-orange-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full`}>Features</Link>
            <Link to="/how-it-works" className={`font-medium transition-colors duration-300 relative ${isActive('/how-it-works') ? 'text-orange-500 after:w-full' : linkColor} after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-orange-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full`}>How It Works</Link>
            <Link to="/use-cases" className={`font-medium transition-colors duration-300 relative ${isActive('/use-cases') ? 'text-orange-500 after:w-full' : linkColor} after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-orange-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full`}>Use Cases</Link>
            <Link to="/pricing" className={`font-medium transition-colors duration-300 relative ${isActive('/pricing') ? 'text-orange-500 after:w-full' : linkColor} after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-orange-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full`}>Pricing</Link>
            <Link to="/contact" className={`font-medium transition-colors duration-300 relative ${isActive('/contact') ? 'text-orange-500 after:w-full' : linkColor} after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-orange-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full`}>Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" className="hover-lift" asChild>
              <Link to="/auth/login">Login</Link>
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg" asChild>
              <Link to="/get-started">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-black/10">
                  <Menu className={`w-6 h-6 ${isDarkSection ? 'text-white' : 'text-navy-800'}`} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <Link to="/" className="flex items-center">
                      <span className="text-2xl font-bold text-navy-800">
                        Tap<span className="text-orange-500">Dodo</span>
                      </span>
                    </Link>
                  </div>
                  
                  <div className="flex-1 p-6">
                    <nav className="flex flex-col gap-4">
                      <Link 
                        to="/" 
                        className={`font-medium transition-colors duration-300 ${isActive('/') ? 'text-orange-500' : 'text-navy-800 hover:text-orange-500'} py-2`}
                      >
                        Home
                      </Link>
                      <Link 
                        to="/features" 
                        className={`font-medium transition-colors duration-300 ${isActive('/features') ? 'text-orange-500' : 'text-navy-800 hover:text-orange-500'} py-2`}
                      >
                        Features
                      </Link>
                      <Link 
                        to="/how-it-works" 
                        className={`font-medium transition-colors duration-300 ${isActive('/how-it-works') ? 'text-orange-500' : 'text-navy-800 hover:text-orange-500'} py-2`}
                      >
                        How It Works
                      </Link>
                      <Link 
                        to="/use-cases" 
                        className={`font-medium transition-colors duration-300 ${isActive('/use-cases') ? 'text-orange-500' : 'text-navy-800 hover:text-orange-500'} py-2`}
                      >
                        Use Cases
                      </Link>
                      <Link 
                        to="/pricing" 
                        className={`font-medium transition-colors duration-300 ${isActive('/pricing') ? 'text-orange-500' : 'text-navy-800 hover:text-orange-500'} py-2`}
                      >
                        Pricing
                      </Link>
                      <Link 
                        to="/contact" 
                        className={`font-medium transition-colors duration-300 ${isActive('/contact') ? 'text-orange-500' : 'text-navy-800 hover:text-orange-500'} py-2`}
                      >
                        Contact
                      </Link>
                    </nav>
                  </div>
                  
                  <div className="p-6 border-t">
                    <div className="flex flex-col gap-3">
                      <Button variant="outline" className="w-full hover-lift" asChild>
                        <Link to="/auth/login">Login</Link>
                      </Button>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 transition-colors duration-200" asChild>
                        <Link to="/get-started">Get Started</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>


        </div>


      </div>
    </header>
  );
};

export default Navbar;
