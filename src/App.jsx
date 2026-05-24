import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AlgorithmSandbox from './components/AlgorithmSandbox';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Education from './components/Education';
import Contact from './components/Contact';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <AlgorithmSandbox />
      <Projects />
      <Experience />
      <Skills />
      <Education />
      <Contact />
    </>
  );
}

export default App;
