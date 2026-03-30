"use client";

import { useState } from "react";
import { Building2, Users, Award, MapPin, Mail, Phone, Star, CheckCircle, Target, Heart } from "lucide-react";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
      description: "15+ years in real estate management"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      description: "Tech expert specializing in property solutions"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      description: "Expert in property management and customer service"
    },
    {
      name: "David Kim",
      role: "Lead Developer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      description: "Building innovative rental solutions"
    }
  ];

  const stats = [
    { icon: Building2, label: "Properties Managed", value: "5,000+" },
    { icon: Users, label: "Happy Tenants", value: "12,000+" },
    { icon: Award, label: "Years in Business", value: "15+" },
    { icon: Star, label: "Customer Satisfaction", value: "98%" }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #ccfbf1 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">HR</span>
            </div>
            <div>
              <span className="font-bold text-xl text-gray-800">HousyRental</span>
              <p className="text-xs text-gray-500">Find Your Perfect Home</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">Home</a>
            <a href="/properties" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">Properties</a>
            <a href="/services" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">Services</a>
            <a href="/about" className="text-cyan-600 font-semibold">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors">
              Sign In
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            About <span className="text-cyan-600">HousyRental</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            We're revolutionizing the rental experience with innovative technology, exceptional service, and a commitment to making rental living better for everyone.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission/Vision/Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Our <span className="text-cyan-600">Purpose</span>
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
            <button
              onClick={() => setActiveTab('mission')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'mission'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mission
            </button>
            <button
              onClick={() => setActiveTab('vision')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'vision'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Vision
            </button>
            <button
              onClick={() => setActiveTab('values')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'values'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Values
            </button>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            {activeTab === 'mission' && (
              <div className="text-center">
                <Target className="w-16 h-16 text-cyan-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Our Mission</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To simplify and enhance the rental experience for both property owners and tenants through innovative technology, exceptional service, and a commitment to transparency and trust. We strive to make rental living seamless, efficient, and enjoyable for everyone involved.
                </p>
              </div>
            )}
            
            {activeTab === 'vision' && (
              <div className="text-center">
                <Star className="w-16 h-16 text-cyan-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Our Vision</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To become the world's most trusted and innovative rental platform, transforming how people find, manage, and experience rental properties. We envision a future where rental living is effortless, transparent, and accessible to everyone.
                </p>
              </div>
            )}
            
            {activeTab === 'values' && (
              <div className="text-center">
                <Heart className="w-16 h-16 text-cyan-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Our Values</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Integrity</h4>
                    <p className="text-gray-600">We operate with honesty and transparency in everything we do.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Innovation</h4>
                    <p className="text-gray-600">We constantly push boundaries to create better solutions.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Focus</h4>
                    <p className="text-gray-600">Our customers' success is our success.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Excellence</h4>
                    <p className="text-gray-600">We strive for excellence in every interaction and service.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Meet Our <span className="text-cyan-600">Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our dedicated team of professionals is committed to providing exceptional service and innovative solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{member.name}</h3>
                <p className="text-cyan-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Get in <span className="text-cyan-600">Touch</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Reach out to us anytime.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <Mail className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Email Us</h3>
              <p className="text-gray-600 mb-4">Get in touch with our team</p>
              <a href="mailto:housyrental0@gmail.com" className="text-cyan-600 font-medium hover:text-cyan-700">
                housyrental0@gmail.com
              </a>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <Phone className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Call Us</h3>
              <p className="text-gray-600 mb-4">Mon-Fri 9AM-6PM EST</p>
              <a href="tel:+1234567890" className="text-cyan-600 font-medium hover:text-cyan-700">
                +1 (234) 567-890
              </a>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <MapPin className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Visit Us</h3>
              <p className="text-gray-600 mb-4">Stop by our office</p>
              <p className="text-cyan-600 font-medium">
                123 Business Ave<br />
                New York, NY 10001
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the HousyRental Family
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto">
            Whether you're a property owner or looking for your next home, we're here to help you succeed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/auth/register"
              className="px-8 py-4 bg-white text-cyan-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              Get Started Today
            </a>
            <a
              href="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:text-cyan-600 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
