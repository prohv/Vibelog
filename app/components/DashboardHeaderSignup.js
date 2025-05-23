"use client";

import Image from 'next/image';
import React from 'react';
import { gsap } from 'gsap'; // Assuming gsap is used for general animations

export default function DashboardHeader({ username = "VibeMaster", profilePicUrl = "https://placehold.co/40x40/7c3aed/ffffff.jpg?text=VM" }) {
  // Note: .heart-logo animation is handled in page.js via GSAP.
  // Pulse-glow animation for .heart-logo is defined in global.css (not provided).
  // No 'container' variable or class is used in this component.

  return (
    <header className="dashboard-header-container">
       <div className="logo-container">
        <svg
          className="heart-logo"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="logo-text">Vibelog</h1>
      </div>
    </header>
  );
}