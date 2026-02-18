import React from 'react';
import Hero from '../Components/Hero';
import Apps from '../Components/Apps';
import Advisors from '../Components/Advisors';
import Testimonials from '../Components/Testimonials';
import Milestones from '../Components/Milestones';
import AboutUs from '../Components/AboutUs';
import HowItWorks from '../Components/HowItWorks';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import SEO from '../Components/SEO';

const Home = () => {
  return (
    <>
      <SEO
        title="ChopNow - Save Food, Save Money, Save the Planet"
        description="ChopNow connects you with surplus food from local businesses at discounted prices. Reduce food waste and save money in Kigali, Rwanda."
      />
      <Header />
      <Hero />
      <HowItWorks />
      <Testimonials />
      <Advisors />
      <Milestones />
      <AboutUs />
      <Apps />
      <Footer />
    </>
  );
};

export default Home;
