import React from 'react';
import { Heart, Mail, Twitter, Linkedin, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-lifelink-primary p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" fill="white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">LifeLink<span className="text-lifelink-primary">AI</span></span>
            </div>
            <p className="text-slate-400 max-w-sm text-lg leading-relaxed">
              Empowering responders with software-defined intelligence. By utilizing standard smartphone sensors, we're making rapid response accessible to everyone, everywhere.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Twitter size={20} />} />
              <SocialIcon icon={<Linkedin size={20} />} />
              <SocialIcon icon={<Facebook size={20} />} />
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Platform</h3>
            <ul className="space-y-4">
              <li><FooterLink href="#">Features</FooterLink></li>
              <li><FooterLink href="#">Security</FooterLink></li>
              <li><FooterLink href="#">Roadmap</FooterLink></li>
              <li><FooterLink href="#">Enterprise</FooterLink></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Company</h3>
            <ul className="space-y-4">
              <li><FooterLink href="#">About Us</FooterLink></li>
              <li><FooterLink href="#">Contact</FooterLink></li>
              <li><FooterLink href="#">Privacy Policy</FooterLink></li>
              <li><FooterLink href="#">Terms of Service</FooterLink></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © 2024 LifeLink AI. Built with ❤️ for Microsoft Imagine Cup.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Systems Normal</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-sm text-slate-500">Azure Region: East US</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-lifelink-primary hover:text-white transition-all">
    {icon}
  </a>
);

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} className="text-slate-400 hover:text-white transition-colors font-medium">
    {children}
  </a>
);

export default Footer;