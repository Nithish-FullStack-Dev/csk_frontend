import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const navigation = [
  { name: "Home", href: "/public" },
  { name: "About", href: "/public/about" },
  {
    name: "Properties",
    dropdown: [
      { name: "Upcoming Projects", href: "/public/upcoming-projects" },
      { name: "Ongoing Projects", href: "/public/ongoing-projects" },
      { name: "Completed Projects", href: "/public/completed-projects" },
    ],
  },
  {
    name: "Open-Properties",
    dropdown: [
      { name: "Open Lands", href: "/public/open-lands" },
      { name: "Open Plots", href: "/public/open-plots" },
    ],
  },
  { name: "Contact Us", href: "/public/contact" },
];

const PublicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<
    string | null
  >(null);

  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 70);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveMobileDropdown(null);
    setActiveDropdown(null);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (location.pathname === href) return true;
    const parentItem = navigation.find((navItem) => {
      return (
        !!navItem.dropdown && navItem.dropdown.some((s) => s.href === href)
      );
    });
    if (parentItem && parentItem.dropdown) {
      return parentItem.dropdown.some(
        (subItem) => location.pathname === subItem.href
      );
    }
    return false;
  };

  return (
    <>
      <header
        className={clsx(
          "w-full z-50 transition-all duration-500 ease-in-out",
          isSticky
            ? "fixed top-0 bg-white/95 backdrop-blur-lg shadow-xl py-3"
            : "absolute top-0 bg-transparent py-4"
        )}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/public" className="flex items-center flex-shrink-0">
              <div className="w-24 md:w-28 transition-transform duration-500 hover:scale-105">
                <img
                  src={"/assets/images/logo.png"}
                  alt="CSK Realtors Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-10 relative">
              {navigation.map((item) =>
                item.dropdown ? (
                  <div
                    key={item.name}
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() =>
                      setActiveDropdown((cur) =>
                        cur === item.name ? null : cur
                      )
                    }
                  >
                    <button
                      className={clsx(
                        "flex items-center text-lg font-medium transition-colors duration-300 py-2",
                        isActive(item.href)
                          ? "text-estate-gold border-b-2 border-estate-gold"
                          : isSticky
                          ? "text-gray-800 hover:text-estate-gold"
                          : "text-white hover:text-estate-gold"
                      )}
                    >
                      {item.name}
                      <motion.span
                        animate={{
                          rotate: activeDropdown === item.name ? 180 : 0,
                        }}
                        transition={{ duration: 0.25 }}
                        className="ml-1"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scaleY: 0.98 }}
                          animate={{ opacity: 1, y: 0, scaleY: 1 }}
                          exit={{ opacity: 0, y: 8, scaleY: 0.98 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="absolute -left-1/2  -translate-x-1/2 mt-1 w-60 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100 z-50 origin-top"
                        >
                          {item.dropdown.map((subItem) => {
                            const isActiveSub = currentPath === subItem.href;
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                onClick={() => {
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                  setActiveDropdown(null);
                                }}
                                className={`block px-5 py-3 text-base transition-colors duration-200 ${
                                  isActiveSub
                                    ? "text-estate-gold font-semibold bg-gray-50"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-estate-gold"
                                }`}
                              >
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className={clsx(
                      "text-lg font-medium transition-colors duration-300 py-2",
                      isActive(item.href)
                        ? "text-estate-gold border-b-2 border-estate-gold"
                        : isSticky
                        ? "text-gray-800 hover:text-estate-gold"
                        : "text-white hover:text-estate-gold"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>

            <button
              className={clsx(
                "lg:hidden transition-colors duration-300 p-2 rounded-md",
                isMenuOpen || isSticky ? "text-gray-800" : "text-white"
              )}
              onClick={() => setIsMenuOpen((s) => !s)}
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-[10000] p-8 shadow-2xl flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.36, ease: "easeOut" }}
            >
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-6 right-6 text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close mobile menu"
              >
                <X className="h-7 w-7" />
              </button>

              <nav className="flex flex-col h-full gap-5 pt-16">
                {navigation.map((item) =>
                  item.dropdown ? (
                    <div key={item.name}>
                      <button
                        className="flex items-center justify-between text-xl font-semibold w-full text-gray-800 py-2"
                        onClick={() =>
                          setActiveMobileDropdown((cur) =>
                            cur === item.name ? null : item.name
                          )
                        }
                      >
                        <span>{item.name}</span>
                        <motion.span
                          animate={{
                            rotate:
                              activeMobileDropdown === item.name ? 180 : 0,
                          }}
                          transition={{ duration: 0.22 }}
                        >
                          <ChevronDown className="h-5 w-5" />
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {activeMobileDropdown === item.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="ml-4 mt-2 flex flex-col gap-3 border-l-2 border-gray-200 pl-4"
                          >
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setActiveMobileDropdown(null);
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }}
                                className="text-gray-700 text-base py-1 hover:text-estate-gold"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => {
                        setIsMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xl font-semibold transition-colors duration-300 py-2 text-gray-800 hover:text-estate-gold"
                    >
                      {item.name}
                    </Link>
                  )
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicHeader;
