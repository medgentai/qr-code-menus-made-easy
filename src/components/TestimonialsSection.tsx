
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const testimonials = [
  {
    quote: "ScanServe has completely transformed how we handle our menu. Our customers love the ease of ordering, and we've seen a 30% increase in average order value.",
    name: "Sarah Johnson",
    role: "Owner, Taste of Italy",
    image: "https://randomuser.me/api/portraits/women/32.jpg"
  },
  {
    quote: "The ability to update our menu in real-time has been game-changing. We can add specials, adjust prices, and remove sold-out items instantly.",
    name: "Michael Chen",
    role: "Manager, Urban Spice",
    image: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    quote: "Our hotel guests love the convenience of scanning the QR code in their rooms to order room service. ScanServe has made the process seamless.",
    name: "Elena Rodriguez",
    role: "F&B Director, Grand Plaza Hotel",
    image: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    quote: "As a food truck owner, ScanServe has made it so much easier for customers to browse our menu while waiting in line. The implementation was incredibly simple.",
    name: "David Wilson",
    role: "Owner, Street Eats Food Truck",
    image: "https://randomuser.me/api/portraits/men/22.jpg"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="section bg-white" id="testimonials">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
            Loved by <span className="text-gradient">Business Owners</span>
          </h2>
          <p className="text-lg text-gray-700">
            See what our customers are saying about their experience with ScanServe.
          </p>
        </div>

        <Carousel 
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-4">
                <div className="testimonial-card h-full flex flex-col hover-lift">
                  <div className="mb-4">
                    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.028 6C6.684 11.184 1.5 19.68 1.5 29.304C1.5 36.648 6.684 42 13.524 42C19.548 42 24.228 37.152 24.228 31.296C24.228 25.272 19.38 20.592 13.692 20.592C12.18 20.592 10.668 20.928 9.324 21.6C10.5 16.752 14.7 12.36 20.052 9.552L14.028 6ZM38.22 6C30.876 11.184 25.692 19.68 25.692 29.304C25.692 36.648 30.876 42 37.716 42C43.74 42 48.42 37.152 48.42 31.296C48.42 25.272 43.572 20.592 37.884 20.592C36.372 20.592 34.86 20.928 33.516 21.6C34.692 16.752 38.892 12.36 44.244 9.552L38.22 6Z" fill="#F97316" fillOpacity="0.2"/>
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-6 flex-grow">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center mt-auto">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-100 mr-4 hover:scale-110 transition-transform duration-200">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8">
            <CarouselPrevious className="relative static mr-2 hover:bg-orange-100 hover:text-orange-500 transition-colors duration-200" />
            <CarouselNext className="relative static ml-2 hover:bg-orange-100 hover:text-orange-500 transition-colors duration-200" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsSection;
