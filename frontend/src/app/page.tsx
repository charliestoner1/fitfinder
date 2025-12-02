"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { FeedbackSection } from "@/components/feedback-section";
import { Card, CardContent } from "@/components/ui/card";
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
          <div className="mb-8 inline-block">
            <div className="text-sm font-bold uppercase tracking-[0.2em] animate-shimmer" style={{ color: '#86B4FA' }}>
              Elevate Your Style
            </div>
          </div>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="animate-slide-up hover:animate-glow" style={{ animationDelay: '0.1s' }}>
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2 animate-bounce-pop">1000+</p>
              <p className="text-slate-600">Items Organized</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up hover:animate-glow" style={{ animationDelay: '0.2s' }}>
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-purple-600 mb-2 animate-bounce-pop">500+</p>
              <p className="text-slate-600">Outfit Combinations</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up hover:animate-glow" style={{ animationDelay: '0.3s' }}>
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-green-600 mb-2 animate-bounce-pop">95%</p>
              <p className="text-slate-600">User Satisfaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center animate-slide-down">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => {
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow animate-slide-up hover:animate-glow" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2 animate-bounce-pop" style={{ color: '#FFAEDA' }}>
                      {feature.title}
                    </h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20 bg-white rounded-lg shadow-lg p-8 md:p-12 animate-slide-up overflow-hidden">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center animate-slide-down">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Upload Wardrobe",
                description: "Add photos of your clothing items",
              },
              {
                step: 2,
                title: "AI Tags Items",
                description: "Our AI automatically categorizes and tags your clothes",
              },
              {
                step: 3,
                title: "Build Outfits",
                description: "Mix and match items to create perfect looks",
              },
              {
                step: 4,
                title: "Get Recommendations",
                description: "Receive personalized suggestions based on context",
              },
            ].map((item, index) => (
              <div key={item.step} className="text-center animate-slide-up hover:animate-float" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold animate-bounce-pop hover:animate-spin-slow">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 hover:text-pink-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
       
        {/* CTA Section - Luxe Fashion */}
        <section className="rounded-none shadow-2xl p-12 md:p-16 text-center mb-24 animate-slide-up hover:animate-glow" style={{ background: 'linear-gradient(135deg, #FFAEDA 0%, #C8B4FF 100%)' }}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-wider animate-bounce-pop">
            Start Your Style Journey
          </h2>
          <p className="mb-10 text-lg max-w-2xl mx-auto animate-fade-in" style={{ color: 'rgba(255, 255, 255, 0.98)' }}>
            Join fashionistas who transform their wardrobes with intelligence and style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto uppercase font-bold tracking-wider border-white text-white hover:bg-white/10 animate-float">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto uppercase font-bold tracking-wider bg-white" style={{ color: '#FFAEDA' }}>
                Create Account
              </Button>
            </Link>
          </div>
        </section>
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