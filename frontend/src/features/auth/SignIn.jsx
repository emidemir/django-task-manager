import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { FADE_UP } from '../../lib/constants';
import styles from './Auth.module.css';

import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New state for handling UI feedback
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/api/users/login/', {
        email: email, 
        password: password
      });

      // 3. Extract tokens from the response
      const tokens = {
        access: response.data.access_token,
        refresh: response.data.refresh_token
      };
      
      // 4. Extract user data. 
      const userData = response.data.user || { email: email };
      
      // 5. Fire the login function from AuthContext with both arguments
      login(userData, tokens);
      
      // 6. Redirect to the protected dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div className={styles.card} {...FADE_UP(0)}>
        <div className={styles.header}>
          <motion.h1 className={styles.title} {...FADE_UP(0.1)}>Welcome back</motion.h1>
          <motion.p className={styles.subtitle} {...FADE_UP(0.2)}>
            Enter your details to access your workspace.
          </motion.p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          
          {/* Display error message if login fails */}
          {error && (
            <motion.div className={styles.error} {...FADE_UP(0.25)} style={{ color: 'red', marginBottom: '1rem' }}>
              {error}
            </motion.div>
          )}

          <motion.div className={styles.inputGroup} {...FADE_UP(0.3)}>
            <label className={styles.label} htmlFor="email">Email address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input} 
                placeholder="alex@example.com" 
                required 
                disabled={isLoading}
              />
            </div>
          </motion.div>

          <motion.div className={styles.inputGroup} {...FADE_UP(0.4)}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input} 
                placeholder="••••••••" 
                required 
                disabled={isLoading}
              />
            </div>
          </motion.div>

          <motion.button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isLoading}
            {...FADE_UP(0.5)}
          >
            {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight size={16} />
          </motion.button>
        </form>

        <motion.div className={styles.footer} {...FADE_UP(0.6)}>
          Don't have an account? 
          <Link to="/signup" className={styles.link}>
            Sign up
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}