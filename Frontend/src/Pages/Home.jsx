import React from 'react'
import Hero from '../Components/Hero'
import Apps from '../Components/Apps'
import Advisors from '../Components/Advisors'
import Testimonials from '../Components/Testimonials'
import Milestones from '@/Components/Milestones'
import AboutUs from '@/Components/AboutUs'
import HowItWorks from '@/Components/HowItWorks'

const Home = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Testimonials />
      <Advisors />
      <Milestones />
      <AboutUs />
      <Apps />
    </>
  )
}

export default Home
