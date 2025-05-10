
import React from 'react';

const PartnersSection = () => {
  const partners = [
    { id: 1, name: "Taj Hotels", logo: "https://placehold.co/200x80/f8fafc/475569?text=Taj+Hotels" },
    { id: 2, name: "Domino's", logo: "https://placehold.co/200x80/f8fafc/475569?text=Dominos" },
    { id: 3, name: "Pizza Hut", logo: "https://placehold.co/200x80/f8fafc/475569?text=Pizza+Hut" },
    { id: 4, name: "Oberoi", logo: "https://placehold.co/200x80/f8fafc/475569?text=Oberoi" },
    { id: 5, name: "Burger King", logo: "https://placehold.co/200x80/f8fafc/475569?text=Burger+King" },
    { id: 6, name: "McDonald's", logo: "https://placehold.co/200x80/f8fafc/475569?text=McDonalds" },
  ];

  return (
    <section className="py-16 bg-white border-t border-gray-100 relative z-10">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl text-navy-800 font-medium">Trusted by leading brands</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
          {partners.map((partner) => (
            <div key={partner.id} className="flex justify-center">
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className="h-12 opacity-80 hover:opacity-100 transition-opacity duration-300 hover:scale-110 filter hover:drop-shadow-md"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
