// src/components/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaSave, FaTimes, FaUser, FaEnvelope, FaLock, FaUserShield } from 'react-icons/fa';

const UserForm = ({ user, onSubmit, onCancel, currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        password: '', // No mostrar password existente
        confirmPassword: '',
        role: user.role || 'viewer',
        status: user.status || 'active'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    // Validación de contraseña para usuarios nuevos
    if (!user && !formData.password) {
      newErrors.password = 'La contraseña es requerida para usuarios nuevos';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validación de confirmación de contraseña
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar que no se pueda cambiar el rol propio a algo menor
    if (user && user.id === currentUser?.id && formData.role !== 'admin') {
      newErrors.role = 'No puedes cambiar tu propio rol de administrador';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      name: formData.name.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      status: formData.status
    };

    // Solo incluir password si se está creando usuario o se cambió
    if (!user || formData.password) {
      userData.password = formData.password;
    }

    onSubmit(userData);
  };

  const roleDescriptions = {
    admin: 'Acceso completo al sistema, incluyendo gestión de usuarios y configuración',
    operator: 'Gestión de inventario y movimientos, sin acceso a seguridad ni configuración',
    viewer: 'Solo consulta de reportes y análisis, sin permisos de modificación'
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Información personal */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre Completo <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de Usuario <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ej: juan.perez"
              isInvalid={!!errors.username}
              disabled={user ? true : false} // No permitir cambiar username
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
            {user && (
              <Form.Text className="text-muted">
                El nombre de usuario no se puede modificar
              </Form.Text>
            )}
          </Form.Group>
        </Col>
      </Row>

      {/* Email */}
      <Form.Group className="mb-3">
        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="juan.perez@empresa.com"
          isInvalid={!!errors.email}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Contraseña */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Contraseña {!user && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={user ? "Dejar vacío para mantener actual" : "Mínimo 6 caracteres"}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
            {user && (
              <Form.Text className="text-muted">
                Dejar vacío para mantener la contraseña actual
              </Form.Text>
            )}
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Confirmar Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repetir contraseña"
              isInvalid={!!errors.confirmPassword}
              disabled={!formData.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Rol y Estado */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Rol del Usuario</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              isInvalid={!!errors.role}
              disabled={user && user.id === currentUser?.id} // No permitir cambiar propio rol
            >
              <option value="viewer">Visualizador</option>
              <option value="operator">Operador</option>
              <option value="admin">Administrador</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.role}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={user && user.id === currentUser?.id} // No permitir cambiar propio estado
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Los usuarios inactivos no pueden iniciar sesión
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Advertencias */}
      {user && user.id === currentUser?.id && (
        <Alert variant="warning" className="mb-3">
          <strong>⚠️ Editando tu propio usuario:</strong>
          <ul className="mb-0 mt-2">
            <li>No puedes cambiar tu rol de administrador</li>
            <li>No puedes desactivar tu propia cuenta</li>
            <li>No puedes cambiar tu nombre de usuario</li>
          </ul>
        </Alert>
      )}

      {formData.role === 'admin' && !user && (
        <Alert variant="info" className="mb-3">
          <strong>👑 Creando Administrador:</strong> Este usuario tendrá acceso completo al sistema, incluyendo la gestión de otros usuarios y configuración del sistema.
        </Alert>
      )}

      {/* Vista previa de permisos */}
      <div className="bg-light p-3 rounded mb-4">
        <h6 className="mb-2">Vista Previa de Permisos</h6>
        <Row>
          <Col md={6}>
            <strong>Módulos con acceso:</strong>
            <ul className="mt-2 mb-0 small">
              <li>Dashboard</li>
              {(formData.role === 'admin' || formData.role === 'operator') && <li>Inventario (CRUD)</li>}
              {(formData.role === 'admin' || formData.role === 'operator') && <li>Movimientos (CRUD)</li>}
              <li>Reportes</li>
              <li>Análisis</li>
              {formData.role === 'admin' && <li><strong>Seguridad (CRUD)</strong></li>}
              {formData.role === 'admin' && <li><strong>Configuración</strong></li>}
            </ul>
          </Col>
          <Col md={6}>
            <strong>Capacidades:</strong>
            <ul className="mt-2 mb-0 small">
              {formData.role === 'admin' && <li>Gestionar usuarios</li>}
              {formData.role === 'admin' && <li>Configurar sistema</li>}
              {(formData.role === 'admin' || formData.role === 'operator') && <li>Crear/editar productos</li>}
              {(formData.role === 'admin' || formData.role === 'operator') && <li>Registrar movimientos</li>}
              <li>Ver reportes y análisis</li>
              {formData.role === 'viewer' && <li className="text-muted">Solo lectura</li>}
            </ul>
          </Col>
        </Row>
      </div>

      {/* Botones */}
      <div className="d-flex gap-2 justify-content-end">
        <Button variant="secondary" onClick={onCancel}>
          <FaTimes className="me-2" />
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          <FaSave className="me-2" />
          {user ? 'Actualizar' : 'Crear'} Usuario
        </Button>
      </div>
    </Form>
  );
};

export default UserForm;