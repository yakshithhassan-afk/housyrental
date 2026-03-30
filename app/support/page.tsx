"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageSquare, ArrowLeft, Send, Mail, User, Phone, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SupportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim() || !formData.email.trim() || !formData.name.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      if (!db) {
        toast.error("Database connection is not available.");
        return;
      }
      setIsSending(true);
      await addDoc(collection(db, 'messages'), {
        text: formData.message.trim(),
        subject: formData.subject,
        senderId: user?.uid || 'guest',
        senderName: formData.name,
        senderEmail: formData.email,
        senderRole: user ? 'USER' : 'GUEST',
        recipientId: 'admin',
        recipientName: 'HousyRental Support',
        createdAt: serverTimestamp(),
        read: false,
        type: 'SUPPORT'
      });
      
      toast.success("Message sent! Our team will contact you soon.");
      setFormData(prev => ({ ...prev, message: "" }));
    } catch (error) {
      console.error("Error sending support message:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-teal-700">
              HousyRental Support
            </span>
          </Link>
          <Button variant="ghost" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-900 via-cyan-800 to-teal-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in">
            How Can We <span className="text-cyan-300">Help</span> You?
          </h1>
          <p className="text-xl text-cyan-50 max-w-2xl mx-auto opacity-90 leading-relaxed italic">
            "Your comfort is our priority. Whether you have an inquiry about a property or need technical assistance, our team is here for you 24/7."
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="flex-1 py-16 -mt-10 relative z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="border-none shadow-xl bg-white rounded-3xl p-8 hover:shadow-2xl transition-all h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Quick Support</h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600 shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Email Us</p>
                      <p className="text-lg font-semibold text-gray-800">housyrental0@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-all">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Call Assistance</p>
                      <p className="text-lg font-semibold text-gray-800">+1 (800) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 shrink-0 group-hover:bg-yellow-600 group-hover:text-white transition-all">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Response Time</p>
                      <p className="text-lg font-semibold text-gray-800">Under 24 Hours</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Support Form */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-8 text-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Send a Message</h2>
                      <p className="text-cyan-100 opacity-90">Fill out the form below and we'll get back to you.</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-8 md:p-12">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="John Doe"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-cyan-500 transition-all outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            disabled={!!user}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            placeholder="john@example.com"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-cyan-500 transition-all outline-none"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            disabled={!!user}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                      <select
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-cyan-500 transition-all outline-none appearance-none"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      >
                        <option>General Inquiry</option>
                        <option>Property Listing Issue</option>
                        <option>Payment/Finance</option>
                        <option>Technical Support</option>
                        <option>Partner with Us</option>
                        <option>Appreciation/Feedback</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                      <textarea
                        placeholder="How can we assist you today?"
                        className="w-full h-40 px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-cyan-500 transition-all outline-none resize-none"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      ></textarea>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSending}
                      className="w-full py-8 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-extrabold text-xl rounded-2xl shadow-xl hover:shadow-cyan-200/50 hover:scale-[1.01] active:scale-95 transition-all transform flex items-center justify-center gap-3"
                    >
                      {isSending ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-6 h-6" />
                          Send Support Message
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-gray-400 font-medium">
                      By sending a message, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Meta */}
      <footer className="py-10 text-center text-gray-400 text-sm">
        <p>© 2026 HousyRental Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
