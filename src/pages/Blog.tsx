
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, User, Tag } from 'lucide-react';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "5 Ways QR Code Menus Are Transforming the Restaurant Industry",
      excerpt: "Discover how digital menus are helping restaurants cut costs, improve efficiency, and enhance the dining experience.",
      image: "https://images.unsplash.com/photo-1511018556340-d16986a1c194?w=600&auto=format&fit=crop",
      author: "Michael Chen",
      date: "May 2, 2025",
      readTime: "6 min read",
      category: "Industry Trends"
    },
    {
      id: 2,
      title: "How Hotels Are Using Digital Menus to Enhance Guest Experience",
      excerpt: "Explore the innovative ways hotels are implementing QR code menus for room service, restaurants, and bars.",
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop",
      author: "Sarah Johnson",
      date: "April 28, 2025",
      readTime: "8 min read",
      category: "Hospitality"
    },
    {
      id: 3,
      title: "The Environmental Impact of Switching to Digital Menus",
      excerpt: "Learn how restaurants and hotels are reducing their environmental footprint by eliminating paper menus.",
      image: "https://images.unsplash.com/photo-1536847071676-592af0eb9e46?w=600&auto=format&fit=crop",
      author: "Emily Parker",
      date: "April 20, 2025",
      readTime: "5 min read",
      category: "Sustainability"
    },
    {
      id: 4,
      title: "Menu Psychology: How Digital Menus Can Increase Order Value",
      excerpt: "Explore the psychology behind menu design and how digital formats can help drive customer spending.",
      image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop",
      author: "David Rodriguez",
      date: "April 15, 2025",
      readTime: "7 min read",
      category: "Marketing"
    },
    {
      id: 5,
      title: "Case Study: How Urban Brew Café Increased Revenue by 22%",
      excerpt: "A detailed look at how one café implemented QR code menus and transformed their business.",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop",
      author: "Aisha Patel",
      date: "April 10, 2025",
      readTime: "10 min read",
      category: "Case Study"
    },
    {
      id: 6,
      title: "The Future of Dining: AI-Powered Menu Recommendations",
      excerpt: "Discover how ScanServe is integrating AI to provide personalized menu recommendations based on customer preferences.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop",
      author: "James Wilson",
      date: "April 5, 2025",
      readTime: "9 min read",
      category: "Technology"
    }
  ];

  const categories = [
    "All Categories",
    "Industry Trends",
    "Technology",
    "Case Study",
    "Hospitality",
    "Marketing",
    "Sustainability"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-sky-50 py-16">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
                <span className="text-orange-500">ScanServe</span> Blog
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Insights, tips, and success stories about digital menus and the hospitality industry
              </p>
            </div>
          </div>
        </section>
        
        {/* Category Nav */}
        <section className="py-6 bg-white border-b border-gray-100 sticky top-16 z-10">
          <div className="container-custom overflow-x-auto">
            <div className="flex space-x-4 min-w-max">
              {categories.map((category, index) => (
                <button 
                  key={index} 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    index === 0 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Post */}
        <section className="section bg-white pt-12">
          <div className="container-custom">
            <div className="bg-gradient-to-r from-sky-50 to-orange-50 rounded-xl overflow-hidden shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="inline-block px-3 py-1 bg-orange-100 text-orange-500 text-sm font-medium rounded-full mb-4">
                    Featured Article
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-4 hover:text-orange-500 transition-colors">
                    <a href="#">How QR Code Menus Are Revolutionizing Post-Pandemic Dining</a>
                  </h2>
                  <p className="text-gray-700 mb-6">
                    As the hospitality industry continues to evolve, digital menus have emerged as a permanent solution that offers benefits far beyond their original contactless purpose. Learn how leading restaurants are leveraging this technology to improve operations and enhance customer experience.
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <User size={16} className="mr-2" />
                      <span>Sarah Johnson</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2" />
                      <span>12 min read</span>
                    </div>
                    <div className="flex items-center">
                      <Tag size={16} className="mr-2" />
                      <span>Industry Trends</span>
                    </div>
                  </div>
                  <Button className="btn-primary w-fit" asChild>
                    <a href="#">Read Article <ArrowRight size={16} className="ml-1" /></a>
                  </Button>
                </div>
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop" 
                    alt="Featured blog post" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Blog Posts Grid */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <div key={post.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="bg-orange-100 text-orange-500 px-3 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-navy-800 mb-3 group-hover:text-orange-500 transition-colors">
                      <a href="#">{post.title}</a>
                    </h3>
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <User size={16} className="mr-2 text-gray-500" />
                        <span className="text-sm">{post.author}</span>
                      </div>
                      <span className="text-sm text-gray-500">{post.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg">
                Load More Articles
              </Button>
            </div>
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="section bg-navy-800 text-white">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-gray-300 mb-8">
                Stay updated with the latest industry trends, tips, and ScanServe product updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-grow px-4 py-3 rounded-l-md text-gray-800 w-full"
                />
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-r-md sm:w-auto w-full">
                  Subscribe
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
