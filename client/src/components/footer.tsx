import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Advertising</a>
            <a href="#" className="hover:underline">Business</a>
            <a href="#" className="hover:underline">How Search works</a>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Settings</a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          © 2024 SerCrow - The Best Search Engine Ever
        </div>
      </div>
    </footer>
  );
}