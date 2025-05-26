
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { state: { isAuthenticated, user }, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Check initial scroll position on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-4'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-navy-800">
              Scan<span className="text-orange-500">Serve</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={`nav-link font-medium ${isActive('/') ? 'text-orange-500 after:w-full' : ''}`}>Home</Link>
            <Link to="/features" className={`nav-link font-medium ${isActive('/features') ? 'text-orange-500 after:w-full' : ''}`}>Features</Link>
            <Link to="/how-it-works" className={`nav-link font-medium ${isActive('/how-it-works') ? 'text-orange-500 after:w-full' : ''}`}>How It Works</Link>
            <Link to="/use-cases" className={`nav-link font-medium ${isActive('/use-cases') ? 'text-orange-500 after:w-full' : ''}`}>Use Cases</Link>
            <Link to="/pricing" className={`nav-link font-medium ${isActive('/pricing') ? 'text-orange-500 after:w-full' : ''}`}>Pricing</Link>
            <Link to="/contact" className={`nav-link font-medium ${isActive('/contact') ? 'text-orange-500 after:w-full' : ''}`}>Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="outline" className="hover-lift" asChild>
                  <Link to="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="hover:bg-red-50 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="hover-lift" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg" asChild>
                  <Link to="/get-started">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-navy-800 hover:text-orange-500 transition-colors z-50"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 bg-white pt-20 px-6 pb-6 animate-fade-in z-40">
            <nav className="flex flex-col gap-4">
              <Link to="/" className={`nav-link font-medium py-2 text-lg ${isActive('/') ? 'text-orange-500' : ''}`} onClick={toggleMenu}>Home</Link>
              <Link to="/features" className={`nav-link font-medium py-2 text-lg ${isActive('/features') ? 'text-orange-500' : ''}`} onClick={toggleMenu}>Features</Link>
              <Link to="/how-it-works" className={`nav-link font-medium py-2 text-lg ${isActive('/how-it-works') ? 'text-orange-500' : ''}`} onClick={toggleMenu}>How It Works</Link>
              <Link to="/use-cases" className={`nav-link font-medium py-2 text-lg ${isActive('/use-cases') ? 'text-orange-500' : ''}`} onClick={toggleMenu}>Use Cases</Link>
              <Link to="/pricing" className={`nav-link font-medium py-2 text-lg ${isActive('/pricing') ? 'text-orange-500' : ''}`} onClick={toggleMenu}>Pricing</Link>
              <Link to="/contact" className={`nav-link font-medium py-2 text-lg ${isActive('/contact') ? 'text-orange-500' : ''}`} onClick={toggleMenu}>Contact</Link>
            </nav>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" className="w-full text-lg py-6" asChild>
                    <Link to="/dashboard" onClick={toggleMenu}>
                      <User className="mr-2 h-5 w-5" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    className="bg-red-50 text-red-600 hover:bg-red-100 w-full text-lg py-6"
                    onClick={() => {
                      toggleMenu();
                      handleLogout();
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full text-lg py-6" asChild>
                    <Link to="/login" onClick={toggleMenu}>Login</Link>
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600 w-full text-lg py-6" asChild>
                    <Link to="/get-started" onClick={toggleMenu}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
