
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ClipboardCheck, Phone, Settings } from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    message: '',
    helpType: 'general'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formState);
    
    // Show success toast
    toast({
      title: "Message Sent!",
      description: "We've received your message and will get back to you shortly.",
    });
    
    // Reset form
    setFormState({
      name: '',
      email: '',
      phone: '',
      businessName: '',
      message: '',
      helpType: 'general'
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-sky-50 py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
                Get in <span className="text-orange-500">Touch</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Questions, feedback, or ready to get started? We're here to help.
              </p>
            </div>
          </div>
        </section>
        
        {/* Contact Options Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="feature-card text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Settings className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2">
                  Technical Support
                </h3>
                <p className="text-gray-600 mb-4">
                  Need help with your account or having technical issues?
                </p>
                <a href="mailto:support@scanserve.com" className="text-orange-500 hover:text-orange-600 font-medium">
                  support@scanserve.com
                </a>
              </div>
              
              <div className="feature-card text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Phone className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2">
                  Sales Inquiries
                </h3>
                <p className="text-gray-600 mb-4">
                  Want to learn more about our plans or discuss custom solutions?
                </p>
                <a href="tel:+18005551234" className="text-orange-500 hover:text-orange-600 font-medium">
                  1-800-555-1234
                </a>
              </div>
              
              <div className="feature-card text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <ClipboardCheck className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2">
                  Schedule a Demo
                </h3>
                <p className="text-gray-600 mb-4">
                  See ScanServe in action with a personalized walkthrough.
                </p>
                <a href="#contactForm" className="text-orange-500 hover:text-orange-600 font-medium">
                  Request below
                </a>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-sky-50 rounded-xl p-8 shadow-sm" id="contactForm">
                <h2 className="text-2xl font-bold text-navy-800 mb-6 text-center">
                  Send Us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Your Name *
                      </label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formState.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address *
                      </label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email"
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={formState.phone}
                        onChange={handleChange}
                        placeholder="(123) 456-7890"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                        Business Name
                      </label>
                      <Input 
                        id="businessName" 
                        name="businessName" 
                        value={formState.businessName}
                        onChange={handleChange}
                        placeholder="Your Restaurant Name"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="helpType" className="block text-sm font-medium text-gray-700">
                      How can we help you? *
                    </label>
                    <select
                      id="helpType"
                      name="helpType"
                      value={formState.helpType}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales Question</option>
                      <option value="support">Technical Support</option>
                      <option value="demo">Request a Demo</option>
                      <option value="partnership">Partnership Opportunity</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message *
                    </label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      value={formState.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      required
                      className="min-h-[120px] w-full"
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                    size="lg"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
        
        {/* Office Location */}
        <section className="section bg-sky-50">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-navy-800 mb-12 text-center">
                Our Office
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h3 className="text-xl font-bold text-navy-800 mb-4">
                      ScanServe Headquarters
                    </h3>
                    <p className="text-gray-600 mb-6">
                      123 Tech Boulevard<br />
                      Suite 456<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                    <div className="space-y-2">
                      <p className="flex items-center">
                        <span className="font-medium text-navy-800 mr-2">Phone:</span>
                        <a href="tel:+18005551234" className="text-orange-500 hover:text-orange-600">
                          1-800-555-1234
                        </a>
                      </p>
                      <p className="flex items-center">
                        <span className="font-medium text-navy-800 mr-2">Email:</span>
                        <a href="mailto:info@scanserve.com" className="text-orange-500 hover:text-orange-600">
                          info@scanserve.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl overflow-hidden shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop" 
                    alt="ScanServe office" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
