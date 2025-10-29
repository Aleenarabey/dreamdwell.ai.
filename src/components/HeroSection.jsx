import React from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <>
      <div className="hero-container">
        {/* Header */}
        <header className="hero-header">
          <div className="header-left">
            <div className="logo-icon">🔨</div>
            <span className="logo-text">DreamDwell</span>
          </div>
          
          <nav className="header-nav">
            <a href="#home">Home</a>
            <a href="#about">About us</a>
            <a href="#services">Services</a>
            <a href="#pricing">Price</a>
            <a href="#blog">Blog</a>
          </nav>
          
          <div className="header-right">
            <a href="#cart" className="cart-link">Cart(0)</a>
            <button className="contact-btn">Contact us</button>
          </div>
        </header>

        {/* Background Image */}
        <div className="hero-background-video">
          <img src="/Civil engineer and construction worker manager holding digital tablet and blueprints talking and planing about construction site cooperation teamwork concept _ Free Photo.jpeg" alt="Background" className="hero-background-image" />
          <div className="hero-video-overlay"></div>
        </div>

        {/* Hero Content */}
        <div className="hero-main">
          {/* Left Side - Text Content */}
          <div className="hero-left">
            <div className="hero-text-content">
              <h1 className="hero-heading">
                Building your vision<br />
                with unmatched<br />
                precision
              </h1>
              <p className="hero-description">
                Praesent amet diam nunc diam diam vel. Duis diam massa sapien pellentesque et sapien mauris. Lectus porttitor id ipsum dictum enim.
              </p>
              <button className="get-started-btn" onClick={() => navigate("/signup")}>Get Started</button>
            </div>
          </div>
        </div>

        {/* Background Buildings */}
        <div className="background-buildings"></div>
      </div>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          {/* Left Side */}
          <div className="about-left">
            <h2 className="about-heading">Dedicated to innovation in construction solutions</h2>
            <div className="about-image-wrapper">
              <img 
                src="/const1.jpg" 
                alt="Construction Team" 
                className="about-image"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="about-right">
            <button className="more-about-btn">More about</button>
            
            <div className="about-description">
              <p>
                At DreamDwell, we combine cutting-edge technology with construction expertise to deliver exceptional results. Our innovative approach transforms how construction projects are planned, executed, and managed.
              </p>
              <p>
                We leverage advanced AI, 3D visualization, and smart project management tools to ensure every project meets the highest standards of quality, efficiency, and sustainability.
              </p>
            </div>

            {/* Statistics */}
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">400+</span>
                <span className="stat-label">Successful projects</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15+</span>
                <span className="stat-label">Years of experience</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">200+</span>
                <span className="stat-label">Expert team members</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-header">
          <h2 className="services-title">Cele mai bune servicii de Proiectare și asistență documentară de la Proiectari_md in Moldova</h2>
          <button className="view-all-btn">View All services</button>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-image-wrapper">
              <img 
                src="/Cele mai bune servicii de Proiectare și asistență documentară de la Proiectari_md in Moldova_.jpeg" 
                alt="Project Management Services" 
                className="service-image"
              />
            </div>
            <h3 className="service-card-title">Project Management Services</h3>
          </div>

          <div className="service-card">
            <div className="service-image-wrapper">
              <img 
                src="/18 Items Every Architect Should Have In His Office.jpeg" 
                alt="Design and Planning" 
                className="service-image"
              />
            </div>
            <h3 className="service-card-title">Design and Planning</h3>
          </div>

          <div className="service-card">
            <div className="service-image-wrapper">
              <img 
                src="/download.jpeg" 
                alt="Commercial Building Solutions" 
                className="service-image"
              />
            </div>
            <h3 className="service-card-title">Commercial Building Solutions</h3>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section">
        <div className="projects-header">
          <h2 className="projects-title">Showcasing our most recent projects.</h2>
          <button className="view-all-projects-btn">View all project</button>
        </div>

        <div className="projects-grid">
          <div className="project-card">
            <div className="project-image-wrapper">
              <img 
                src="/Project Adjacent to Highways Attracting Mumbai Homebuyers.jpeg" 
                alt="Urban Oasis Apartments" 
                className="project-image"
              />
            </div>
            <div className="project-content">
              <p className="project-date">Completed at Jul 14, 2022</p>
              <h3 className="project-title">Urban Oasis Apartments</h3>
              <p className="project-description">
                Transforming urban living with modern architecture and sustainable design practices.
              </p>
              <a href="#project" className="project-link">Click here →</a>
            </div>
          </div>

          <div className="project-card">
            <div className="project-image-wrapper">
              <img 
                src="/Alibaba Industrial Park - Ginsun CG.jpeg" 
                alt="Riverside Business Complex" 
                className="project-image"
              />
            </div>
            <div className="project-content">
              <p className="project-date">Completed at Jun 22, 2023</p>
              <h3 className="project-title">Riverside Business Complex</h3>
              <p className="project-description">
                A state-of-the-art commercial facility designed to foster innovation.
              </p>
              <a href="#project" className="project-link">Click here →</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="cta-banner-section">
        <div className="cta-banner-container">
          <div className="cta-left">
            <div className="cta-content">
              <h2 className="cta-heading">
                Get started on your<br />
                project today.
              </h2>
              <button className="cta-button">Contact us</button>
              <div className="cta-icon"></div>
            </div>
          </div>

          <div className="cta-right">
            <img 
              src="/footerabove2.jpg" 
              alt="Modern Buildings" 
              className="cta-image"
            />
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="testimonial-container">
          <div className="testimonial-image-wrapper">
            <div className="testimonial-image-bg"></div>
            <img 
              src="/30s businesswoman in white background _ Premium AI-generated PSD.jpeg" 
              alt="Happy Client" 
              className="testimonial-image"
            />
          </div>

          <div className="testimonial-content">
            <h2 className="testimonial-title">Trusted feedback from our happy clients.</h2>
            <p className="testimonial-text">
              "Preserving the charm of our historic home while adding modern amenities was no easy feat, but DreamDwell Construction handled it with grace. Their attention to detail and respect for the home's heritage were evident throughout the project. We're thrilled with the results."
            </p>
            
            <div className="star-rating">
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star">☆</span>
            </div>

            <div className="testimonial-footer">
              <div className="client-info">
                <h3 className="client-name">Wade Warren</h3>
                <p className="client-title">Department head</p>
              </div>
              <div className="testimonial-nav">
                <button className="nav-arrow prev">←</button>
                <button className="nav-arrow next">→</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-column">
              <div className="footer-logo">
                <span className="footer-logo-icon">🔨</span>
                <span className="footer-logo-text">DreamDwell</span>
              </div>
              <p className="footer-description">
                Transforming construction with innovative solutions and expert craftsmanship for your dream projects.
              </p>
              <div className="footer-map-wrapper">
                <img 
                  src="/footerabove2.jpg" 
                  alt="Location Map" 
                  className="footer-map"
                />
              </div>
              <p className="footer-address">
                2972 Westheimer Rd. Santa Ana, Illinois 85486
              </p>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Main page</h4>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#team">Team</a></li>
                <li><a href="#team-details">Team details</a></li>
                <li><a href="#price">Price</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Inner page</h4>
              <ul className="footer-links">
                <li><a href="#services">Services</a></li>
                <li><a href="#services-details">Services details</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#blog-details">Blog details</a></li>
                <li><a href="#project">Project</a></li>
                <li><a href="#project-details">Project details</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Utility page</h4>
              <ul className="footer-links">
                <li><a href="#style-guide">Style guide</a></li>
                <li><a href="#licenses">Licenses</a></li>
                <li><a href="#404">404 page</a></li>
                <li><a href="#password">Password protected</a></li>
                <li><a href="#changelog">Change Log</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <button className="footer-click-btn">Click here →</button>
              <span className="footer-powered-by">Powered by webflow</span>
              <span className="footer-designed-by">Design by webocen</span>
            </div>
            <div className="footer-bottom-right">
              <div className="footer-social">
                <button className="social-icon">f</button>
                <button className="social-icon">📷</button>
                <button className="social-icon">in</button>
              </div>
              <div className="footer-webflow-badge">
                <img src="/webflow-logo.png" alt="Webflow" className="webflow-logo" />
                <span>Made in Webflow</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
