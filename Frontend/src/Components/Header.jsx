import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets.js";
import Navbar from "./Navbar.jsx";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const toggleMenu = () => setMenuOpened((prev) => !prev);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-3">
      {/* Container */}
      <div className="max-padd-container flexBetween">
        {/* Logo*/}
        <div className="flex flex-1">
          <Link to="/" className="flex items-end">
            <img src={assets.ChopNowLogo} alt="ChopNow Logo" className="h-12" />
          </Link>
        </div>
        {/*Navbar*/}
        <div className="flexCenter flex-1">
          <Navbar
            setMenuOpened={setMenuOpened}
            menuOpened={menuOpened}
            containerStyles={`${
              menuOpened
                ? "flex items-start flex-col gap-y-4 fixed top-16 left-0 right-0 p-6 bg-white shadow-md w-full ring-1 ring-slate-900/5 z-50"
                : "hidden lg:flex gap-x-5 xl:gap-x-1 medium-15 p-1"
            }`}
          />
        </div>
        {/*Button and menu*/}
        <div className="flex flex-1 items-center justify-end gap-x-4 sm:gap-x-8">
          <div className="relative lg:hidden w-7 h-6">
            <Menu
              onClick={toggleMenu}
              className={`absolute inset-0 lg:hidden cursor-pointer transition-opacity duration-700 ${
                menuOpened ? "opacity-0" : "opacity-100"
              }`}
              strokeWidth={3}
            />
            <X
              onClick={toggleMenu}
              className={`absolute inset-0 lg:hidden cursor-pointer transition-opacity duration-700 ${
                menuOpened ? "opacity-100" : "opacity-0"
              }`}
              strokeWidth={3}
            />
          </div>
          {/*Get started button*/}
          <div className="hidden lg:block">
            <button className="btn-solid flexCenter gap-2 ">Get Started</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
