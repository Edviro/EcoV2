// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaWarehouse } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useApp();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones básicas
    if (!formData.username || !formData.password) {
      setError('Por favor, completa todos los campos');
      setLoading(false);
      return;
    }

    try {
      const success = login(formData.username, formData.password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demoCredentials = {
      admin: { username: 'admin', password: 'admin' },
      operator: { username: 'operator', password: 'operator' },
      viewer: { username: 'viewer', password: 'viewer' }
    };
    
    setFormData(demoCredentials[role]);
    setError('');
  };

  return (
    <div className="login-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="login-card">
              <Card.Body className="p-4">
                {/* Logo y título */}
                <div className="text-center mb-4">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      background: 'var(--gradient-primary)',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    <FaWarehouse />
                  </div>
                  <h3 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                    EconoArena
                  </h3>
                  <p className="text-muted mb-0">
                    Sistema de Gestión de Inventario
                  </p>
                </div>

                {/* Credenciales demo */}
                <Alert variant="info" className="mb-4">
                  <small>
                    <strong>🔥 Demo - Credenciales de prueba:</strong><br/>
                    <div className="d-flex gap-2 mt-2 flex-wrap">
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => fillDemo('admin')}
                      >
                        Admin
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-success"
                        onClick={() => fillDemo('operator')}
                      >
                        Operador
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-warning"
                        onClick={() => fillDemo('viewer')}
                      >
                        Viewer
                      </Button>
                    </div>
                  </small>
                </Alert>

                {/* Formulario */}
                <Form onSubmit={handleSubmit}>
                  {error && (
                    <Alert variant="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Usuario</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Ingrese su usuario"
                        style={{ paddingLeft: '2.5rem' }}
                        disabled={loading}
                      />
                      <FaUser 
                        className="position-absolute"
                        style={{ 
                          left: '0.75rem', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)'
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Contraseña</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Ingrese su contraseña"
                        style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                        disabled={loading}
                      />
                      <FaLock 
                        className="position-absolute"
                        style={{ 
                          left: '0.75rem', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)'
                        }}
                      />
                      <Button
                        variant="link"
                        className="position-absolute p-0"
                        style={{ 
                          right: '0.75rem', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)',
                          border: 'none',
                          background: 'none'
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
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
                        <span className="spinner-border spinner-border-sm me-2" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="me-2" />
                        Iniciar Sesión
                      </>
                    )}
                  </Button>
                </Form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <small style={{ color: 'var(--text-muted)' }}>
                    © 2024 EconoArena - Versión Demo
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;