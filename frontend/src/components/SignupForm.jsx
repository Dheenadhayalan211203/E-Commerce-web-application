import React, { useState } from 'react';
import authService from '../api/auth';
import { useNavigate } from 'react-router-dom';

function SignupForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const validatePhone = (number) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  };

  const handleInitialSignup = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (!validatePhone(phone)) {
      setMessage('Invalid phone number. It should be 10 digits.');
      return;
    }

    try {
      const response = await authService.signupRequestOtp({
        username,
        email,
        phone,
        password
      });
      setMessage(response.message);
      setOtpSent(true);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong during signup request.');
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await authService.verifyOtp(email, otp);
      setMessage('Signup successful! Redirecting to home...');
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong during OTP verification.');
    }
  };

  const handleResendOtp = async () => {
    setMessage('Resending OTP...');
    try {
      const response = await authService.resendOtp(email);
      setMessage(response.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Sign Up</h2>
      {message && <p style={styles.message}>{message}</p>}

      {!otpSent ? (
        <form onSubmit={handleInitialSignup} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="phone" style={styles.label}>Phone:</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={styles.input}
              pattern="[0-9]{10}"
              maxLength="10"
              placeholder="10-digit phone number"
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>Send OTP & Sign Up</button>
        </form>
      ) : (
        <form onSubmit={handleOtpVerification} style={styles.form}>
          <p style={styles.infoText}>An OTP has been sent to your email: <strong>{email}</strong></p>
          <div style={styles.formGroup}>
            <label htmlFor="otp" style={styles.label}>Enter OTP:</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={styles.input}
              maxLength="6"
            />
          </div>
          <button type="submit" style={styles.button}>Verify OTP & Complete Signup</button>
          <button
            type="button"
            onClick={handleResendOtp}
            style={{ ...styles.button, backgroundColor: '#6c757d', marginTop: '10px' }}
          >
            Resend OTP
          </button>
        </form>
      )}

      <p style={styles.linkText}>
        Already have an account? <a href="/login" style={styles.link}>Login here</a>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
  message: {
    textAlign: 'center',
    color: 'red',
    marginBottom: '15px',
  },
  infoText: {
    textAlign: 'center',
    color: 'green',
    marginBottom: '15px',
  },
  linkText: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default SignupForm;
