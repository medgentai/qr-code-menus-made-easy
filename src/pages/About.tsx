
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Building, Users, Trophy, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-sky-50 py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
                About <span className="text-orange-500">ScanServe</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Transforming the dining experience with innovative digital solutions
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-navy-800 mb-6">Our Story</h2>
                <p className="text-gray-700 mb-4">
                  ScanServe was founded in 2023 with a simple mission: to help restaurants and hospitality businesses 
                  thrive in the digital age by making menu management and ordering simpler, more efficient, and 
                  more cost-effective.
                </p>
                <p className="text-gray-700 mb-4">
                  What started as a solution for a single local restaurant quickly grew as we saw how much of a 
                  difference our platform made to both businesses and their customers. Today, we're proud to 
                  serve thousands of venues across the country, helping them cut costs, improve efficiency, 
                  and deliver exceptional dining experiences.
                </p>
                <p className="text-gray-700">
                  Our team combines expertise in hospitality, technology, and customer experience to create 
                  solutions that are intuitive, powerful, and tailored to the unique needs of food service businesses.
                </p>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop" 
                  alt="Team meeting" 
                  className="rounded-lg shadow-lg w-full object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-orange-500 w-32 h-32 rounded-lg opacity-20"></div>
                <div className="absolute -top-6 -right-6 bg-sky-500 w-32 h-32 rounded-lg opacity-20"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values Section */}
        <section className="section bg-sky-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-800 mb-4">Our Values</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                These core principles guide everything we do at ScanServe
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="bg-orange-100 text-orange-500 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Users size={28} />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2">Customer First</h3>
                <p className="text-gray-700">
                  We design our solutions with both restaurant owners and their customers in mind, 
                  ensuring a seamless experience for everyone.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="bg-orange-100 text-orange-500 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Building size={28} />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2">Innovation</h3>
                <p className="text-gray-700">
                  We constantly evolve our platform, seeking new ways to help businesses operate 
                  more efficiently and profitably.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="bg-orange-100 text-orange-500 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Trophy size={28} />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2">Excellence</h3>
                <p className="text-gray-700">
                  We're committed to providing the highest quality tools, support, and service to 
                  help our clients succeed.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="bg-orange-100 text-orange-500 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Heart size={28} />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2">Passion</h3>
                <p className="text-gray-700">
                  We genuinely love what we do and are passionate about helping the hospitality 
                  industry thrive in the digital age.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-800 mb-4">Our Team</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Meet the people behind ScanServe dedicated to transforming the dining experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Michael Chen",
                  title: "CEO & Co-Founder",
                  image: "https://randomuser.me/api/portraits/men/32.jpg",
                  bio: "Former restaurant owner with a passion for technology and innovation."
                },
                {
                  name: "Sarah Johnson",
                  title: "CTO & Co-Founder",
                  image: "https://randomuser.me/api/portraits/women/44.jpg",
                  bio: "Tech industry veteran with over 15 years of experience in product development."
                },
                {
                  name: "David Rodriguez",
                  title: "Head of Customer Success",
                  image: "https://randomuser.me/api/portraits/men/67.jpg",
                  bio: "Hospitality professional focused on ensuring clients get the most out of ScanServe."
                },
                {
                  name: "Emily Parker",
                  title: "Lead Designer",
                  image: "https://randomuser.me/api/portraits/women/28.jpg",
                  bio: "UX/UI specialist with a background in creating intuitive digital experiences."
                },
                {
                  name: "James Wilson",
                  title: "Marketing Director",
                  image: "https://randomuser.me/api/portraits/men/55.jpg",
                  bio: "Digital marketing expert who loves connecting businesses with effective solutions."
                },
                {
                  name: "Aisha Patel",
                  title: "Product Manager",
                  image: "https://randomuser.me/api/portraits/women/63.jpg",
                  bio: "Former restaurant consultant who understands the industry's unique challenges."
                }
              ].map((member, index) => (
                <div key={index} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-800 mb-1">{member.name}</h3>
                    <p className="text-orange-500 font-medium mb-3">{member.title}</p>
                    <p className="text-gray-700">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
