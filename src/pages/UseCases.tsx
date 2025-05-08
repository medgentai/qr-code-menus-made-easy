
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const useCases = [
  {
    title: "Restaurants",
    description: "Streamline table service, increase order accuracy, and enhance the dining experience with digital menus and ordering.",
    benefits: [
      "Eliminate printing costs for physical menus",
      "Update menu items and prices in real-time",
      "Reduce order errors with direct digital ordering",
      "Free up staff time with efficient order management",
      "Create a modern, tech-forward impression"
    ],
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop",
    link: "/use-cases/restaurants"
  },
  {
    title: "Hotels",
    description: "Enhance guest experience with convenient digital room service and on-site dining options accessible via QR codes.",
    benefits: [
      "Offer contactless room service ordering",
      "Easily update menus for all hotel dining venues",
      "Integrate with hotel management systems",
      "Improve service efficiency and guest satisfaction",
      "Reduce printing costs for in-room materials"
    ],
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop",
    link: "/use-cases/hotels"
  },
  {
    title: "Cafés & Bars",
    description: "Speed up service, reduce wait times, and manage orders more efficiently in fast-paced environments.",
    benefits: [
      "Allow customers to browse menu while waiting",
      "Increase average order value with visual menu items",
      "Easily update menus for different times of day",
      "Manage peak times more efficiently",
      "Create a streamlined ordering experience"
    ],
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&auto=format&fit=crop",
    link: "/use-cases/cafes"
  },
  {
    title: "Food Trucks",
    description: "Maximize limited space and staff by enabling digital ordering directly from customers' phones.",
    benefits: [
      "Allow customers to browse menu while in line",
      "Increase efficiency with limited staff",
      "Update menu quickly as items sell out",
      "Reduce printing costs for temporary menus",
      "Improve order accuracy in busy environments"
    ],
    image: "https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=600&auto=format&fit=crop",
    link: "/use-cases/food-trucks"
  },
  {
    title: "Event Spaces",
    description: "Provide seamless food and beverage service for weddings, conferences, and special events.",
    benefits: [
      "Create custom menus for specific events",
      "Offer easy food ordering for event attendees",
      "Simplify the ordering process for large groups",
      "Manage multiple service areas efficiently",
      "Collect valuable data on ordering patterns"
    ],
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop",
    link: "/use-cases/event-spaces"
  },
  {
    title: "Multi-Location Chains",
    description: "Manage menus across multiple locations while maintaining brand consistency and quality control.",
    benefits: [
      "Centrally manage menus for all locations",
      "Update pricing or items by location or region",
      "Maintain consistent branding across all venues",
      "Analyze performance data across locations",
      "Simplify menu management for franchises"
    ],
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop",
    link: "/use-cases/multi-location"
  }
];

const UseCases = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-sky-50 py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
                <span className="text-orange-500">ScanServe</span> For Every Business
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Discover how our digital menu solutions can be tailored to meet the specific needs of your industry.
              </p>
              <Button className="btn-primary text-base" size="lg" asChild>
                <Link to="/get-started">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Use Cases Grid */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-xl shadow-md hover-scale bg-white border border-gray-100"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={useCase.image} 
                      alt={useCase.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-800 mb-2 group-hover:text-orange-500 transition-colors">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-700 mb-4">
                      {useCase.description}
                    </p>
                    <Button className="btn-outline w-full" size="sm" asChild>
                      <Link to={useCase.link}>
                        Learn More
                        <ArrowRight size={16} className="ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Success Story */}
        <section className="section bg-sky-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-navy-800 mb-12 text-center">
                Customer Success Stories
              </h2>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 md:p-10">
                    <div className="inline-block px-4 py-1 bg-orange-100 text-orange-500 font-medium rounded-full mb-4">
                      Restaurant Success
                    </div>
                    <h3 className="text-2xl font-bold text-navy-800 mb-4">
                      How Taste of Italy Increased Orders by 30%
                    </h3>
                    <p className="text-gray-600 mb-6">
                      "Before ScanServe, we were spending thousands on printing menus. Now, we can update our menu instantly, showcase beautiful photos of our dishes, and our customers love the convenience of ordering directly from their phones."
                    </p>
                    <div className="flex items-center">
                      <img 
                        src="https://randomuser.me/api/portraits/women/32.jpg" 
                        alt="Sarah Johnson" 
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-navy-800">Sarah Johnson</h4>
                        <p className="text-sm text-gray-500">Owner, Taste of Italy</p>
                      </div>
                    </div>
                    <Button className="mt-6 btn-primary" asChild>
                      <Link to="/success-stories">Read Full Story</Link>
                    </Button>
                  </div>
                  
                  <div className="bg-gray-100">
                    <img 
                      src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop" 
                      alt="Taste of Italy Restaurant" 
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
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of businesses already using ScanServe to delight their customers.
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

export default UseCases;
