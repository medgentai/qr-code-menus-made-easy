
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-navy-800">
              Scan<span className="text-orange-500">Serve</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="nav-link font-medium">Home</Link>
            <Link to="/features" className="nav-link font-medium">Features</Link>
            <Link to="/how-it-works" className="nav-link font-medium">How It Works</Link>
            <Link to="/use-cases" className="nav-link font-medium">Use Cases</Link>
            <Link to="/pricing" className="nav-link font-medium">Pricing</Link>
            <Link to="/contact" className="nav-link font-medium">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" asChild>
              <Link to="/get-started">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden text-navy-800 hover:text-orange-500"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-6 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link to="/" className="nav-link font-medium py-2" onClick={toggleMenu}>Home</Link>
              <Link to="/features" className="nav-link font-medium py-2" onClick={toggleMenu}>Features</Link>
              <Link to="/how-it-works" className="nav-link font-medium py-2" onClick={toggleMenu}>How It Works</Link>
              <Link to="/use-cases" className="nav-link font-medium py-2" onClick={toggleMenu}>Use Cases</Link>
              <Link to="/pricing" className="nav-link font-medium py-2" onClick={toggleMenu}>Pricing</Link>
              <Link to="/contact" className="nav-link font-medium py-2" onClick={toggleMenu}>Contact</Link>
            </nav>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login" onClick={toggleMenu}>Login</Link>
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 w-full" asChild>
                <Link to="/get-started" onClick={toggleMenu}>Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
