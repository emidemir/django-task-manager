import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { FADE_UP } from '../../lib/constants';
import styles from './Auth.module.css';

import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

export default function SignUp() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Updated states to match the Django serializer fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');

  // UI feedback states
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation to match the serializer's logic
    if (password !== passwordMatch) {
      return setError("Passwords do not match.");
    }

    setIsLoading(true);
    
    try {
      // Send the exact fields expected by your SignupSerializer
      const response = await api.post('/users/signup/', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        password_match: passwordMatch
      });

      // Extract tokens and user data
      const tokens = {
        access: response.data.access_token,
        refresh: response.data.refresh_token
      };
      
      const userData = response.data.user || { 
        name: `${firstName} ${lastName}`, 
        email: email 
      };

      // Log the user in globally and redirect
      login(userData, tokens);
      navigate('/dashboard');

    } catch (err) {
      console.error("Registration error:", err);
      
      const errorData = err.response?.data;
      
      // Attempt to extract specific field errors from the serializer
      const errorMsg = errorData?.detail 
        || errorData?.non_field_errors?.[0]
        || errorData?.email?.[0] 
        || errorData?.password?.[0] 
        || errorData?.password_match?.[0]
        || 'Failed to create account. Please try again.';
        
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div className={styles.card} {...FADE_UP(0)}>
        <div className={styles.header}>
          <motion.h1 className={styles.title} {...FADE_UP(0.1)}>Create account</motion.h1>
          <motion.p className={styles.subtitle} {...FADE_UP(0.2)}>
            Join your team's workspace today.
          </motion.p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          
          {error && (
            <motion.div className={styles.error} {...FADE_UP(0.25)} style={{ color: 'red', marginBottom: '1rem' }}>
              {error}
            </motion.div>
          )}

          <motion.div className={styles.inputGroup} {...FADE_UP(0.3)}>
            <label className={styles.label} htmlFor="firstName">First Name</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input 
                type="text" 
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={styles.input} 
                placeholder="Alex" 
                required 
                disabled={isLoading}
              />
            </div>
          </motion.div>

          <motion.div className={styles.inputGroup} {...FADE_UP(0.35)}>
            <label className={styles.label} htmlFor="lastName">Last Name</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input 
                type="text" 
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={styles.input} 
                placeholder="Carter" 
                required 
                disabled={isLoading}
              />
            </div>
          </motion.div>

          <motion.div className={styles.inputGroup} {...FADE_UP(0.4)}>
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

          <motion.div className={styles.inputGroup} {...FADE_UP(0.5)}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input} 
                placeholder="Create a strong password" 
                required 
                disabled={isLoading}
                minLength={8}
              />
            </div>
          </motion.div>

          <motion.div className={styles.inputGroup} {...FADE_UP(0.55)}>
            <label className={styles.label} htmlFor="passwordMatch">Confirm Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input 
                type="password" 
                id="passwordMatch"
                value={passwordMatch}
                onChange={(e) => setPasswordMatch(e.target.value)}
                className={styles.input} 
                placeholder="Type your password again" 
                required 
                disabled={isLoading}
                minLength={8}
              />
            </div>
          </motion.div>

          <motion.button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isLoading}
            {...FADE_UP(0.6)}
          >
            {isLoading ? 'Creating Account...' : 'Get Started'} <ArrowRight size={16} />
          </motion.button>
        </form>

        <motion.div className={styles.footer} {...FADE_UP(0.7)}>
          Already have an account? 
          <Link to="/signin" className={styles.link}>
            Sign in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}