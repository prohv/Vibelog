'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaHome, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './page.module.css';
import DashboardHeaderSignup from '../components/DashboardHeaderSignup';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const { email, password } = formData;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('❌ Login error:', error.message);
      setMessage(`Login failed: ${error.message}`);
    } else {
      console.log('✅ Logged in:', data);
      setMessage('Login successful! Redirecting...');
      router.push('/Dashboard');
    }
  };

  const handleResetPassword = async () => {
    if (!formData.email) {
      setMessage('Enter your email to reset password');
      return;
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(formData.email);
    if (error) {
      console.error('❌ Reset error:', error.message);
      setMessage(`Reset failed: ${error.message}`);
    } else {
      console.log('📧 Reset email sent:', data);
      setMessage('Reset email sent. Check your inbox!');
    }
  };

  return (
    <div className={styles.signupWrapper}>
      <div className="dashboardHeaderSignup">
        <DashboardHeaderSignup />
      </div>
      <div className={styles.signupCard}>
        <h1 className={styles.title}>Welcome Back!</h1>
        <p className={styles.description}>Log in to your account.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={styles.input}
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className={styles.passwordWrapper} style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className={styles.togglePassword}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          <button
          onClick={handleResetPassword}
          className={styles.handleResetPassword}
        >
          Forgot Password?
        </button>
          <button type="submit" className={styles.submitButton}>
            Log In
          </button>
        </form>


        {message && (
          <p
            className={styles.description}
            style={{ marginTop: '1rem', color: message.includes('failed') || message.includes('❌') ? 'red' : 'green' }}
          >
            {message}
          </p>
        )}
        <FaHome onClick={() => router.push('/')} className={styles.homeIcon} />
      </div>
    </div>
  );
}
