"use client";

import { useEffect } from 'react';
import { gsap } from 'gsap';
import Header from './components/Header';
import GetStartedButton from './components/GetStartedButton';
import Footer from './components/Footer';

export default function Home() {
  useEffect(() => {
    gsap.to('.purple-gradient-element', {
      x: '+=80',
      y: '+=80',
      rotation: 10,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    gsap.to('.heart-logo', {
      scale: 1.05,
      duration: 1.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.9))',
    });

    return () => {
      gsap.killTweensOf('.purple-gradient-element');
      gsap.killTweensOf('.heart-logo');
    };
  }, []);

  return (
    <div className="page-container">
      <div className="purple-gradient-element"></div>
      <Header />
      <main className="main-content">
        <GetStartedButton />
        <div className="main-text">
          <p>Your journey to mindful living begins here. Capture your thoughts, reflect on your day, and grow with Vibelog.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}