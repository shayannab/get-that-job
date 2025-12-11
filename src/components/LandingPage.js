import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Target,
  BarChart3,
  Zap,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  Rocket
} from 'lucide-react';
import RevealAnimation from './ui/RevealAnimation';
import AnimatedCarousel from './ui/AnimatedCarousel';
import PremiumFooter from './ui/PremiumFooter';
import StarBorder from './ui/StarBorder';
import Antigravity from './ui/Antigravity';

function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Features data
  const features = [
    {
      icon: FileText,
      title: 'Smart Job Analysis',
      description: 'AI-powered extraction of skills, keywords, and requirements from any job posting.',
    },
    {
      icon: Target,
      title: 'ATS Optimization',
      description: 'Generate resumes that pass Applicant Tracking Systems with high scores.',
    },
    {
      icon: BarChart3,
      title: 'Instant Scoring',
      description: 'Get real-time feedback with detailed ATS scores and improvement suggestions.',
    },
    {
      icon: Sparkles,
      title: 'AI Cover Letters',
      description: 'Generate personalized cover letters tailored to each job application.',
    },
    {
      icon: Users,
      title: 'Skills Gap Analysis',
      description: 'Identify missing skills and get recommendations to strengthen your profile.',
    },
    {
      icon: Award,
      title: 'Achievement Bank',
      description: 'Store and reuse your best accomplishments across multiple resumes.',
    },
  ];

  // How it works steps
  const steps = [
    {
      number: '01',
      title: 'Paste the Job',
      description: 'Copy and paste any job description. Our AI instantly analyzes requirements and keywords.',
    },
    {
      number: '02',
      title: 'Answer Questions',
      description: 'Fill out personalized questions about your experience tailored to the specific role.',
    },
    {
      number: '03',
      title: 'Generate Resume',
      description: 'Get an ATS-optimized resume with instant scoring and improvement suggestions.',
    },
    {
      number: '04',
      title: 'Download & Apply',
      description: 'Export in PDF, Word, or plain text. All formats are ATS-friendly and ready to submit.',
    },
  ];

  // Testimonials for carousel
  const testimonials = [
    {
      quote: "Get That Job helped me land interviews at 3 FAANG companies. The ATS optimization is incredible.",
      author: "Sarah Chen",
      role: "Software Engineer at Google",
    },
    {
      quote: "I went from 0 callbacks to 5 interviews in one week. This tool is a game-changer.",
      author: "Michael Rodriguez",
      role: "Product Manager at Stripe",
    },
    {
      quote: "The AI suggestions improved my resume score from 45% to 92%. Highly recommended!",
      author: "Emily Johnson",
      role: "Marketing Director",
    },
    {
      quote: "As a career switcher, I struggled to highlight transferable skills. This tool made it effortless.",
      author: "David Park",
      role: "UX Designer at Meta",
    },
    {
      quote: "The cover letter generator saved me hours. Every letter feels personalized and professional.",
      author: "Jessica Williams",
      role: "Sales Executive",
    },
    {
      quote: "Finally got past the ATS filters. Landed my dream job at a startup within 2 weeks!",
      author: "Alex Thompson",
      role: "Full Stack Developer",
    },
  ];

  // Stats
  const stats = [
    { number: '50K+', label: 'Resumes Created' },
    { number: '89%', label: 'Interview Rate' },
    { number: '4.9', label: 'User Rating' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Capsule Navbar */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <nav
          className={`
            flex items-center gap-8 px-6 py-3 rounded-full transition-all duration-300
            ${scrolled
              ? 'bg-white/90 backdrop-blur-xl shadow-lg border border-border'
              : 'bg-white/80 backdrop-blur-md border border-border/50'
            }
          `}
        >
          {/* Logo */}
          <h1
            className="text-lg font-bold text-textPrimary tracking-tight cursor-pointer"
            onClick={() => navigate('/')}
          >
            Get That Job
          </h1>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-textSecondary hover:text-textPrimary transition-colors link-underline">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-textSecondary hover:text-textPrimary transition-colors link-underline">
              How It Works
            </a>
            <a href="#testimonials" className="text-sm text-textSecondary hover:text-textPrimary transition-colors link-underline">
              Testimonials
            </a>
          </div>

          {/* CTA Button */}
          <button
            className="px-5 py-2 bg-backgroundDark text-white text-sm font-medium rounded-full hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/dashboard')}
          >
            Get Started
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section pt-32 pb-24 md:pt-48 md:pb-32 relative overflow-hidden">
        {/* Antigravity Particle Effect */}
        <div className="absolute inset-0" style={{ height: '100%' }}>
          <Antigravity
            count={300}
            magnetRadius={6}
            ringRadius={7}
            waveSpeed={0.4}
            waveAmplitude={1}
            particleSize={1.5}
            lerpSpeed={0.05}
            color="#3b82f6"
            autoAnimate={true}
            particleVariance={1}
            particleShape="capsule"
          />
        </div>

        {/* Dotted Grid */}
        <div className="dotted-grid absolute inset-0 opacity-30" />

        {/* Blue Gradient Orb */}
        <div className="hero-orb"></div>

        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust Badge */}
            <RevealAnimation>
              <div className="flex justify-center mb-8">
                <span className="trust-badge animate-bounce-soft">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  TRUSTED BY 50K+ USERS (4.9/5)
                </span>
              </div>
            </RevealAnimation>

            <RevealAnimation delay={100}>
              <h2 className="hero-heading text-display-md md:text-display-lg text-textPrimary mb-8 animate-text-reveal">
                <span className="inline-block stagger-1">Nothing to distract.</span>
                <br />
                <span className="inline-block stagger-2">Everything to build.</span>
              </h2>
            </RevealAnimation>

            <RevealAnimation delay={200}>
              <p className="text-xl text-textSecondary mb-12 max-w-2xl mx-auto leading-relaxed">
                Create ATS-optimized resumes tailored to each job.
                Our AI analyzes postings, generates questions, and builds
                professional resumes that pass automated filters.
              </p>
            </RevealAnimation>

            <RevealAnimation delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <StarBorder
                  as="button"
                  color="cyan"
                  speed="5s"
                  onClick={() => navigate('/dashboard')}
                >
                  <span className="flex items-center gap-2">
                    Start Building Free
                    <ArrowRight size={20} />
                  </span>
                </StarBorder>
                <a href="#how-it-works" className="btn-secondary text-lg">
                  See How It Works
                </a>
              </div>
            </RevealAnimation>

            {/* Stats */}
            <RevealAnimation delay={400}>
              <div className="flex flex-wrap justify-center gap-12 mt-16 pt-16 border-t border-border">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-4xl md:text-5xl font-bold text-textPrimary mb-2">
                      {stat.number}
                    </p>
                    <p className="text-textSecondary">{stat.label}</p>
                  </div>
                ))}
              </div>
            </RevealAnimation>
          </div>
        </div>
      </section>

      {/* Features Section - Clean Bento Grid */}
      <section id="features" className="py-24 md:py-32 bg-surface">
        <div className="container-custom">
          <RevealAnimation>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-white rounded-full text-sm font-medium text-textSecondary mb-6 border border-border">
                FEATURES
              </span>
              <h3 className="text-display-sm md:text-display-md font-bold text-textPrimary">
                Everything you need to
                <br />land your dream job
              </h3>
            </div>
          </RevealAnimation>

          {/* Bento Grid - 3 Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Row 1 */}
            {/* Card 1 - Large spanning 2 rows */}
            <div className="lg:row-span-2 bg-backgroundDark rounded-3xl p-8 text-white flex flex-col justify-between min-h-[320px] hover:scale-[1.02] transition-transform duration-300 tilt-card">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center icon-rotate">
                <Zap size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">{features[0].title}</h4>
                <p className="text-white/70 text-sm leading-relaxed">{features[0].description}</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-6 border border-border hover:border-textPrimary hover:shadow-lg transition-all duration-300 group min-h-[150px] flex flex-col justify-between tilt-card">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center group-hover:bg-backgroundDark transition-colors duration-300 icon-rotate">
                <FileText size={20} className="text-textPrimary group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-textPrimary mb-1">{features[1].title}</h4>
                <p className="text-textSecondary text-xs leading-relaxed">{features[1].description}</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface rounded-3xl p-6 border border-border hover:border-textPrimary hover:shadow-lg transition-all duration-300 group min-h-[150px] flex flex-col justify-between tilt-card">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:bg-backgroundDark transition-colors duration-300 icon-rotate">
                <Target size={20} className="text-textPrimary group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-textPrimary mb-1">{features[2].title}</h4>
                <p className="text-textSecondary text-xs leading-relaxed">{features[2].description}</p>
              </div>
            </div>

            {/* Row 2 */}
            {/* Card 4 - Wide spanning 2 columns */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-border hover:border-textPrimary hover:shadow-lg transition-all duration-300 group flex items-center gap-6 min-h-[150px] tilt-card">
              <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-backgroundDark transition-colors duration-300 icon-rotate">
                <Sparkles size={22} className="text-textPrimary group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-textPrimary mb-1">{features[3].title}</h4>
                <p className="text-textSecondary text-sm leading-relaxed">{features[3].description}</p>
              </div>
            </div>

            {/* Row 3 */}
            {/* Card 5 */}
            <div className="bg-white rounded-3xl p-6 border border-border hover:border-textPrimary hover:shadow-lg transition-all duration-300 group min-h-[150px] flex flex-col justify-between">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center group-hover:bg-backgroundDark transition-colors duration-300">
                <Users size={20} className="text-textPrimary group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-textPrimary mb-1">{features[4].title}</h4>
                <p className="text-textSecondary text-xs leading-relaxed">{features[4].description}</p>
              </div>
            </div>

            {/* Card 6 - Wide spanning 2 columns, dark */}
            <div className="md:col-span-2 bg-backgroundDark rounded-3xl p-6 text-white flex items-center gap-6 min-h-[150px] hover:scale-[1.02] transition-transform duration-300">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award size={22} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-1">{features[5].title}</h4>
                <p className="text-white/70 text-sm leading-relaxed">{features[5].description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 md:py-32 bg-white">
        <div className="container-custom">
          <RevealAnimation>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-surface rounded-full text-sm font-medium text-textSecondary mb-6 border border-border">
                HOW IT WORKS
              </span>
              <h3 className="text-display-sm md:text-display-md font-bold text-textPrimary">
                Four simple steps to
                <br />your perfect resume
              </h3>
            </div>
          </RevealAnimation>

          {/* Steps - Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Card */}
                <div className="bg-surface rounded-3xl p-6 h-full border border-border hover:border-textPrimary hover:shadow-lg transition-all duration-300">
                  {/* Step Number Badge */}
                  <div className="w-12 h-12 bg-backgroundDark text-white rounded-2xl flex items-center justify-center font-bold text-lg mb-6">
                    {step.number}
                  </div>

                  <h4 className="text-lg font-semibold text-textPrimary mb-2">
                    {step.title}
                  </h4>
                  <p className="text-textSecondary text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow Connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center">
                      <ArrowRight size={12} className="text-textSecondary" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Below Steps */}
          <div className="text-center mt-16">
            <StarBorder
              as="button"
              color="cyan"
              speed="5s"
              onClick={() => navigate('/dashboard')}
            >
              Start Building Your Resume
            </StarBorder>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 md:py-32 bg-backgroundDark relative overflow-hidden">
        {/* Dotted Grid Background */}
        <div className="dotted-grid absolute inset-0 opacity-30" />

        <div className="container-custom relative z-10">
          <RevealAnimation>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-mono text-white/70 mb-6 border border-white/20">
                TESTIMONIALS
              </span>
              <h3 className="text-display-sm md:text-display-md font-bold text-white">
                Loved by thousands of
                <br />job seekers worldwide
              </h3>
            </div>
          </RevealAnimation>

          <RevealAnimation delay={200}>
            <AnimatedCarousel
              items={testimonials}
              autoPlay={true}
              interval={5000}
              showArrows={true}
              renderItem={(testimonial) => (
                <div className="max-w-3xl mx-auto text-center px-4">
                  {/* Quote with typewriter font */}
                  <p className="text-xl md:text-2xl text-white font-mono leading-relaxed mb-8">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="text-white font-semibold text-lg">{testimonial.author}</p>
                    <p className="text-white/50 font-mono text-sm">{testimonial.role}</p>
                  </div>
                </div>
              )}
            />
          </RevealAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-light border-t border-border">
        <div className="container-custom">
          <RevealAnimation>
            <div className="text-center max-w-3xl mx-auto">
              <div className="w-16 h-16 bg-backgroundDark rounded-full flex items-center justify-center mx-auto mb-8">
                <Rocket size={28} className="text-white" />
              </div>
              <h3 className="text-display-sm md:text-display-md font-bold text-textPrimary mb-6">
                Ready to land your
                <br />dream job?
              </h3>
              <p className="text-xl text-textSecondary mb-10">
                Join thousands of job seekers who have created ATS-optimized
                resumes and landed interviews at top companies.
              </p>
              <StarBorder
                as="button"
                color="cyan"
                speed="5s"
                className="mx-auto"
                onClick={() => navigate('/dashboard')}
              >
                <span className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight size={20} />
                </span>
              </StarBorder>
              <p className="text-textMuted mt-6 text-sm">
                No credit card required • Free forever plan available
              </p>
            </div>
          </RevealAnimation>
        </div>
      </section>

      {/* Premium Footer */}
      <PremiumFooter />
    </div>
  );
}

export default LandingPage;
