// app/dashboard/page.js
"use client";

import './Dashboard.css';
import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useRouter } from 'next/navigation';
import DashboardHeader from '../components/DashboardHeader'; // Using the new DashboardHeader
import Footer from '../components/Footer'; // Reusing the existing Footer, but we'll modify its content

export default function Dashboard() {
  const router = useRouter();
  const [selectedContentType, setSelectedContentType] = useState('text'); // Default to text input

  useEffect(() => {
    // Existing purple gradient animation
    gsap.to('.purple-gradient-element', {
      x: '+=80',
      y: '+=80',
      rotation: 10,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Heart logo animation (if DashboardHeader uses .heart-logo)
    gsap.to('.heart-logo', {
      scale: 1.05,
      duration: 1.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.9))',
    });

    // Animation for the main dashboard content on load
    gsap.fromTo('.dashboard-main-content-box',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.3 }
    );

    return () => {
      gsap.killTweensOf('.purple-gradient-element');
      gsap.killTweensOf('.heart-logo');
      gsap.killTweensOf('.dashboard-main-content-box');
    };
  }, []);

  // Function to render the dynamic input area based on selected type
  const renderInputArea = () => {
    switch (selectedContentType) {
      case 'video':
        return (
          <div className="dynamic-input-area">
            {/* Video Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="input-option-icon video-icon"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <div className="input-action-buttons">
              <button className="input-action-button">Record Video</button>
              <button className="input-action-button">Upload Video</button>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="dynamic-input-area">
            {/* Audio Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="input-option-icon audio-icon"
            >
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.2-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2.8z" />
            </svg>
            <div className="input-action-buttons">
              <button className="input-action-button">Record Audio</button>
              <button className="input-action-button">Upload Audio</button>
            </div>
          </div>
        );
      case 'text':
      default:
        return (
          <div className="dynamic-input-area">
            {/* Text Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="input-option-icon text-icon"
            >
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
            <textarea
              className="text-input-area"
              placeholder="Start logging your vibe here..."
              rows="5"
            ></textarea>
            <button className="upload-text-button">Upload Text Vibe</button>
          </div>
        );
    }
  };

  return (
    <div className="page-container">
      <div className="purple-gradient-element"></div>
      <DashboardHeader /> {/* Use the new dashboard header */}

      <main className="main-content dashboard-main-content-box">
        <h1 className="vibe-log-heading">How was your day? 🤔</h1>
        <p className="vibe-log-subheading">Let&#39;s Log your Vibe</p>

        <div className="content-type-buttons-container">
          <button
            className={`content-type-button ${selectedContentType === 'video' ? 'active-content-type-button' : ''}`}
            onClick={() => setSelectedContentType('video')}
          >
            Video
          </button>
          <button
            className={`content-type-button ${selectedContentType === 'audio' ? 'active-content-type-button' : ''}`}
            onClick={() => setSelectedContentType('audio')}
          >
            Audio
          </button>
          <button
            className={`content-type-button ${selectedContentType === 'text' ? 'active-content-type-button' : ''}`}
            onClick={() => setSelectedContentType('text')}
          >
            Text
          </button>
        </div>

        {renderInputArea()} {/* Render the dynamic input area */}
      </main>

      {/* Custom Dashboard Footer */}
      <footer className="dashboard-footer-container">
        <div className="footer-nav-buttons-group">
          <button className="footer-nav-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="footer-button-icon"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="footer-button-text">Home</span>
          </button>
          <button className="footer-nav-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="footer-button-icon"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
            <span className="footer-button-text">Summary</span>
          </button>
          <button className="footer-nav-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="footer-button-icon"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V2zm-4 9h-4V7h-2v4H6v2h4v4h2v-4h4v-2z" />
            </svg>
            <span className="footer-button-text">Review</span>
          </button>
          <button className="footer-nav-button" onClick={() => router.push('/account')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="footer-button-icon"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="footer-button-text">Account</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
