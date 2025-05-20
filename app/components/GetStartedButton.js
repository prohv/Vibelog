"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const GetStartedButton = () => {
  const getStartedButtonRef = useRef(null);

  useEffect(() => {
    if (getStartedButtonRef.current) {
      gsap.fromTo(
        getStartedButtonRef.current,
        { opacity: 0, scale: 0.9, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 0.8,
        }
      );
    }

    return () => {
      gsap.killTweensOf(getStartedButtonRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    gsap.to(getStartedButtonRef.current, {
      scale: 1.08,
      y: -5,
      boxShadow: '0 15px 30px rgba(139, 92, 246, 0.4)',
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(getStartedButtonRef.current, {
      scale: 1,
      y: 0,
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <button
      ref={getStartedButtonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="get-started-button"
    >
      Get Started
    </button>
  );
};

export default GetStartedButton;