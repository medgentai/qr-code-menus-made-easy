
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, CheckCircle } from 'lucide-react';

const GetStarted = () => {
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    businessName: '',
    phone: '',
    businessType: 'restaurant'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Show success toast
    toast.success("Request Received!", {
      description: "Thank you for booking a demo with ScanServe! We'll contact you shortly.",
    });

    // Reset form (in a real app, you'd redirect to the dashboard or login)
    setFormState({
      firstName: '',
      lastName: '',
      email: '',
      businessName: '',
      phone: '',
      businessType: 'restaurant'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24">
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-sky-50">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
                  Book Your <span className="text-orange-500">Free Demo</span>
                </h1>
                <p className="text-xl text-gray-700 mb-8">
                  Sign up now to experience the power of ScanServe. Our team will guide you through a personalized demo.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name*
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formState.firstName}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name*
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formState.lastName}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address*
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      Business Name*
                    </label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formState.businessName}
                      onChange={handleChange}
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
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                      Business Type*
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formState.businessType}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="restaurant">Restaurant</option>
                      <option value="hotel">Hotel</option>
                      <option value="cafe">Café or Bar</option>
                      <option value="foodTruck">Food Truck</option>
                      <option value="event">Event Space</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white w-full flex items-center justify-center gap-2 group"
                    size="lg"
                  >
                    Book Your Free Demo
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    By signing up, you agree to our <a href="#" className="text-orange-500 hover:underline">Terms of Service</a> and <a href="#" className="text-orange-500 hover:underline">Privacy Policy</a>.
                  </p>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-navy-800 mb-6">
                  Your Free Demo Includes:
                </h3>

                <ul className="space-y-4">
                  {[
                    "Personalized walkthrough of ScanServe features",
                    "Live QR code generation demonstration",
                    "Complete menu customization showcase",
                    "Real-time order management preview",
                    "Detailed analytics & reporting examples",
                    "Q&A session with our product specialists",
                    "Custom implementation strategy for your business"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 p-6 bg-sky-50 rounded-lg border border-sky-100">
                  <h4 className="text-lg font-bold text-navy-800 mb-3">
                    What Our Customers Say
                  </h4>
                  <p className="text-gray-600 italic mb-4">
                    "The ScanServe platform paid for itself within the first month. Our customers love the experience, and we've seen a significant increase in order value."
                  </p>
                  <div className="flex items-center">
                    <img
                      src="https://randomuser.me/api/portraits/men/22.jpg"
                      alt="David Wilson"
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h5 className="font-semibold text-navy-800">David Wilson</h5>
                      <p className="text-sm text-gray-500">Owner, Street Eats</p>
                    </div>
                  </div>
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

export default GetStarted;
