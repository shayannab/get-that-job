import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Linkedin, Twitter, Github } from 'lucide-react';
import Antigravity from './Antigravity';

/**
 * PremiumFooter - A large, bold footer inspired by Nothing™ template
 */
const PremiumFooter = () => {
    const productLinks = [
        { name: 'Resume Builder', href: '/dashboard' },
        { name: 'Cover Letter', href: '/dashboard' },
        { name: 'ATS Checker', href: '/dashboard' },
        { name: 'Templates', href: '#' },
    ];

    const resourceLinks = [
        { name: 'Blog', href: '#' },
        { name: 'Pricing', href: '#' },
        { name: 'Use Cases', href: '#' },
        { name: 'FAQ', href: '#' },
    ];

    const bottomLinks = [
        { name: 'About', href: '#' },
        { name: 'Privacy', href: '#' },
        { name: 'Terms', href: '#' },
        { name: 'Contact', href: '#' },
    ];

    return (
        <footer className="bg-white border-t border-border">
            {/* Main Footer Content */}
            <div className="container-custom py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
                    {/* Tagline */}
                    <div className="md:col-span-4">
                        <p className="text-xl md:text-2xl font-light text-textPrimary italic">
                            Land your dream job
                        </p>
                    </div>

                    {/* Product Links */}
                    <div className="md:col-span-4">
                        <h4 className="text-textPrimary font-semibold mb-6">Product</h4>
                        <ul className="space-y-4">
                            {productLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="footer-link flex items-center gap-2 group"
                                    >
                                        {link.name}
                                        <ArrowUpRight
                                            size={14}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resource Links */}
                    <div className="md:col-span-4">
                        <h4 className="text-textPrimary font-semibold mb-6">Resources</h4>
                        <ul className="space-y-4">
                            {resourceLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="footer-link flex items-center gap-2 group"
                                    >
                                        {link.name}
                                        <ArrowUpRight
                                            size={14}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Large Brand Name with Antigravity */}
                <div className="mt-16 md:mt-24 overflow-hidden relative h-48 md:h-64">
                    {/* Antigravity Particle Effect */}
                    <Antigravity
                        count={200}
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
                    <h2 className="footer-brand text-center absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        Get That Job
                    </h2>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Copyright */}
                        <p className="text-textMuted text-sm">
                            © {new Date().getFullYear()} Get That Job
                        </p>

                        {/* Bottom Links */}
                        <nav className="flex flex-wrap justify-center gap-6">
                            {bottomLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-textMuted hover:text-textPrimary text-sm transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </nav>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <a
                                href="#"
                                className="text-textMuted hover:text-textPrimary transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={18} />
                            </a>
                            <a
                                href="#"
                                className="text-textMuted hover:text-textPrimary transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter size={18} />
                            </a>
                            <a
                                href="#"
                                className="text-textMuted hover:text-textPrimary transition-colors"
                                aria-label="GitHub"
                            >
                                <Github size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PremiumFooter;
