import { Search, Mail, Phone, MapPin, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <Search className="w-6 h-6 text-amber-400 mr-2" />
              <span className="text-2xl font-light tracking-wider">SEEKR</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The world's most exclusive marketplace for rare art, luxury collectibles, and unique treasures.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-800 hover:bg-amber-400 rounded-full flex items-center justify-center cursor-pointer transition-colors group">
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-black" />
              </div>
              <div className="w-10 h-10 bg-gray-800 hover:bg-amber-400 rounded-full flex items-center justify-center cursor-pointer transition-colors group">
                <Twitter className="w-5 h-5 text-gray-400 group-hover:text-black" />
              </div>
              <div className="w-10 h-10 bg-gray-800 hover:bg-amber-400 rounded-full flex items-center justify-center cursor-pointer transition-colors group">
                <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-black" />
              </div>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-medium mb-6 text-amber-400">Services</h3>
            <ul className="space-y-3">
              {['Art Collection', 'Luxury Watches', 'Rare Manuscripts', 'Vintage Jewelry', 'Antique Furniture', 'Fine Wine'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-medium mb-6 text-amber-400">Company</h3>
            <ul className="space-y-3">
              {['About Us', 'How It Works', 'Verification', 'Success Stories', 'Careers', 'Press'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-medium mb-6 text-amber-400">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-amber-400" />
                <span className="text-gray-400">hello@seekr.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span className="text-gray-400">New York, London, Hong Kong</span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-8 bg-gray-800" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 Seekr. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#" className="text-gray-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}