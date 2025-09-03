
import React from 'react';

const DownloadPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Download SerCrow</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="border rounded-lg p-6 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4">Windows</h2>
          <p className="text-gray-600 mb-4">Compatible with Windows 10 and later.</p>
          <a
            href="#"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Download for Windows
          </a>
        </div>
        <div className="border rounded-lg p-6 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4">macOS</h2>
          <p className="text-gray-600 mb-4">Requires macOS 11.0 or later.</p>
          <a
            href="#"
            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
          >
            Download for macOS
          </a>
        </div>
        <div className="border rounded-lg p-6 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4">Linux</h2>
          <p className="text-gray-600 mb-4">Available as a .deb or .AppImage.</p>
          <a
            href="#"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            Download for Linux
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
