import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Standard Phone Number + Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_no: phoneNo, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Token සහ User details Browser එකේ save කිරීම
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (onLoginSuccess) onLoginSuccess(data.user);

        alert('Login Successful!');
        navigate('/dashboard'); // Login වූ පසු යන Page එක
      } else {
        setErrorMsg(data.message || 'Login failed!');
      }
    } catch (err) {
      console.error('Login Fetch Error:', err);
      setErrorMsg('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back 👋</h2>
        <p style={styles.subtitle}>Log in to access your Rent Hub account</p>

        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              placeholder="07XXXXXXXX"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.loginBtn}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.divider}>
          <span>OR</span>
        </div>

        {/* Google Connect Button */}
        <button
          type="button"
          style={styles.googleBtn}
          onClick={() => alert("Google Client ID එක App.js එකට configure කර Google OAuth පහසුවෙන් සම්බන්ධ කළ හැක.")}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            style={{ width: '20px', marginRight: '10px' }}
          />
          Connect with Google
        </button>

        <div style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register Now</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f6f9' },
  card: { width: '100%', maxWidth: '400px', padding: '35px 30px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', backgroundColor: '#ffffff', textAlign: 'center' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '5px' },
  subtitle: { color: '#666', fontSize: '14px', marginBottom: '20px' },
  errorAlert: { backgroundColor: '#ffe6e6', color: '#d9534f', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#333' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' },
  loginBtn: { padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' },
  divider: { display: 'flex', alignItems: 'center', margin: '20px 0', color: '#888', fontSize: '12px' },
  googleBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  footerText: { marginTop: '20px', fontSize: '14px', color: '#555' },
  link: { color: '#007bff', fontWeight: 'bold', textDecoration: 'none' }
};