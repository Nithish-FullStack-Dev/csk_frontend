import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  const hostname = window.location.hostname;

  const subdomain = hostname.split(".")[0];

  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  const isCRM =
    subdomain === "app" || hostname.startsWith("app.") || isLocalhost;

  // Dynamic home path
  const homePath = isCRM ? "/" : "/";

  // Dynamic home URL
  const homeUrl = isCRM
    ? "https://app.cskrealtors.com/"
    : "https://www.cskrealtors.com/";

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>

        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>

        <a
          href={homePath}
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
