
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const useCases = [
  {
    title: "Restaurants",
    description: "Streamline table service with instant orders and dynamic menu updates.",
    image: "retsaurant.jpeg",
    link: "/use-cases/restaurants"
  },
  {
    title: "Hotels",
    description: "Enhance room service and in-house dining with contactless ordering.",
    image: "hotel.jpeg",
    link: "/use-cases/hotels"
  },
  {
    title: "Cafés & Bars",
    description: "Increase turnover with faster service and simplified order management.",
    image: "cafe.jpeg",
    link: "/use-cases/cafes"
  }
];

const UseCasesSection = () => {
  return (
    <section className="section bg-white relative z-10" id="use-cases">
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
            <Card 
              key={index} 
              className="group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-0"
            >
              <div className="aspect-video overflow-hidden relative">
                <img 
                  src={useCase.image} 
                  alt={useCase.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              <CardHeader className="pb-2 pt-5">
                <h3 className="text-xl font-bold text-navy-800 group-hover:text-orange-500 transition-colors">
                  {useCase.title}
                </h3>
              </CardHeader>
              
              <CardContent className="pb-4">
                <p className="text-gray-700">
                  {useCase.description}
                </p>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Link 
                  to={useCase.link} 
                  className="inline-flex items-center text-orange-500 font-medium story-link group-hover:text-orange-600 transition-colors"
                >
                  Learn more
                  <ArrowRight size={16} className="ml-1 group-hover:ml-2 transition-all duration-300" />
                </Link>
              </CardFooter>
              
              <div className="absolute top-3 right-3 w-10 h-10 bg-white/80 backdrop-blur-sm text-orange-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300">
                <ArrowRight size={18} />
              </div>
            </Card>
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
