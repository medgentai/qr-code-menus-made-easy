
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const CafeUseCase = () => {
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
                  Streamline Your <span className="text-orange-500">Café & Bar</span> Experience
                </h1>
                <p className="text-xl text-gray-700 mb-8">
                  Speed up service, reduce wait times, and manage orders more efficiently in your fast-paced environment.
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
                  src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop" 
                  alt="Café customer using QR code menu" 
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
              <h2 className="text-3xl font-bold text-navy-800 mb-4">Benefits for Cafés & Bars</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                ScanServe helps you manage peak times more efficiently and deliver exceptional service
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Queue Management",
                  description: "Allow customers to browse the menu while waiting, reducing perceived wait times and improving the customer experience."
                },
                {
                  title: "Visual Menu Items",
                  description: "Showcase beautiful images of your specialty drinks and food items to increase average order value."
                },
                {
                  title: "Time-Based Menus",
                  description: "Easily switch between breakfast, lunch, dinner, and late-night menus with scheduled updates."
                },
                {
                  title: "Happy Hour Specials",
                  description: "Highlight time-limited promotions and automatically update prices during happy hour periods."
                },
                {
                  title: "Order Efficiency",
                  description: "Process more orders during peak times with streamlined digital ordering directly from tables."
                },
                {
                  title: "Allergen Information",
                  description: "Clearly display allergen information and ingredient details for all menu items to keep customers informed."
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
                <h2 className="text-3xl font-bold text-navy-800 mb-4">How It Works for Cafés & Bars</h2>
                <p className="text-gray-700">
                  Get up and running with digital menus in just a few simple steps
                </p>
              </div>
              
              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: "Create Your Profile",
                    description: "Set up your café or bar profile with your logo, branding, and business information."
                  },
                  {
                    step: 2,
                    title: "Design Your Menu",
                    description: "Add your food and drink items with descriptions, prices, images, and categories for easy browsing."
                  },
                  {
                    step: 3,
                    title: "Generate QR Codes",
                    description: "Create custom QR codes to place on tables, at the counter, or in waiting areas."
                  },
                  {
                    step: 4,
                    title: "Configure Order Flow",
                    description: "Set up how orders are received, processed, and managed by your staff for maximum efficiency."
                  },
                  {
                    step: 5,
                    title: "Launch & Monitor",
                    description: "Go live with your digital menu and use the analytics dashboard to track performance and customer behavior."
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
                Café Success Story
              </h2>
              
              <div className="bg-gradient-to-r from-sky-50 to-orange-50 rounded-xl overflow-hidden shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 md:p-10">
                    <div className="inline-block px-4 py-1 bg-orange-100 text-orange-500 font-medium rounded-full mb-4">
                      Specialty Café Case Study
                    </div>
                    <h3 className="text-2xl font-bold text-navy-800 mb-4">
                      How Urban Brew Increased Revenue by 22%
                    </h3>
                    <p className="text-gray-600 mb-6">
                      "With ScanServe, we've eliminated long lines during the morning rush. Customers can order from their table, and our average ticket size has increased significantly as people can browse our entire menu at their leisure."
                    </p>
                    <div className="flex items-center">
                      <img 
                        src="https://randomuser.me/api/portraits/men/36.jpg" 
                        alt="Jason Kim" 
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-navy-800">Jason Kim</h4>
                        <p className="text-sm text-gray-500">Owner, Urban Brew Café</p>
                      </div>
                    </div>
                    <Button className="mt-6 btn-primary" asChild>
                      <Link to="/success-stories">Read Full Story</Link>
                    </Button>
                  </div>
                  
                  <div>
                    <img 
                      src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop" 
                      alt="Urban Brew Café" 
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
                Ready to Transform Your Café or Bar?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join hundreds of cafés and bars already using ScanServe to improve operations and delight customers.
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

export default CafeUseCase;
