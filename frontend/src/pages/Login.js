import React, { useState } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

// login
const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // fungsi untuk menangani perubahan input form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData);
      toast.success('Login berhasil!');
    } catch (error) {
      setError(error.response?.data?.error || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container>
        <div className="login-card mx-auto">
          <div className="login-header">
            <div className="mb-3">
              <i className="fas fa-building fa-3x"></i>
            </div>
            <h4 className="mb-0">Sistem Peminjaman</h4>
            <p className="mb-0">Telkom Bojonegoro</p>
          </div>
          
          <div className="login-body">
            {error && (
              <Alert variant="danger" className="mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="fas fa-user me-2"></i>
                  Username atau NIK
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Masukkan username atau NIK"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>
                  <i className="fas fa-lock me-2"></i>
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login
                  </>
                )}
              </Button>
            </Form>

            <hr className="my-4" />
            
            {/* <div className="text-center"> 
              <small className="text-muted">
                <strong>Demo Credentials:</strong><br />
                Admin: admin@telkom.co.id / password123<br />
                Satpam: satpam1@telkom.co.id / password123
              </small>
            </div>*/}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Login;
