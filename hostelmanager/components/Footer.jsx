"use client";
import React, { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setEmail(""), 400);
  };

  return (
    <footer className="w-full mt-0 bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400">
      {/* Glass overlay inside footer for readability */}
      <div className="w-full h-full bg-black/10 px-6 md:px-12 py-15 rounded-t-2xl shadow-2xl">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* ABOUT */}
          <div className="space-y-4">
            <h4 className="text-2xl font-semibold text-black tracking-tight">
              Hostel<span className="text-blue-900 font-bold">Manager</span>
            </h4>

            <p className="text-black/80 text-sm font-medium leading-relaxed">
              Smart, secure and fast hostel management and search platform.
              Manage listings, bookings, and bed availability — all in one place.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-3">
              <a className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition">
                <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 19c7.333 0 11.333-6.083..."/>
                </svg>
              </a>

              <a className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition">
                <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 10-11.5 9.87..."/>
                </svg>
              </a>

              <a className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition">
                <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2h10a5 5 0 015 5v10..."/>
                </svg>
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h5 className="text-black text-lg font-semibold mb-3">Quick Links</h5>

            <ul className="space-y-2 text-black/80 text-sm">
              <li><a className="hover:text-black underline-offset-2 hover:underline cursor-pointer">Home</a></li>
              <li><a className="hover:text-black underline-offset-2 hover:underline cursor-pointer">Add Property</a></li>
              <li><a className="hover:text-black underline-offset-2 hover:underline cursor-pointer">Show Properties</a></li>
              <li><a className="hover:text-black underline-offset-2 hover:underline cursor-pointer">About</a></li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div>
            <h5 className="text-black text-lg font-semibold mb-3">Resources</h5>

            <ul className="space-y-2 text-black/80 text-sm">
              <li><a className="hover:text-black underline-offset-2 hover:underline cursor-pointer">Help Center</a></li>
              <li><a className="hover:text-black underline-offset-2 hover:underline cursor-pointer">Privacy Policy</a></li>
              <li><a className="hover:text-black underline-offset-2 hover:underline cursor-pointer">Terms of Service</a></li>
              <li><a className="hover:text-black underline-offset-2 hover:underline cursor-pointer">Status</a></li>
            </ul>
          </div>

          {/* CONTACT + NEWSLETTER */}
          <div>
            <h5 className="text-black text-lg font-semibold mb-3">Contact</h5>

            <div className="text-black/80 text-sm space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span>support@hostelmanager.com</span>
              </div>

              <div className="flex items-center gap-2">
                <span>+91 98765 43210</span>
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                className="flex-1 bg-black/10 border border-black/20 text-black px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="mt-10 border-t border-black/20 pt-6 flex flex-col md:flex-row justify-between text-black/80 text-sm font-medium">
          <p>© {new Date().getFullYear()} HostelManager. All rights reserved.</p>

          <div className="flex gap-4 mt-3 md:mt-0">
            <a className="hover:text-black cursor-pointer">Privacy</a>
            <a className="hover:text-black cursor-pointer">Terms</a>
            <a className="hover:text-black cursor-pointer">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
