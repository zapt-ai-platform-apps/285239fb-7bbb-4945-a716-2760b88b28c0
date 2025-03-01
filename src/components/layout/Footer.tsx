import { FaGithub, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <a 
              href="https://www.zapt.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <span className="text-xl font-bold">Made on ZAPT</span>
            </a>
          </div>
          <div className="flex space-x-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300"
            >
              <FaGithub size={24} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300"
            >
              <FaTwitter size={24} />
            </a>
          </div>
        </div>
        <div className="mt-4 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Reddit Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;