// app/account/page.js
"use client";

import './account.css';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import DashboardHeader from '../components/DashboardHeader'; 
import Footer from '../components/Footer';

export default function Account() {
  useEffect(() => {
    // Purple gradient animation (consistent with Dashboard)
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

    // Animation for the main account content on load
    gsap.fromTo('.account-main-content-box',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.3 }
    );

    // Animation for profile picture
    gsap.fromTo('.account-profile-pic',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)', delay: 0.5 }
    );

    return () => {
      gsap.killTweensOf('.purple-gradient-element');
      gsap.killTweensOf('.heart-logo');
      gsap.killTweensOf('.account-main-content-box');
      gsap.killTweensOf('.account-profile-pic');
    };
  }, []);

  return (
    <div className="page-container">
      <div className="purple-gradient-element"></div>
      <DashboardHeader />

      <main className="main-content account-main-content-box">
        <div className="account-profile-section">
          <img
            src="/placeholder-profile-pic.jpg"
            alt="Profile Picture"
            className="account-profile-pic"
          />
          <h1 className="account-username">Your Username</h1>
        </div>

        <div className="settings-options-container">
          <div className="settings-option">
            <span className="settings-option-label">Edit Profile</span>
            <button className="settings-option-button">Edit</button>
          </div>
          <div className="settings-option">
            <span className="settings-option-label">Change Password</span>
            <button className="settings-option-button">Change</button>
          </div>
          <div className="settings-option">
            <span className="settings-option-label">Notifications</span>
            <button className="settings-option-button">Configure</button>
          </div>
          <div className="settings-option">
            <span className="settings-option-label">Privacy Settings</span>
            <button className="settings-option-button">Adjust</button>
          </div>
        </div>

        <button className="save-settings-button">Save Settings</button>
      </main>

      <Footer />
    </div>
  );
}