
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Scan, Smartphone, Utensils } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-sky-50 pt-24">
      {/* Background patterns and shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-orange-100 opacity-50 blur-3xl"></div>
        <div className="absolute top-60 -left-20 w-72 h-72 rounded-full bg-sky-100 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 -translate-x-1/2 rounded-full bg-orange-50 opacity-30 blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>

      <div className="container-custom relative min-h-[calc(100vh-76px)] flex flex-col justify-center py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="max-w-xl">
            <div className="inline-block px-4 py-1 bg-orange-100 text-orange-600 font-medium rounded-full mb-6 animate-fade-in">
              Next-Gen Digital Menu Solution
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-navy-800 leading-tight mb-6 animate-fade-in [animation-delay:0.1s]">
              QR Code Menus <span className="text-orange-500 relative">
                Made Easy
                <span className="absolute bottom-1 left-0 w-full h-2 bg-orange-200 -z-10"></span>
              </span> for Your Business
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 animate-fade-in [animation-delay:0.2s]">
              Transform your menu experience with contactless, customizable digital menus. Update in real-time, reduce costs, and delight your customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in [animation-delay:0.3s]">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-6 h-auto text-base flex items-center gap-2 group rounded-xl shadow-lg shadow-orange-500/20" size="lg" asChild>
                <Link to="/get-started">
                  Get Started Free 
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button className="bg-white border border-gray-200 text-navy-800 hover:border-orange-300 hover:bg-orange-50 font-medium px-8 py-6 h-auto text-base rounded-xl" size="lg" asChild>
                <Link to="/how-it-works">See How It Works</Link>
              </Button>
            </div>
            <div className="mt-6 text-gray-600 text-sm animate-fade-in [animation-delay:0.4s]">
              No credit card required. Free 14-day trial.
            </div>
          </div>
          
          <div className="relative lg:ml-auto animate-fade-in [animation-delay:0.3s]">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-orange-500/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-sky-200/30 rounded-full blur-xl"></div>
            
            <div className="relative z-10 transform hover:rotate-1 hover:scale-[1.02] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-sky-300/20 rounded-2xl blur-lg"></div>
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-3">
                <img 
                  src="https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&auto=format&fit=crop" 
                  alt="ScanServe QR code menu in action" 
                  className="w-full h-auto rounded-xl shadow-sm"
                />
                
                <div className="absolute -right-6 -top-6 bg-white rounded-full p-5 shadow-lg rotate-12 animate-bounce [animation-duration:4s]">
                  <Scan className="h-8 w-8 text-orange-500" />
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-500 text-white p-3 rounded-lg">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-800">Instant QR Access</h3>
                      <p className="text-sm text-gray-600">Customers scan & order in seconds</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -right-4 bottom-1/3 bg-white rounded-lg p-3 shadow-lg animate-float rotate-6">
              <div className="flex items-center gap-2">
                <div className="bg-sky-100 p-2 rounded-full">
                  <Utensils className="h-4 w-4 text-sky-600" />
                </div>
                <span className="text-xs font-medium text-navy-800">Order Received!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="white">
          <path fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
