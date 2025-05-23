"use client";

import './DashboardHeader.css';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardHeader({profilePicUrl = "https://i.ibb.co/CsWpxHvL/purplecatpfp.jpg" }) {

  const router = useRouter();
  const [nickname, setNickname] = useState('VibeMaster');

  useEffect(() => {
    const fetchUserNickname = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("❌ Failed to fetch user:", error.message);
      } else {
        const nicknameFromMeta = data?.user?.user_metadata?.nickname;
        setNickname(nicknameFromMeta || "VibeMaster");
      }
    };

    fetchUserNickname();
  }, []);

  return (
    <header className="dashboard-header-container">
       <div className="logo-container" onClick={() => router.push('/Dashboard')}>
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

      <div className="user-profile-section">
        <Image
          src={profilePicUrl}
          alt="User Profile"
          className="profile-pic-circle"
          width={40}
          height={40}
        />
        <span className="username-display">{nickname}</span>
      </div>
    </header>
  );
}