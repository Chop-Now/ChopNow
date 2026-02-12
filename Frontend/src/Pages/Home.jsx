import React from 'react'
import Hero from '../Components/Hero'
import Apps from '../Components/Apps'
import Advisors from '../Components/Advisors'
import Testimonials from '../Components/Testimonials'
import Milestones from '../Components/Milestones'
import AboutUs from '../Components/AboutUs'
import HowItWorks from '../Components/HowItWorks'
import Header from '../Components/Header'
import Footer from '../Components/Footer'

const Home = () => {
  return (
    <>
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
  )
}

export default Home
