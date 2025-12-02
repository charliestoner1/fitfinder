"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { FeedbackSection } from "@/components/feedback-section";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  UserPlus,
} from "lucide-react";

const FEATURES = [
  {
    title: "Smart Wardrobe Upload",
    description:
      "AI-powered clothing organization with automatic tagging and categorization",
  },
  {
    title: "Outfit Builder",
    description:
      "Drag-and-drop interface to create and visualize complete outfits",
  },
  {
    title: "Smart Recommendations",
    description:
      "Personalized outfit suggestions based on weather and occasion",
  },
  {
    title: "Save & Organize",
    description: "Store and manage your favorite outfit combinations",
  },
  {
    title: "Color Harmony",
    description:
      "AI-powered color matching to ensure your outfits complement each other",
  },
  {
    title: "Style Insights",
    description: "Get data-driven insights about your wardrobe and preferences",
  },
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If authenticated, show home page with navbar
  if (isAuthenticated) {
    return <AuthenticatedHome />;
  }

  // If not authenticated, show landing page with login/signup CTAs
  return <UnauthenticatedLanding />;
}

function UnauthenticatedLanding() {
  return (
    <div className="min-h-screen">
      {/* Fashionable Header */}
      <header className="sticky top-0 backdrop-blur-md bg-white/80 border-b border-pink-200/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8A8D4' }}>
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#E8A8D4', fontFamily: 'var(--font-vt323)' }}>FitFinder</h1>
          </Link>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" className="flex items-center gap-2 uppercase text-xs font-bold border-pink-200">
                <LogIn className="w-4 h-4" />
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="flex items-center gap-2 uppercase text-xs font-bold" style={{ backgroundColor: '#E8A8D4', color: 'white' }}>
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Fashion Forward */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-widest animate-bounce-pop" style={{ color: '#E8A8D4', fontFamily: 'var(--font-vt323)' }}>
            FitFinder
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in">
            Your AI-powered personal styling assistant. Organize, create, and discover outfits with intelligence.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="uppercase text-sm font-bold tracking-widest px-8 animate-float hover:animate-none"
              style={{ backgroundColor: '#E8A8D4', color: 'white' }}
            >
              Get Started Now
            </Button>
          </Link>
        </div>


      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 FitFinder. Your smart wardrobe assistant.</p>
        </div>
      </footer>
    </div>
  );
}

function AuthenticatedHome() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-6 animate-bounce-pop">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center hover:animate-glow" style={{ backgroundColor: '#FFAEDA' }}>
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold animate-shimmer" style={{ color: '#FFAEDA', fontFamily: 'var(--font-vt323)' }}>
              FitFinder
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-slate-600 mb-6 max-w-2xl mx-auto animate-fade-in">
            Your AI-powered personal styling assistant for smart wardrobe management
            and outfit recommendations
          </p>
        </div>

        {/* About Us Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          <div className="group p-8 backdrop-blur-sm bg-white/40 border border-pink-200/30 transition-all duration-400 hover:bg-white/60 hover:border-pink-300/50 hover:shadow-xl animate-slide-left hover:animate-glow">
            <h3 className="text-lg font-bold mb-4 animate-bounce-pop" style={{ color: '#DB4E8F' }}>Front-end Lead</h3>
            <p className="text-slate-700 font-semibold hover:text-pink-600 transition-colors">Charlie Stoner</p>
            <p className="text-slate-700 font-semibold hover:text-pink-600 transition-colors">Thai-Son Nguyen</p>
          </div>
          <div className="group p-8 backdrop-blur-sm bg-white/40 border border-blue-200/30 transition-all duration-400 hover:bg-white/60 hover:border-blue-300/50 hover:shadow-xl animate-slide-right hover:animate-glow">
            <h3 className="text-lg font-bold mb-4 animate-bounce-pop" style={{ color: '#86B4FA' }}>Back-end Lead</h3>
            <p className="text-slate-700 font-semibold hover:text-blue-600 transition-colors">Thai-Son Nguyen</p>
          </div>
          <div className="group p-8 backdrop-blur-sm bg-white/40 border border-green-200/30 transition-all duration-400 hover:bg-white/60 hover:border-green-300/50 hover:shadow-xl animate-slide-left hover:animate-glow" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-bold mb-4 animate-bounce-pop" style={{ color: '#99F1B9' }}>Dev-ops & QA</h3>
            <p className="text-slate-700 font-semibold hover:text-green-600 transition-colors">Nam Tran</p>
          </div>
          <div className="group p-8 backdrop-blur-sm bg-white/40 border border-purple-200/30 transition-all duration-400 hover:bg-white/60 hover:border-purple-300/50 hover:shadow-xl animate-slide-right hover:animate-glow" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-bold mb-4 animate-bounce-pop" style={{ color: '#C8B4FF' }}>ML Engineer</h3>
            <p className="text-slate-700 font-semibold hover:text-purple-600 transition-colors">Emear Kilic</p>
          </div>
        </div>

        {/* Features Grid - Fashionable */}
        <section className="mb-24">
          <h2 className="text-4xl font-bold text-center mb-4 tracking-wider uppercase animate-slide-down">Features</h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto animate-fade-in">Curated for the modern fashion enthusiast</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => {
              return (
                <div key={feature.title} className="group p-6 backdrop-blur-sm bg-white/50 border border-pink-200/20 transition-all duration-400 hover:bg-white/70 hover:border-pink-300/40 hover:shadow-lg hover:-translate-y-1 animate-slide-up hover:animate-glow" style={{ animationDelay: `${index * 0.1}s` }}>
                  <h3 className="text-lg font-bold mb-2 uppercase text-sm tracking-wide animate-bounce-pop" style={{ color: '#FFAEDA' }}>{feature.title}</h3>
                  <p className="text-slate-600 text-sm hover:text-slate-900 transition-colors">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feedback Section */}
        <section className="mb-20">
          <FeedbackSection />
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-8 pb-8 text-center text-slate-600">
          <p>&copy; 2025 FitFinder. All rights reserved.</p>
          <p className="text-sm mt-2">
            Helping you style smarter, every day.
          </p>
        </footer>
      </section>
    </div>
  );
}