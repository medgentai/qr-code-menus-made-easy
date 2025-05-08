
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const HotelUseCase = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-sky-50 py-16 md:py-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
                  Transform Hotel Dining with <span className="text-orange-500">ScanServe</span>
                </h1>
                <p className="text-xl text-gray-700 mb-8">
                  Enhance guest experience with convenient digital room service and on-site dining options accessible via QR codes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="btn-primary text-base" size="lg" asChild>
                    <Link to="/get-started">Get Started Free</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/contact">Request Demo</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop" 
                  alt="Hotel guest using QR code menu" 
                  className="rounded-lg shadow-lg w-full"
                />
                <div className="absolute -bottom-6 -left-6 bg-orange-500 w-32 h-32 rounded-lg opacity-20"></div>
                <div className="absolute -top-6 -right-6 bg-sky-500 w-32 h-32 rounded-lg opacity-20"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-800 mb-4">Benefits for Hotels</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                ScanServe transforms hotel dining operations and guest experiences
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Contactless Room Service",
                  description: "Allow guests to order room service directly from their mobile devices without touching shared menus or making phone calls."
                },
                {
                  title: "Multiple Venue Management",
                  description: "Easily update menus across all hotel dining venues from a single dashboard - from room service to restaurants to lobby bars."
                },
                {
                  title: "PMS Integration",
                  description: "Seamlessly integrate with popular hotel property management systems for room charging and unified guest profiles."
                },
                {
                  title: "Multi-language Support",
                  description: "Offer menus in multiple languages to accommodate international guests without printing different menu versions."
                },
                {
                  title: "Dietary Filters",
                  description: "Enable guests to filter menu items based on dietary preferences or restrictions, enhancing their dining experience."
                },
                {
                  title: "Reduce Printing Costs",
                  description: "Eliminate the need for printed in-room dining menus, reducing costs and supporting sustainability initiatives."
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="bg-orange-100 text-orange-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Check size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-navy-800 mb-2">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="section bg-sky-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-4">How It Works for Hotels</h2>
                <p className="text-gray-700">
                  Our simplified process gets your hotel up and running with digital menus in no time
                </p>
              </div>
              
              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: "Set Up Your Hotel Profile",
                    description: "Create your hotel account, add your branding, and configure your various dining venues."
                  },
                  {
                    step: 2,
                    title: "Upload Your Menus",
                    description: "Easily input menu items with descriptions, prices, dietary information, and high-quality images."
                  },
                  {
                    step: 3,
                    title: "Generate & Place QR Codes",
                    description: "Create custom QR codes for different locations - guest rooms, lobby, restaurant tables, and more."
                  },
                  {
                    step: 4,
                    title: "Configure Ordering Options",
                    description: "Set up room service capabilities, in-restaurant ordering, and payment preferences."
                  },
                  {
                    step: 5,
                    title: "Go Live & Monitor",
                    description: "Launch your digital menus and use the dashboard to track orders, update menus, and analyze performance."
                  }
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-6 bg-white p-6 rounded-xl shadow-sm">
                    <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy-800 mb-2">{step.title}</h3>
                      <p className="text-gray-700">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Success Story */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-navy-800 mb-12 text-center">
                Hotel Success Story
              </h2>
              
              <div className="bg-gradient-to-r from-sky-50 to-orange-50 rounded-xl overflow-hidden shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 md:p-10">
                    <div className="inline-block px-4 py-1 bg-orange-100 text-orange-500 font-medium rounded-full mb-4">
                      Luxury Hotel Case Study
                    </div>
                    <h3 className="text-2xl font-bold text-navy-800 mb-4">
                      How Grand Plaza Hotel Improved Guest Satisfaction by 35%
                    </h3>
                    <p className="text-gray-600 mb-6">
                      "ScanServe has revolutionized our in-room dining and restaurant operations. Guests love the convenience of ordering from their mobile devices, and our staff can focus on delivering exceptional service instead of taking orders over the phone."
                    </p>
                    <div className="flex items-center">
                      <img 
                        src="https://randomuser.me/api/portraits/women/45.jpg" 
                        alt="Rebecca Thompson" 
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-navy-800">Rebecca Thompson</h4>
                        <p className="text-sm text-gray-500">Food & Beverage Director, Grand Plaza Hotel</p>
                      </div>
                    </div>
                    <Button className="mt-6 btn-primary" asChild>
                      <Link to="/success-stories">Read Full Story</Link>
                    </Button>
                  </div>
                  
                  <div>
                    <img 
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop" 
                      alt="Grand Plaza Hotel" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="section bg-navy-800 text-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Elevate Your Hotel's Dining Experience Today
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join leading hotels already using ScanServe to delight their guests and streamline operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white text-base flex items-center gap-2 group"
                  size="lg"
                  asChild
                >
                  <Link to="/get-started">
                    Start Your Free Trial 
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  className="bg-transparent border-2 border-white hover:bg-white/10 text-white text-base"
                  size="lg"
                  asChild
                >
                  <Link to="/contact">Request Custom Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HotelUseCase;
