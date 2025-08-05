import { Link } from 'wouter';
import { Twitter, Facebook, Linkedin } from 'lucide-react';
import serqoLogoPath from '@assets/20250620_150619_1750447628914.png';

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={serqoLogoPath} 
                alt="SerCrow Bird Logo Footer" 
                className="w-8 h-8 object-contain drop-shadow-sm"
              />
              <span className="text-lg font-bold serqo-blue">SerCrow</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              The best search engine ever, delivering fast, accurate, and relevant results for all your queries.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Search</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search">
                  <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">Web Search</span>
                </Link>
              </li>
              <li>
                <Link href="/results?filter=images">
                  <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">Image Search</span>
                </Link>
              </li>
              <li>
                <Link href="/results?filter=news">
                  <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">News Search</span>
                </Link>
              </li>
              <li>
                <Link href="/results?filter=videos">
                  <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">Video Search</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Press</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © 2025 SerCrow. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
