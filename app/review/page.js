// app/Review/page.js
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import DashboardHeader from '../components/DashboardHeader';
import './review.css'; 

export default function Review() {
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        const { data: session } = await supabase.auth.getUser();
        if (!session.user) {
          toast.error('Please log in to view your review.');
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('video_results')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        setResults(data || []);
      } catch (err) {
        console.error('❌ Error fetching results:', err);
        toast.error('Failed to load review.', { duration: 3000 });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    gsap.to('.purple-gradient-element', {
      x: '+=80',
      y: '+=80',
      rotation: 10,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    gsap.fromTo(
      '.dashboard-main-content-box',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.3 }
    );

    return () => {
      gsap.killTweensOf('.purple-gradient-element');
      gsap.killTweensOf('.dashboard-main-content-box');
    };
  }, [router]);

  const toggleRowDetails = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="page-container">
      <div className="purple-gradient-element"></div>
      <DashboardHeader />

      <main className="main-content dashboard-main-content-box">
        <h1 className="vibe-log-heading">Vibe Review</h1>
        <p className="vibe-log-subheading">Your Past Video Journals</p>

        {loading ? (
          <p className="loading-message" aria-live="polite">
            Loading...
          </p>
        ) : results.length === 0 ? (
          <p className="empty-message">
            No video journals found.{' '}
            <button
              onClick={() => router.push('/dashboard')}
              className="empty-state-nav-button"
            >
              Start logging on the Dashboard!
            </button>
          </p>
        ) : (
          <div className="summary-table-container">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Video URL</th>
                  <th>Summary</th>
                  <th>Dominant Emotion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <>
                    <tr key={result.id}>
                      <td>{new Date(result.created_at).toLocaleString()}</td>
                      <td>
                        <a
                          href={result.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="video-url-link"
                        >
                          Link
                        </a>
                      </td>
                      <td>{result.summary}</td>
                      <td>{result.dominant_emotion}</td>
                      <td>
                        <button
                          className="input-action-button"
                          onClick={() => toggleRowDetails(result.id)}
                        >
                          {expandedRow === result.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === result.id && (
                      <tr>
                        <td colSpan="5">
                          <div className="details-section">
                            <h3>Video Insights</h3>
                            <p>{result.insights}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="dashboard-footer-container">
        <div className="footer-nav-buttons-group">
          <button
            className="footer-nav-button"
            onClick={() => router.push('/dashboard')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="footer-button-icon"
            >
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <span className="footer-button-text">Dashboard</span>
          </button>
        </div>
      </footer>
    </div>
  );
}