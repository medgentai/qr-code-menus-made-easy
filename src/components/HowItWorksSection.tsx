import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Sign Up & Create Menu",
    description: "Create your account and build your digital menu with categories, items, descriptions, and images.",
    image: "step1.jpeg"
  },
  {
    number: "02",
    title: "Generate QR Codes",
    description: "Create custom QR codes for your menus that can be printed and placed throughout your establishment.",
    image: "step2.jpeg"
  },
  {
    number: "03",
    title: "Customers Scan & Order",
    description: "Customers scan the QR code with their phone, browse your menu, and place orders directly.",
    image: "step3.jpeg"
  },
  {
    number: "04",
    title: "Receive & Fulfill Orders",
    description: "Get notified of new orders instantly, manage them from your dashboard, and serve your customers faster.",
    image: "step4.jpeg"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="section bg-sky-50" id="how-it-works">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
            How <span className="text-orange-500">ScanServe</span> Works
          </h2>
          <p className="text-lg text-gray-700">
            Start transforming your customer experience in just a few simple steps.
          </p>
        </div>

        <div className="space-y-20 md:space-y-0">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 mb-20`}
            >
              <div className="w-full md:w-1/2 animate-fade-in">
                <div className="relative">
                  <div className="absolute -inset-4 md:-inset-6 bg-gradient-to-r from-orange-500/20 to-sky-200/20 rounded-xl blur-lg -z-10"></div>
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <img 
                      src={step.image} 
                      alt={step.title} 
                      className="w-full h-auto rounded-xl object-cover aspect-video hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 animate-fade-in">
                <div className="inline-block px-4 py-1 bg-orange-100 text-orange-500 font-medium rounded-full mb-4">
                  Step {step.number}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-navy-800 mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Button 
            className="btn-primary text-base"
            size="lg"
            asChild
          >
            <Link to="/how-it-works">See Detailed Guide</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
