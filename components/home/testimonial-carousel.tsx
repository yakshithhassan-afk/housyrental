"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    text: "HousyRental made finding my dream apartment so easy! The process was seamless and the support team was incredibly helpful.",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    role: "Business Owner",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    text: "As a property owner, I love the professional marketing and tenant screening. My properties are always well-maintained.",
    rating: 5,
  },
  {
    name: "Anjali Patel",
    role: "Marketing Manager",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    text: "The 24/7 maintenance support is a game-changer. Any issues are resolved within hours. Highly recommend!",
    rating: 5,
  },
];

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[current];

  return (
    <section
      className="relative py-20 z-10"
      style={{ background: "linear-gradient(135deg, #fef2f2 0%, #fdf2f8 50%, #fce7f3 100%)" }}
    >
      <div className="container mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-16 shadow-xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            What Our <span className="text-indigo-600">Customers Say</span>
          </h2>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Real experiences from real tenants and property owners
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-50 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-50 translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-xl text-gray-700 italic mb-8 leading-relaxed">"{t.text}"</p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={64}
                  height={64}
                  className="rounded-full object-cover border-4 border-indigo-200 shadow-lg"
                />
                <div className="text-left">
                  <div className="font-bold text-gray-900 text-lg">{t.name}</div>
                  <div className="text-gray-600">{t.role}</div>
                </div>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      i === current ? "bg-indigo-600 w-8" : "bg-gray-300 hover:bg-gray-400 w-3"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
