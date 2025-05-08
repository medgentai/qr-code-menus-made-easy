
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      
      {/* Floating elements */}
      <div className="absolute left-[10%] top-[20%] animate-float opacity-70">
        <Star className="h-8 w-8 text-yellow-300 animate-pulse" fill="#FBBF24" />
      </div>
      <div className="absolute right-[15%] bottom-[25%] animate-float [animation-delay:1s] opacity-70">
        <Sparkles className="h-10 w-10 text-yellow-300 animate-pulse [animation-delay:0.5s]" />
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-1 bg-white/30 mx-auto mb-8"></div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-sm">
            Ready to Transform Your Menu Experience?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses already using ScanServe to modernize their operations and delight their customers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button 
              className="bg-white text-orange-500 hover:bg-gray-100 text-base flex items-center gap-2 group px-8 py-6 h-auto rounded-xl shadow-xl shadow-orange-700/20"
              size="lg"
              asChild
            >
              <Link to="/get-started">
                Start Your Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-base px-8 py-6 h-auto rounded-xl"
              size="lg"
              asChild
            >
              <Link to="/demo">Request a Demo</Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center mt-10 gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white">
              <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Customer" className="h-full w-full object-cover" />
            </div>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white -ml-4">
              <img src="https://randomuser.me/api/portraits/men/36.jpg" alt="Customer" className="h-full w-full object-cover" />
            </div>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white -ml-4">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Customer" className="h-full w-full object-cover" />
            </div>
            <p className="text-white/90 ml-2">
              Join 2000+ satisfied customers
            </p>
          </div>
          
          <p className="text-white/80 mt-6">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
