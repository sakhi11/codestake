
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  return (
    <div className="bg-web3-background min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-500">
              404
            </h1>
            <h2 className="mt-6 text-3xl font-bold text-white">
              Page Not Found
            </h2>
            <p className="mt-2 text-gray-400">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div>
            <Link to="/">
              <Button
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
