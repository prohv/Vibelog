'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaHome } from 'react-icons/fa';
import styles from './page.module.css';
import DashboardHeaderSignup from '../components/DashboardHeaderSignup'; 
import { supabase } from '../../lib/supabaseClient';


export default function SignupPage() {
  const [formData, setFormData] = useState({ nickname: '', email: '', password: '' });
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
  
    const { email, password, nickname } = formData;
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname }, // Optional metadata saved with the user
      },
    });
  
    if (error) {
      console.error('❌ Error signing up:', error.message);
    } else {
      console.log('✅ User signed up:', data);
      alert('Check your email for verification!');
      router.push('/Dashboard'); // or wherever you want to redirect
    }
  };  

  return (
    <div className={styles.signupWrapper}>
      <div className="dashboardHeaderSignup">
        <DashboardHeaderSignup />
      </div>
      <div className={styles.signupCard}>
        <h1 className={styles.title}>Welcome</h1>
        <p className={styles.description}>
          Create your account to get started. It's quick and easy!
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nickname"
            placeholder="Nickname"
            className={styles.input}
            value={formData.nickname}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={styles.input}
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className={styles.input}
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className={styles.submitButton}>
            Sign Up
          </button>
        </form>

        <FaHome onClick={() => router.push('/')} className={styles.homeIcon} />
      </div>
    </div>
  );
}