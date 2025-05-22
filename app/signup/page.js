'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaHome } from 'react-icons/fa';
import styles from './page.module.css';

export default function SignupPage() {
  const [formData, setFormData] = useState({ nickname: '', email: '', password: '' });
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className={styles.signupWrapper}>
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
