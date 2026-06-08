import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080b11] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">
                AIFinder
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-4">
              A curated catalog of the world's best AI tools and software. Find writing assistants, image generators, developer tools, and productivity boosters.
            </p>
            <p className="text-xs text-slate-500 mb-6">
              Created with MERN stack & Tailwind CSS.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/10 text-slate-400 hover:text-purple-400 transition-colors duration-200">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/10 text-slate-400 hover:text-purple-400 transition-colors duration-200">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Directory Links */}
          <div>
            <h4 className="font-display font-semibold text-sm text-slate-200 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Featured Tools
                </Link>
              </li>
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors duration-200">
                  All Categories
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Submit a Tool
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Panel */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} AIFinder. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> for AI exploration.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
