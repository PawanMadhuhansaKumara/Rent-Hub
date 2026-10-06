import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log('Register Data:', formData);
    // ඊළඟ පියවරේදී Backend/Firebase එකට Register data යැවීම මෙතැනින් සිදු කරයි
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Rent Hub - Register 📝</h2>
        <p style={styles.subtitle}>Create a new account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Ex : Pawan Madhuhansa"
              value={formData.fullName}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="07X XXX XXXX"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            Register Now
          </button>
        </form>

        <div style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: '20px' },
  card: { width: '100%', maxWidth: '400px', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', backgroundColor: '#ffffff', textAlign: 'center' },
  title: { marginBottom: '6px', fontSize: '22px', color: '#1a1a1a' },
  subtitle: { marginBottom: '20px', color: '#666', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { textAlign: 'left' },
  label: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#333' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' },
  submitBtn: { padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  footerText: { marginTop: '20px', fontSize: '14px', color: '#555' },
  link: { color: '#007bff', fontWeight: 'bold', textDecoration: 'none' }
};