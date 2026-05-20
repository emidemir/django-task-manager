import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { FADE_UP } from '../../lib/constants';
import styles from './Auth.module.css';

// 1. Import your custom hook
import { useAuth } from '../../contexts/AuthContext';

export default function SignIn() {
  // 2. Set up local state for the form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 3. Grab the login function from your context
  const { login } = useAuth();
  
  // 4. Use React Router for navigation
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here is where you would normally call your backend API.
    // For now, we'll just simulate a successful login and pass the user data to Context.
    const userData = { email: email, name: 'Alex' };
    
    // 5. Fire the login function from AuthContext
    login(userData);
    
    // 6. Redirect the user to the protected dashboard
    navigate('/dashboard');
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
              />
            </div>
          </motion.div>

          <motion.button 
            type="submit" 
            className={styles.submitBtn}
            {...FADE_UP(0.5)}
          >
            Sign In <ArrowRight size={16} />
          </motion.button>
        </form>

        <motion.div className={styles.footer} {...FADE_UP(0.6)}>
          Don't have an account? 
          {/* Replaced onNavigate prop with React Router's Link */}
          <Link to="/signup" className={styles.link}>
            Sign up
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}