
import React from 'react';

const PartnersSection = () => {
  const partners = [
    { id: 1, name: "Foodify", logo: "https://placehold.co/200x80/f8fafc/475569?text=Foodify" },
    { id: 2, name: "DineConnect", logo: "https://placehold.co/200x80/f8fafc/475569?text=DineConnect" },
    { id: 3, name: "TablePro", logo: "https://placehold.co/200x80/f8fafc/475569?text=TablePro" },
    { id: 4, name: "GastroHub", logo: "https://placehold.co/200x80/f8fafc/475569?text=GastroHub" },
    { id: 5, name: "MenuMaster", logo: "https://placehold.co/200x80/f8fafc/475569?text=MenuMaster" },
    { id: 6, name: "OrderEase", logo: "https://placehold.co/200x80/f8fafc/475569?text=OrderEase" },
  ];

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl text-gray-500 font-medium">Trusted by leading brands</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
          {partners.map((partner) => (
            <div key={partner.id} className="flex justify-center">
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className="h-12 opacity-60 hover:opacity-100 transition-opacity duration-300 hover:scale-110 filter hover:drop-shadow-md"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
