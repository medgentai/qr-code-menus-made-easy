
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, ClipboardCheck, Clock, FileText, ImageIcon, LayoutDashboard, List, QrCode, Settings, Users } from 'lucide-react';

const FeaturesList = [
  {
    icon: <QrCode className="h-10 w-10 text-orange-500" />,
    title: "Dynamic QR Code Generation",
    description: "Create custom QR codes for each table, room, or location. Update them instantly without replacing physical codes."
  },
  {
    icon: <ImageIcon className="h-10 w-10 text-orange-500" />,
    title: "Visual Menu Builder",
    description: "Create stunning, interactive digital menus with our drag-and-drop builder. Add vivid images, detailed descriptions, and allergen information."
  },
  {
    icon: <ClipboardCheck className="h-10 w-10 text-orange-500" />,
    title: "Order Management",
    description: "Receive and manage orders in real-time. Keep track of order status, notify staff, and maintain a seamless workflow."
  },
  {
    icon: <Clock className="h-10 w-10 text-orange-500" />,
    title: "Real-time Menu Updates",
    description: "Update prices, add new items, or mark items as sold out instantly. Changes are reflected immediately on all customer-facing menus."
  },
  {
    icon: <LayoutDashboard className="h-10 w-10 text-orange-500" />,
    title: "Comprehensive Dashboard",
    description: "Monitor sales, popular items, peak ordering times, and other key metrics from your user-friendly dashboard."
  },
  {
    icon: <List className="h-10 w-10 text-orange-500" />,
    title: "Advanced Menu Management",
    description: "Organize items by category, add modifiers and variations, set availability schedules, and manage multiple menus for different locations or times."
  },
  {
    icon: <Settings className="h-10 w-10 text-orange-500" />,
    title: "Customization Options",
    description: "Match your brand with custom colors, logos, fonts, and styling options for a cohesive customer experience."
  },
  {
    icon: <FileText className="h-10 w-10 text-orange-500" />,
    title: "Detailed Analytics",
    description: "Gain insights into ordering patterns, popular items, peak times, and customer behavior to optimize your offerings."
  },
  {
    icon: <Users className="h-10 w-10 text-orange-500" />,
    title: "Team Management",
    description: "Assign roles and permissions to staff members, track activity, and ensure smooth operations across your organization."
  }
];

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-sky-50 py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
                Powerful <span className="text-orange-500">Features</span> for Modern Businesses
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Everything you need to create exceptional digital menu experiences and streamline your operations.
              </p>
              <Button className="btn-primary text-base" size="lg" asChild>
                <Link to="/get-started">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Features List Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FeaturesList.map((feature, index) => (
                <div 
                  key={index} 
                  className="feature-card group hover-scale"
                >
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-navy-800 mb-2 group-hover:text-orange-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="section bg-sky-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
                Benefits That Drive <span className="text-orange-500">Business Growth</span>
              </h2>
              <p className="text-lg text-gray-700">
                See how ScanServe delivers real value to your business.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <ul className="space-y-6">
                  {[
                    "Reduce printing costs by eliminating paper menus",
                    "Increase order accuracy and customer satisfaction",
                    "Speed up service with instant order transmission",
                    "Easily update menus to reflect availability and specials",
                    "Gain insights with comprehensive analytics",
                    "Free up staff time by streamlining the ordering process",
                    "Create a modern, tech-forward impression with customers",
                    "Increase average order value with visual menu items"
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-4 md:-inset-6 bg-gradient-to-r from-orange-500/20 to-sky-200/20 rounded-xl blur-lg -z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&auto=format&fit=crop" 
                  alt="Restaurant team celebrating success" 
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
        
  
      </main>
      
      <Footer />
    </div>
  );
};

export default Features;
