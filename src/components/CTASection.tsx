
import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

// Optimized decorative elements as a separate component
const DecorativeElements = memo(() => (
  <>
    <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
    <div className="absolute right-1/4 top-1/3 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl animate-pulse-subtle"></div>

    <div className="absolute left-[10%] top-[20%] animate-float opacity-70">
      <Star className="h-8 w-8 text-yellow-300 animate-pulse" fill="#FBBF24" />
    </div>
    <div className="absolute right-[15%] bottom-[25%] animate-float [animation-delay:1s] opacity-70">
      <Sparkles className="h-10 w-10 text-yellow-300 animate-pulse [animation-delay:0.5s]" />
    </div>
    <div className="absolute left-[20%] bottom-[15%] animate-float [animation-delay:1.5s] opacity-60">
      <div className="h-6 w-6 bg-white/50 rounded-full"></div>
    </div>
    <div className="absolute right-[25%] top-[15%] animate-float [animation-delay:2s] opacity-60">
      <div className="h-4 w-4 bg-yellow-200/70 rounded-full"></div>
    </div>
  </>
));

DecorativeElements.displayName = 'DecorativeElements';

// Optimized testimonial avatars component
const CustomerAvatars = memo(() => (
  <div className="flex items-center justify-center mt-10 gap-3">
    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white hover:scale-110 transition-transform duration-300">
      <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Customer" className="h-full w-full object-cover" />
    </div>
    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white -ml-4 hover:scale-110 transition-transform duration-300 hover:z-10">
      <img src="https://randomuser.me/api/portraits/men/36.jpg" alt="Customer" className="h-full w-full object-cover" />
    </div>
    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white -ml-4 hover:scale-110 transition-transform duration-300 hover:z-10">
      <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Customer" className="h-full w-full object-cover" />
    </div>
    <p className="text-white/90 ml-2">
      Join 2000+ satisfied customers
    </p>
  </div>
));

CustomerAvatars.displayName = 'CustomerAvatars';

// Main component with optimization using React.memo
const CTASection = memo(() => {
  const { state: { isAuthenticated } } = useAuth();
  const navigate = useNavigate();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

      {/* Decorative elements */}
      <DecorativeElements />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-1 bg-white/30 mx-auto mb-8"></div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-sm">
            Ready to Transform Your Menu Experience?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses already using ScanServe to modernize their operations and delight their customers.
          </p>

          <div className="flex justify-center">
            {isAuthenticated ? (
              <Button
                className="bg-white text-orange-500 hover:bg-gray-100 text-base flex items-center gap-2 group px-8 py-6 h-auto rounded-xl shadow-xl shadow-orange-700/20 hover:-translate-y-1 transition-all duration-300"
                size="lg"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
                <LayoutDashboard size={18} className="ml-2" />
              </Button>
            ) : (
              <Button
                className="bg-white text-orange-500 hover:bg-gray-100 text-base flex items-center gap-2 group px-8 py-6 h-auto rounded-xl shadow-xl shadow-orange-700/20 hover:-translate-y-1 transition-all duration-300"
                size="lg"
                asChild
              >
                <Link to="/get-started">
                  Book a Free Demo
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            )}
          </div>

          <CustomerAvatars />

          {!isAuthenticated && (
            <p className="text-white/80 mt-6">
              Start managing your venue today.
            </p>
          )}
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';

export default CTASection;
