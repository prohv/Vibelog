// components/DashboardFooter.js
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import './DashboardFooter.css';


export default function DashboardFooter() {
  const router = useRouter();

  return (
    <footer className="dashboard-footer-container">
      <div className="footer-nav-buttons-group">
        <button className="footer-nav-button" onClick={() => router.push('/Dashboard')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="footer-button-icon">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="footer-button-text">Home</span>
        </button>

        <button className="footer-nav-button" onClick={() => router.push('/summary')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="footer-button-icon">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
          <span className="footer-button-text">Audio Summary</span>
        </button>

        <button className="footer-nav-button" onClick={() => router.push('/review')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="footer-button-icon">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V2zm-4 9h-4V7h-2v4H6v2h4v4h2v-4h4v-2z" />
          </svg>
          <span className="footer-button-text">Video Review</span>
        </button>
      </div>
    </footer>
  );
}
