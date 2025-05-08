
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-orange-500 to-orange-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Menu Experience?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses already using ScanServe to modernize their operations and delight their customers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-white text-orange-500 hover:bg-gray-100 text-base flex items-center gap-2 group"
              size="lg"
              asChild
            >
              <Link to="/get-started">
                Start Your Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-base"
              size="lg"
              asChild
            >
              <Link to="/demo">Request a Demo</Link>
            </Button>
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
