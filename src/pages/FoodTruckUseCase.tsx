
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const FoodTruckUseCase = () => {
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
                  Maximize Your <span className="text-orange-500">Food Truck</span> Potential
                </h1>
                <p className="text-xl text-gray-700 mb-8">
                  Make the most of limited space and staff by enabling digital ordering directly from customers' phones.
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
                  src="https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=800&auto=format&fit=crop" 
                  alt="Food truck with customers" 
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
              <h2 className="text-3xl font-bold text-navy-800 mb-4">Benefits for Food Trucks</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                ScanServe helps food trucks overcome unique challenges and operate more efficiently
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Line Management",
                  description: "Allow customers to scan, browse and order while in line, reducing wait times and increasing throughput."
                },
                {
                  title: "Staff Efficiency",
                  description: "Operate with minimal staff by letting customers place orders digitally instead of verbally at the window."
                },
                {
                  title: "Real-time Menu Updates",
                  description: "Quickly update your menu as items sell out or when you add daily specials, all from your mobile device."
                },
                {
                  title: "Cost Savings",
                  description: "Eliminate the need for printed menus that quickly become outdated or damaged in a mobile environment."
                },
                {
                  title: "Order Accuracy",
                  description: "Improve order accuracy in busy environments by receiving precise digital orders directly from customers."
                },
                {
                  title: "Location Flexibility",
                  description: "Easily update your QR code with your current location information to help customers find you."
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
                <h2 className="text-3xl font-bold text-navy-800 mb-4">How It Works for Food Trucks</h2>
                <p className="text-gray-700">
                  Get your food truck set up with digital menus quickly and easily
                </p>
              </div>
              
              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: "Set Up Your Profile",
                    description: "Create your food truck profile with your logo, description, and social media links."
                  },
                  {
                    step: 2,
                    title: "Build Your Menu",
                    description: "Add your signature dishes with photos, descriptions, prices, and customization options."
                  },
                  {
                    step: 3,
                    title: "Generate QR Codes",
                    description: "Create QR codes to display on your truck, on signage, or on handouts to customers in line."
                  },
                  {
                    step: 4,
                    title: "Configure Order Flow",
                    description: "Set up how orders will be received and fulfilled, with options for pickup notifications."
                  },
                  {
                    step: 5,
                    title: "Go Live & Adapt",
                    description: "Launch your digital menu system and make real-time adjustments based on inventory and demand."
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
                Food Truck Success Story
              </h2>
              
              <div className="bg-gradient-to-r from-sky-50 to-orange-50 rounded-xl overflow-hidden shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 md:p-10">
                    <div className="inline-block px-4 py-1 bg-orange-100 text-orange-500 font-medium rounded-full mb-4">
                      Street Food Success
                    </div>
                    <h3 className="text-2xl font-bold text-navy-800 mb-4">
                      How Taco Revolution Serves 40% More Customers
                    </h3>
                    <p className="text-gray-600 mb-6">
                      "Before ScanServe, we could only handle a few orders at a time. Now our customers scan the QR code while in line and their orders are ready when they reach the window. We've dramatically increased our capacity without adding staff."
                    </p>
                    <div className="flex items-center">
                      <img 
                        src="https://randomuser.me/api/portraits/men/75.jpg" 
                        alt="Carlos Mendez" 
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-navy-800">Carlos Mendez</h4>
                        <p className="text-sm text-gray-500">Owner, Taco Revolution</p>
                      </div>
                    </div>
                    <Button className="mt-6 btn-primary" asChild>
                      <Link to="/success-stories">Read Full Story</Link>
                    </Button>
                  </div>
                  
                  <div>
                    <img 
                      src="https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600&auto=format&fit=crop" 
                      alt="Taco Revolution food truck" 
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
                Ready to Revolutionize Your Food Truck?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join successful food trucks already using ScanServe to streamline operations and serve more customers.
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

export default FoodTruckUseCase;
