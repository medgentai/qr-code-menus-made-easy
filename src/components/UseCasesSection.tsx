
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const useCases = [
  {
    title: "Restaurants",
    description: "Streamline table service with instant orders and dynamic menu updates.",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=500&auto=format&fit=crop",
    link: "/use-cases/restaurants"
  },
  {
    title: "Hotels",
    description: "Enhance room service and in-house dining with contactless ordering.",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&auto=format&fit=crop",
    link: "/use-cases/hotels"
  },
  {
    title: "Cafés & Bars",
    description: "Increase turnover with faster service and simplified order management.",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&auto=format&fit=crop",
    link: "/use-cases/cafes"
  }
];

const UseCasesSection = () => {
  return (
    <section className="section bg-white" id="use-cases">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
            Perfect for <span className="text-gradient">Every Business</span>
          </h2>
          <p className="text-lg text-gray-700">
            ScanServe adapts to your unique business needs, whether you're a cozy café or a large hotel chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div 
              key={index} 
              className="group relative overflow-hidden rounded-xl shadow-md hover-lift bg-white"
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={useCase.image} 
                  alt={useCase.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6 relative">
                <div className="absolute -top-10 right-6 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300">
                  <ArrowRight size={20} />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2 group-hover:text-orange-500 transition-colors">
                  {useCase.title}
                </h3>
                <p className="text-gray-700 mb-4">
                  {useCase.description}
                </p>
                <Link 
                  to={useCase.link} 
                  className="inline-flex items-center text-orange-500 font-medium story-link group-hover:text-orange-600 transition-colors"
                >
                  Learn more
                  <ArrowRight size={16} className="ml-1 group-hover:ml-2 transition-all duration-300" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Button 
            className="btn-primary text-base"
            size="lg"
            asChild
          >
            <Link to="/use-cases">View All Use Cases</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
