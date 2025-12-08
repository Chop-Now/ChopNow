import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ containerStyles, setMenuOpened, menuOpened }) => {
  const [activeSection, setActiveSection] = useState("");
  
  const navLinks = [
    { path: "#howItWorks", title: "How It Works" },
    { path: "#testimonials", title: "Testimonials" },
    { path: "#experience", title: "Experience" },
    { path: "#advisors", title: "Advisors" },
    { path: "#Milestones", title: "Milestones" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.path.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(`#${section}`);
            return;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (path) => {
    setMenuOpened(false);
    const element = document.getElementById(path.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className={containerStyles}>
      {navLinks.map((link) => (
        <a
          href={link.path}
          onClick={(e) => {
            e.preventDefault();
            handleClick(link.path);
          }}
          key={link.title}
          className={`${activeSection === link.path ? "active-link" : ""} px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap`}
          style={{ color: 'var(--color-textColor)' }}
        >
            {link.title}
        </a>
      ))}
      {menuOpened && (
        <button className="btn-solid flexCenter gap-2 w-full mt-2">Get Started</button>
      )}
    </nav>
  );
};

export default Navbar;
