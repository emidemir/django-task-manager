import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { FADE_UP } from '../../lib/constants';
import styles from './Auth.module.css';

export default function SignUp({ onNavigate }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add registration logic here
    onNavigate('dashboard');
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
          <motion.div className={styles.inputGroup} {...FADE_UP(0.3)}>
            <label className={styles.label} htmlFor="name">Full Name</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input 
                type="text" 
                id="name"
                className={styles.input} 
                placeholder="Alex Carter" 
                required 
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
                className={styles.input} 
                placeholder="alex@example.com" 
                required 
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
                className={styles.input} 
                placeholder="Create a strong password" 
                required 
              />
            </div>
          </motion.div>

          <motion.button 
            type="submit" 
            className={styles.submitBtn}
            {...FADE_UP(0.6)}
          >
            Get Started <ArrowRight size={16} />
          </motion.button>
        </form>

        <motion.div className={styles.footer} {...FADE_UP(0.7)}>
          Already have an account? 
          <button className={styles.link} onClick={() => onNavigate('signin')}>
            Sign in
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}