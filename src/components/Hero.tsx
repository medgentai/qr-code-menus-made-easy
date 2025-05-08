
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-sky-50 pt-24">
      <div className="container-custom min-h-[calc(100vh-76px)] flex flex-col justify-center py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-800 leading-tight mb-6">
              QR Code Menus <span className="text-orange-500">Made Easy</span> for Your Business
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Transform your menu experience with contactless, customizable digital menus. Update in real-time, reduce costs, and delight your customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="btn-primary text-base flex items-center gap-2 group" size="lg" asChild>
                <Link to="/get-started">
                  Get Started Free 
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button className="btn-secondary text-base" size="lg" asChild>
                <Link to="/how-it-works">See How It Works</Link>
              </Button>
            </div>
            <div className="mt-6 text-gray-600 text-sm">
              No credit card required. Free 14-day trial.
            </div>
          </div>
          
          <div className="relative lg:ml-auto animate-fade-in">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-orange-500/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-sky-200/30 rounded-full blur-xl"></div>
            
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-1">
              <img 
                src="https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&auto=format&fit=crop" 
                alt="ScanServe QR code menu in action" 
                className="w-full h-auto rounded-xl"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-500 text-white p-2 rounded-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <rect x="7" y="7" width="3" height="3"></rect>
                      <rect x="14" y="7" width="3" height="3"></rect>
                      <rect x="7" y="14" width="3" height="3"></rect>
                      <rect x="14" y="14" width="3" height="3"></rect>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-800">Instant QR Access</h3>
                    <p className="text-sm text-gray-600">Customers scan & order in seconds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};

export default Hero;
