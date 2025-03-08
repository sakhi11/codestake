
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-web3-background">
      <div className="text-center max-w-md px-4">
        <div className="text-9xl font-bold mb-4 text-gradient-blue-orange">404</div>
        <h1 className="text-2xl font-semibold mb-4 text-white">Page Not Found</h1>
        <p className="text-white/70 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button variant="gradient" size="lg">
          <Home className="mr-2 h-5 w-5" />
          Back to Home
        </Button>
      </div>
      <div className="absolute inset-0 -z-10 grid-pattern opacity-30"></div>
    </div>
  );
};

export default NotFound;
