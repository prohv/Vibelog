// app/summary/page.js
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import DashboardHeader from '../components/DashboardHeader'; // Reuse DashboardHeader
import './Summary.css';

export default function Summary() {
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null); // Track expanded row for details

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        const { data: session } = await supabase.auth.getUser();
        if (!session.user) {
          toast.error('Please log in to view your summary.');
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('results')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        setResults(data || []);
      } catch (err) {
        console.error('❌ Error fetching results:', err);
        toast.error('Failed to load summary.', { duration: 3000 });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    // Animations similar to Dashboard
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

  // Toggle expanded row for viewing details
  const toggleRowDetails = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="page-container">
      <div className="purple-gradient-element"></div>
      <DashboardHeader /> {/* Reuse DashboardHeader for consistency */}

      <main className="main-content dashboard-main-content-box">
        <h1 className="vibe-log-heading">Vibe Summary</h1>
        <p className="vibe-log-subheading">Your Past Vibe Logs</p>

        {loading ? (
          <p className="loading-message">Loading...</p>
        ) : results.length === 0 ? (
          <p className="empty-message">No vibe logs found. Start logging on the Dashboard!</p>
        ) : (
          <div className="summary-table-container">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transcript</th>
                  <th>Mood</th>
                  <th>Message</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <>
                    <tr key={result.id}>
                      <td>{new Date(result.created_at).toLocaleString()}</td>
                      <td>{result.transcript}</td>
                      <td>{result.sentiment?.summary?.overall_mood || 'N/A'}</td>
                      <td>{result.sentiment?.summary?.motivational_message || 'N/A'}</td>
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
                            <h3>Sentiment Analysis Details</h3>
                            {result.sentiment?.classified_events?.length > 0 ? (
                              <ul>
                                {result.sentiment.classified_events.map((event, index) => (
                                  <li key={index}>
                                    <strong>{event.sentence}</strong> - {event.label} (Confidence: {event.confidence})
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No detailed sentiment analysis available.</p>
                            )}
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
    </div>
  );
}