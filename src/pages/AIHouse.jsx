import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function AIHouse() {
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState({
    products: false,
    solutions: false,
    pricing: false,
    gallery: false,
  });
  const headerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowDropdown({
          products: false,
          solutions: false,
          pricing: false,
          gallery: false,
        });
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    const handleStorage = () => {
      const t = localStorage.getItem("token");
      setIsAuthenticated(!!t);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <>
      <div className="min-h-screen w-full bg-white text-gray-900">
        {/* Header */}
        <header className="fixed top-0 left-0 w-full h-16 bg-black/20 backdrop-blur-md z-50">
          <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
            <div
              className="flex items-center cursor-pointer bg-white/50 px-2 py-1 rounded backdrop-blur-sm"
              onClick={() => navigate("/")}
            >
              <img
                src="/dreamdwell logo.png"
                alt="DreamDwell Logo"
                className="h-12 w-auto"
              />
            </div>
            <nav className="flex items-center gap-6" ref={headerRef}>
              {/* Products */}
              <div className="relative">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown((prev) => ({
                      products: !prev.products,
                      solutions: false,
                      pricing: false,
                      gallery: false,
                    }));
                  }}
                  className="text-black hover:text-gray-700 font-normal text-base px-3 py-1 rounded transition-all duration-300"
                >
                  Products
                </a>
                {showDropdown.products && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg z-10">
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({ ...prev, products: false }));
                        navigate("/products/aihouse");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      DreamDwell.AI House
                    </a>
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({ ...prev, products: false }));
                        navigate("/products/floor-planner");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      Floor Plan Generator
                    </a>
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({ ...prev, products: false }));
                        navigate("/products/3d-visualizer");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      3D Visualizer
                    </a>
                  </div>
                )}
              </div>

              {/* Solutions */}
              <div className="relative">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown((prev) => ({
                      products: false,
                      solutions: !prev.solutions,
                      pricing: false,
                      gallery: false,
                    }));
                  }}
                  className="text-black hover:text-gray-700 font-normal text-base px-3 py-1 rounded transition-all duration-300"
                >
                  Solutions
                </a>
                {showDropdown.solutions && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg z-10">
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({
                          ...prev,
                          solutions: false,
                        }));
                        navigate("/solutions/architects");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      For Architects
                    </a>
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({
                          ...prev,
                          solutions: false,
                        }));
                        navigate("/solutions/interior-designers");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      For Interior Designers
                    </a>
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({
                          ...prev,
                          solutions: false,
                        }));
                        navigate("/solutions/homeowners");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      For Homeowners
                    </a>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="relative">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown((prev) => ({
                      products: false,
                      solutions: false,
                      pricing: !prev.pricing,
                      gallery: false,
                    }));
                  }}
                  className="text-black hover:text-gray-700 font-normal text-base px-3 py-1 rounded transition-all duration-300"
                >
                  Pricing
                </a>
                {showDropdown.pricing && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg z-10">
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({ ...prev, pricing: false }));
                        navigate("/pricing");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      Free Plan
                    </a>
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({ ...prev, pricing: false }));
                        navigate("/pricing");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      Pro Plan - $299
                    </a>
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({ ...prev, pricing: false }));
                        navigate("/pricing");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      Enterprise
                    </a>
                  </div>
                )}
              </div>

              {/* Gallery */}
              <div className="relative">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown((prev) => ({
                      products: false,
                      solutions: false,
                      pricing: false,
                      gallery: !prev.gallery,
                    }));
                  }}
                  className="text-black hover:text-gray-700 font-normal text-base px-3 py-1 rounded transition-all duration-300"
                >
                  Design Gallery
                </a>
                {showDropdown.gallery && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg z-10">
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({ ...prev, gallery: false }));
                        navigate("/gallery/modern");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      Modern Designs
                    </a>
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({ ...prev, gallery: false }));
                        navigate("/gallery/traditional");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      Traditional Designs
                    </a>
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown((prev) => ({ ...prev, gallery: false }));
                        navigate("/gallery/luxury");
                      }}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      Luxury Designs
                    </a>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
          <h1 className="text-center text-3xl md:text-3xl font-bold mb-8">
            <span className="bg-gray-200/80 px-3 py-1 rounded shadow-sm">
              One Place to Imagine, Plan, and Design Spaces
            </span>
          </h1>
          <div className="mx-auto max-w-5xl">
            {/* Removed default image to only display DWG files */}
            <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500 text-lg">Upload your DWG file to get started</p>
            </div>
          </div>

          {/* Unleash the power of AI Section */}
          <div className="mt-16 mb-16">
            <h2 className="text-center text-4xl font-bold mb-12 text-gray-800">
              Ignite innovation with AI
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Configurable design templates video */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                  <video
                    className="w-full h-full object-cover rounded-lg"
                    controls
                    preload="metadata"
                  >
                    <source src="/vedio1.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  Configurable design templates
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Combine ready-to-use templates with your floor plans to ensure
                  perfect arrangement through smart algorithms.
                </p>
              </div>

              {/* Automated lighting design video */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                  <video
                    className="w-full h-full object-cover rounded-lg"
                    controls
                    preload="metadata"
                  >
                    <source src="/vedio2.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  Automated lighting design
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Achieve realistic lighting effects effortlessly with
                  ready-made patterns, showcasing ultra-realistic textures.
                </p>
              </div>
            </div>
          </div>

          {/* Photorealistic rendering section */}
          <div className="mt-16 mb-16">
            <h2 className="text-center text-4xl font-bold mb-4 text-gray-800">
              Photorealistic rendering in minutes
            </h2>
            <p className="text-center text-lg text-gray-600 mb-12">
              Render a 4K image in 2 minutes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {/* Row 1 */}
              {/* Left Column - Video and Additional Card */}
              <div className="md:col-span-2 flex flex-col gap-4">
                {/* Video 1 */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-100">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src="/vedio3.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                {/* Additional Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-100">
                    <img
                      src="/kitchen.jpg"
                      alt="Additional design showcase"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="md:col-span-2 flex flex-col gap-4">
                {/* Image 2 */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-100">
                    <img
                      src="/bedroom1.jpg"
                      alt="Luxurious modern bedroom"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Video 3 */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-100">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src="/vedio4.mp4" type="video/mp4" />

                      Your browser does not support the video tag.
                    </video>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AiHouse Promo Section - Before Footer */}
        <div
  className="relative w-full bg-cover bg-center min-h-[70vh] flex items-center justify-center"
  style={{ backgroundImage: "url('/footerabove2.jpg')" }}
>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative max-w-4xl mx-auto text-center text-white px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Elevate your design with DreamDwell.AI 
            </h2>
            
            <div className="flex justify-center gap-6">
              {!isAuthenticated && (
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 shadow-lg"
                >
                  Get started
                </button>
              )}
              <button
                onClick={() => navigate("/pricing")}
                className="bg-white/70 hover:bg-white text-gray-800 font-semibold px-8 py-3 rounded-full transition-all duration-300 shadow-lg"
              >
                See Pricing
              </button>
            </div>
          </div>
        </div>

      {/* Role Selection Modal */}
      {showRoleModal && !isAuthenticated && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowRoleModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Choose your role</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="grid gap-3">
              <button
                onClick={() => navigate("/architect-signup")}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all"
              >
                <span className="block font-medium text-gray-900">Architect</span>
                <span className="block text-sm text-gray-600">Plan and design homes with ease.</span>
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all"
              >
                <span className="block font-medium text-gray-900">Interior Designer</span>
                <span className="block text-sm text-gray-600">Create stunning interiors in minutes.</span>
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all"
              >
                <span className="block font-medium text-gray-900">Homeowner</span>
                <span className="block text-sm text-gray-600">Visualize your dream home instantly.</span>
              </button>
            </div>
          </div>
        </div>
      )}

        <Footer />
      </div>
    </>
  );
}
