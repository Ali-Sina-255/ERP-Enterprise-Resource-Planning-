import { Link } from "react-router-dom";
import { BsFacebook, BsInstagram, BsTwitter, BsEnvelope } from "react-icons/bs";

function FooterCom() {
  return (
    <footer className="border border-t-2 dark:border-t-0 bottom-0 w-full z-40 bg-white/90 backdrop-blur dark:bg-gray-900/90 dark:text-white shadow-md ">
      <div className="max-w-8xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start relative z-10">
          {/* Brand/Info */}
          <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
            <Link to="/" className="flex items-center gap-2 mb-2">
              <span className="text-primary dark:text-fave tracking-wider font-bold text-2xl">
                TET TTS App
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Free text to speech
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-2">
              <BsEnvelope className="h-4 w-4" />
              <span>tet.teams4@gmail.com</span>
            </div>
          </div>

          {/* Footer Links */}
          <div className=" grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 md:mt-0  md:justify-between items-start">
            <div className=" text-black dark:text-white flex flex-col items-start">
              <h3 className="font-semibold mb-2">Products</h3>
              <ul className="flex flex-col items-start">
                <li className="text-gray-700 dark:text-gray-300 py-1 hover:underline">
                  <Link to="#">Text to Speech</Link>
                </li>
                <li className="text-gray-700 dark:text-gray-300 py-1 hover:underline">
                  <Link to="#">History</Link>
                </li>
                <li className="text-gray-700 dark:text-gray-300 py-1 hover:underline">
                  <Link to="#">Blog</Link>
                </li>
              </ul>
            </div>

            <div className=" text-white flex flex-col items-start">
              <h3 className=" text-black dark:text-white font-semibold mb-2">
                Resources
              </h3>
              <ul className="flex flex-col items-start">
                <li className="text-gray-700 dark:text-gray-300 py-1 hover:underline">
                  <Link to="#">Bai.tools</Link>
                </li>
                <li className="text-gray-700 dark:text-gray-300 py-1 hover:underline">
                  <Link to="#">Dang.ai</Link>
                </li>
              </ul>
            </div>
            <div className="text-white flex flex-col items-start">
              <h3 className="text-black dark:text-white font-semibold mb-2">
                Company
              </h3>
              <ul className="flex flex-col items-start">
                <li className="text-gray-700 dark:text-gray-300 py-1 hover:underline">
                  <Link to="#">Privacy Policy</Link>
                </li>
                <li className="text-gray-700 dark:text-gray-300 py-1 hover:underline">
                  <Link to="#">Terms of Service</Link>
                </li>
                <li className="text-gray-700 dark:text-gray-300 py-1 hover:underline">
                  <Link to="#">Refund Policy</Link>
                </li>

              </ul>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-6  mt-4 sm:mt-0  items-center justify-center ">
            <a href="#" className="hover:text-gray-300">
              <BsInstagram className="h-6 w-6" />
            </a>
            <a href="#" className="hover:text-gray-300">
              <BsFacebook className="h-6 w-6" />
            </a>
            <a href="#" className="hover:text-gray-300">
              <BsTwitter className="h-6 w-6" />
            </a>
          </div>
        </div>
        <hr className="border-gray-200 dark:border-gray-700 my-4 " />
        <div className="text-center text-sm text-gray-600 dark:text-gray-300">
          <span>
            © {new Date().getFullYear()} Hussain™. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default FooterCom;
