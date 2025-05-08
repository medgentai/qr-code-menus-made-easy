
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, ClipboardCheck, Clock, ImageIcon, List, QrCode, Settings } from 'lucide-react';

const features = [
  {
    icon: <QrCode className="h-10 w-10 text-orange-500" />,
    title: "Instant QR Codes",
    description: "Generate custom QR codes for your menu in seconds. Place them on tables, in rooms, or anywhere customers can scan."
  },
  {
    icon: <ImageIcon className="h-10 w-10 text-orange-500" />,
    title: "Beautiful Menus",
    description: "Create stunning, interactive digital menus that showcase your offerings with vivid images and detailed descriptions."
  },
  {
    icon: <ClipboardCheck className="h-10 w-10 text-orange-500" />,
    title: "Real-time Orders",
    description: "Receive orders directly to your device, eliminating errors and improving kitchen efficiency."
  },
  {
    icon: <Clock className="h-10 w-10 text-orange-500" />,
    title: "Instant Updates",
    description: "Update prices, add items, or mark out-of-stock products in real-time without reprinting menus."
  },
  {
    icon: <List className="h-10 w-10 text-orange-500" />,
    title: "Menu Management",
    description: "Organize items by category, add modifiers, and manage multiple menus for different times of day or locations."
  },
  {
    icon: <Settings className="h-10 w-10 text-orange-500" />,
    title: "Customization",
    description: "Match your brand with custom colors, logos, and styling options for a seamless customer experience."
  }
];

const FeatureSection = () => {
  return (
    <section className="section bg-white" id="features">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
            Features Designed for <span className="text-gradient">Hospitality Success</span>
          </h2>
          <p className="text-lg text-gray-700">
            Everything you need to transform your menu experience and streamline operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card group card-hover"
            >
              <div className="mb-4 bg-orange-100 w-16 h-16 rounded-lg flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                <div className="text-orange-500 group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
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

        <div className="mt-16 text-center">
          <Button 
            className="btn-primary text-base inline-flex items-center gap-2 group"
            size="lg"
            asChild
          >
            <Link to="/features">
              View All Features 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
