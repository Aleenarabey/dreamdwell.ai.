import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

export default function HeroSection() {
  const navigate = useNavigate();
  const title = "Turning Visions Into Living Spaces".split("");

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.09,
        duration: 1.5,
        ease: [0.68, -0.55, 0.27, 1.55],
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, scale: 0, rotateY: 90, rotateZ: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      rotateZ: 0,
      transition: {
        duration: 0.8,
        ease: [0.68, -0.55, 0.27, 1.55],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 2 + i * 0.3,
        type: "spring",
        stiffness: 60,
      },
    }),
  };

  const handleClick = (role) => {
    if (role === "Architect") navigate("/architect-signup");
    if (role === "Interior Designer") navigate("/interiordesigner-signup");
    if (role === "Homeowner") navigate("/signup");
  };

  return (
    <>
      <div className="hero-container">
        {/* Header */}
        <header className="overlay-header">
          <div
            className="logo-container"
            onClick={() => window.location.reload()}
          >
            <img
              src="dreamdwell logo.png"
              alt="DreamDwell Logo"
              className="logo-image"
            />
          </div>
        </header>

        {/* Background Video */}
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="homepage4.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
        <div className="hero-overlay"></div>

        {/* Content */}
        <div className="hero-content">
          <motion.h1
            className="hero-title"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {title.map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                style={{ display: "inline-block", whiteSpace: "pre" }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>

          {/* ✅ Tagline */}
          <motion.h2
            className="hero-tagline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            Smart, home design Powered by AI
          </motion.h2>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            Choose Your Role.
              </motion.p>
         <motion.p
  className="hero-subtitle"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 2, duration: 0.8 }}
>
  Free to start. Pro features requires payement starts at 299
</motion.p>
         
  
          {/* Cards */}
          <div className="hero-cards">
            {[
              {
                img: "architect (3).jpg",
                label: "Architect",
                desc: "Plan and design homes with ease.",
              },
              {
                img: "interiordesigner.jpg",
                label: "Interior Designer",
                desc: "Create stunning interiors in minutes.",
              },
              {
                img: "homeowner (3).jpg",
                label: "Homeowner",
                desc: "Visualize your dream home instantly.",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="hero-card"
                onClick={() => handleClick(card.label)}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 35px rgba(0, 0, 0, 0.65)",
                }}
              >
                {/* Background Image */}
                <img
                  src={card.img}
                  alt={card.label}
                  className="hero-card-bg"
                />

                {/* Overlay Content */}
                <div className="hero-card-content">
                  <h3>{card.label}</h3>
                  <p>{card.desc}</p>
                  <button
                    className="get-started-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(card.label);
                    }}
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="gradient-divider-glow"></div>

      {/* 🔽 Netflix-style Straight Divider */}
      <div className="reasons-section">
        <h3 className="reasons-title">Reasons to get started</h3>

        <div className="features-cards-wrapper">
          {/* Card 1 */}
          <div className="feature-card">
            <img
              src="reason 1 (2).png"
              alt="3D Experience"
              className="feature-card-img"
            />
            <div className="feature-card-content">
              <h3>Live House Build</h3>
              <p>Explore interactive 3D views instead of static images. Experience house getting constructed lively by AI</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <img
              src="reason 2.png"
              alt="Professional Views"
              className="feature-card-img"
            />
            <div className="feature-card-content">
              <h3>Professional views</h3>
              <p>Get automatic elevations and sectional drawings instantly.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <img
              src="reason 3.jpg"
              alt="Customize Interiors"
              className="feature-card-img"
            />
            <div className="feature-card-content">
              <h3>Customize interiors</h3>
              <p>Try modular kitchens, ceilings, and interiors with one click.</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="feature-card">
            <img
              src="reason 4.jpg"
              alt="Sunlight & Airflow"
              className="feature-card-img"
            />
            <div className="feature-card-content">
              <h3>Sunlight & airflow</h3>
              <p>Simulate natural light and comfort before construction.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <h2 className="how-title">How It Works – For Each User</h2>

        <div className="section-wrapper">
          <div className="accordion">
            {/* Architect */}
            <details>
              <summary>
                <span>👷 Architect</span>
              </summary>
              <div className="accordion-card">
                <h4>Steps for Architect</h4>
                <div className="step-card">
                  Step 1: Upload plot/sketch or client's rough plan
                </div>
                <div className="step-card">
                  Step 2: AI generates optimized floor plans, elevations & 3D
                  models
                </div>
                <div className="step-card">
                  Step 3: Refine layouts, add structural details, and adjust
                  materials
                </div>
                <div className="step-card">
                  Step 4: Share interactive 3D/AR views with clients for
                  approvals
                </div>
                <button className="show-demo-btn">Show Demo</button>
              </div>
            </details>

            {/* Interior Designer */}
            <details>
              <summary>
                <span>🎨 Interior Designer</span>
              </summary>
              <div className="accordion-card">
                <h4>Steps for Interior Designer</h4>
                <div className="step-card">
                  Step 1: Import AI-generated floor plan or 3D model
                </div>
                <div className="step-card">
                  Step 2: Customize interiors – furniture, lighting, textures,
                  false ceilings
                </div>
                <div className="step-card">
                  Step 3: Simulate sunlight, airflow & mood lighting for
                  realism
                </div>
                <div className="step-card">
                  Step 4: Export design concepts or share AR walkthroughs with
                  clients
                </div>
                <button className="show-demo-btn">Show Demo</button>
              </div>
            </details>

            {/* Homeowner */}
            <details>
              <summary>
                <span>🏡 Homeowner</span>
              </summary>
              <div className="accordion-card">
                <h4>Steps for Homeowner</h4>
                <div className="step-card">
                  Step 1: Upload plot/sketch or describe requirements via
                  voice
                </div>
                <div className="step-card">
                  Step 2: AI generates floor plan & 3D model automatically
                </div>
                <div className="step-card">
                  Step 3: Personalize interiors with drag-and-drop (kitchen,
                  walls, furniture)
                </div>
                <div className="step-card">
                  Step 4: Visualize home in AR & share design ideas with
                  family/friends
                </div>
                <button className="show-demo-btn">Show Demo</button>
              </div>
            </details>
          </div>
        </div>
  {/* Footer Links Section */}
{/* Divider after Homeowner */}
<hr className="footer-divider" />

{/* Footer Links Section */}
<section className="footer-links-section">
  <div className="footer-links">
    <a href="/faq">FAQ</a>
    <a href="/privacy">Privacy</a>
    <a href="/speed-test">Speed Test</a>
  </div>
</section>

    </section>




    </>
  );
}
