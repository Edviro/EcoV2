// src/pages/Security.jsx
import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Badge, 
  Form, 
  InputGroup,
  Tabs,
  Tab,
  Alert
} from 'react-bootstrap';
import { 
  FaUsers, 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaUserShield,
  FaUserCheck,
  FaUserTimes,
  FaKey,
  FaHistory
} from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Security = () => {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    user: currentUser,
    movements
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Estadísticas de usuarios
  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    admins: users.filter(u => u.role === 'admin').length,
    operators: users.filter(u => u.role === 'operator').length,
    viewers: users.filter(u => u.role === 'viewer').length
  };

  // Actividad reciente de usuarios
  const userActivity = movements
    .reduce((acc, movement) => {
      if (!acc[movement.user]) {
        acc[movement.user] = {
          user: movement.user,
          lastActivity: movement.date,
          totalMovements: 0,
          entries: 0,
          exits: 0
        };
      }
      
      acc[movement.user].totalMovements += 1;
      if (movement.type === 'entrada') {
        acc[movement.user].entries += 1;
      } else {
        acc[movement.user].exits += 1;
      }
      
      // Actualizar última actividad si es más reciente
      if (new Date(movement.date) > new Date(acc[movement.user].lastActivity)) {
        acc[movement.user].lastActivity = movement.date;
      }
      
      return acc;
    }, {});

  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = (user) => {
    if (user.id === currentUser?.id) {
      toast.error('No puedes eliminar tu propio usuario');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar al usuario "${user.name}"?`)) {
      deleteUser(user.id);
      toast.success('Usuario eliminado correctamente');
    }
  };

  const handleToggleStatus = (user) => {
    if (user.id === currentUser?.id) {
      toast.error('No puedes cambiar el estado de tu propio usuario');
      return;
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateUser(user.id, { status: newStatus });
    toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`);
  };

  const handleSubmitUser = (userData) => {
    try {
      if (editingUser) {
        updateUser(editingUser.id, userData);
        toast.success('Usuario actualizado correctamente');
      } else {
        addUser(userData);
        toast.success('Usuario creado correctamente');
      }
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      toast.error('Error al guardar el usuario');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'danger', text: 'Administrador', icon: FaUserShield },
      operator: { bg: 'primary', text: 'Operador', icon: FaUserCheck },
      viewer: { bg: 'secondary', text: 'Visualizador', icon: FaEye }
    };
    
    const config = roleConfig[role] || roleConfig.viewer;
    const IconComponent = config.icon;
    
    return (
      <Badge bg={config.bg} className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
        <IconComponent size={12} />
        {config.text}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 
      <Badge bg="success">Activo</Badge> : 
      <Badge bg="warning">Inactivo</Badge>;
  };

  return (
    <div>
      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={6} lg={2} className="mb-3">
          <Card className="metric-card">
            <div className="text-center">
              <h3 className="text-primary">{userStats.total}</h3>
              <small>Total Usuarios</small>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={2} className="mb-3">
          <Card className="metric-card">
            <div className="text-center">
              <h3 className="text-success">{userStats.active}</h3>
              <small>Activos</small>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={2} className="mb-3">
          <Card className="metric-card">
            <div className="text-center">
              <h3 className="text-warning">{userStats.inactive}</h3>
              <small>Inactivos</small>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={2} className="mb-3">
          <Card className="metric-card">
            <div className="text-center">
              <h3 className="text-danger">{userStats.admins}</h3>
              <small>Admins</small>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={2} className="mb-3">
          <Card className="metric-card">
            <div className="text-center">
              <h3 className="text-primary">{userStats.operators}</h3>
              <small>Operadores</small>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={2} className="mb-3">
          <Card className="metric-card">
            <div className="text-center">
              <h3 className="text-secondary">{userStats.viewers}</h3>
              <small>Visualizadores</small>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Pestañas */}
      <Card>
        <Card.Header>
          <Tabs 
            activeKey={activeTab} 
            onSelect={setActiveTab}
            className="border-0"
          >
            <Tab eventKey="users" title={
              <span className="d-flex align-items-center gap-2">
                <FaUsers />
                Gestión de Usuarios
              </span>
            } />
            <Tab eventKey="activity" title={
              <span className="d-flex align-items-center gap-2">
                <FaHistory />
                Actividad de Usuarios
              </span>
            } />
            <Tab eventKey="permissions" title={
              <span className="d-flex align-items-center gap-2">
                <FaKey />
                Permisos y Roles
              </span>
            } />
          </Tabs>
        </Card.Header>

        <Card.Body className="p-0">
          {activeTab === 'users' && (
            <>
              {/* Controles de filtro */}
              <div className="p-3 border-bottom">
                <Row className="align-items-center">
                  <Col md={6} lg={8}>
                    <div className="d-flex gap-3 align-items-center flex-wrap">
                      {/* Búsqueda */}
                      <InputGroup style={{ maxWidth: '300px' }}>
                        <InputGroup.Text>
                          <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                          placeholder="Buscar usuarios..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>

                      {/* Filtro por rol */}
                      <Form.Select 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{ maxWidth: '150px' }}
                      >
                        <option value="">Todos los roles</option>
                        <option value="admin">Administrador</option>
                        <option value="operator">Operador</option>
                        <option value="viewer">Visualizador</option>
                      </Form.Select>

                      {/* Filtro por estado */}
                      <Form.Select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ maxWidth: '150px' }}
                      >
                        <option value="">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                      </Form.Select>
                    </div>
                  </Col>
                  
                  <Col md={6} lg={4} className="text-end">
                    <Button 
                      variant="primary" 
                      onClick={handleAddUser}
                      className="d-flex align-items-center gap-2 ms-auto"
                    >
                      <FaPlus size={14} />
                      Nuevo Usuario
                    </Button>
                  </Col>
                </Row>
              </div>

              {/* Tabla de usuarios */}
              {filteredUsers.length > 0 ? (
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th className="text-center">Rol</th>
                        <th className="text-center">Estado</th>
                        <th>Último Acceso</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-medium">{user.name}</div>
                                <small className="text-muted">@{user.username}</small>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td className="text-center">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="text-center">
                            {getStatusBadge(user.status)}
                          </td>
                          <td>
                            {user.lastAccess ? (
                              <div>
                                <div>{format(new Date(user.lastAccess), 'dd/MM/yyyy', { locale: es })}</div>
                                <small className="text-muted">
                                  {format(new Date(user.lastAccess), 'HH:mm', { locale: es })}
                                </small>
                              </div>
                            ) : (
                              <small className="text-muted">Nunca</small>
                            )}
                          </td>
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                title="Editar usuario"
                              >
                                <FaEdit size={12} />
                              </Button>
                              
                              <Button
                                variant={user.status === 'active' ? 'outline-warning' : 'outline-success'}
                                size="sm"
                                onClick={() => handleToggleStatus(user)}
                                disabled={user.id === currentUser?.id}
                                title={user.status === 'active' ? 'Desactivar' : 'Activar'}
                              >
                                {user.status === 'active' ? <FaUserTimes size={12} /> : <FaUserCheck size={12} />}
                              </Button>
                              
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                disabled={user.id === currentUser?.id}
                                title="Eliminar usuario"
                              >
                                <FaTrash size={12} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <FaUsers size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No se encontraron usuarios</h5>
                  <p className="text-muted mb-3">
                    {searchTerm || roleFilter || statusFilter 
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Comienza agregando usuarios al sistema'
                    }
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'activity' && (
            <div className="p-4">
              <h6 className="mb-3">Actividad Reciente de Usuarios</h6>
              {Object.keys(userActivity).length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th className="text-center">Total Movimientos</th>
                      <th className="text-center">Entradas</th>
                      <th className="text-center">Salidas</th>
                      <th>Última Actividad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(userActivity)
                      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
                      .map((activity, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-medium">{activity.user}</div>
                        </td>
                        <td className="text-center">
                          <Badge bg="primary">{activity.totalMovements}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="success">{activity.entries}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="danger">{activity.exits}</Badge>
                        </td>
                        <td>
                          {format(new Date(activity.lastActivity), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  No hay actividad registrada de usuarios.
                </Alert>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="p-4">
              <h6 className="mb-3">Roles y Permisos del Sistema</h6>
              
              <Row>
                <Col md={4} className="mb-4">
                  <Card className="border-danger">
                    <Card.Header className="bg-danger text-white">
                      <h6 className="mb-0 d-flex align-items-center gap-2">
                        <FaUserShield />
                        Administrador
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <p className="small mb-3">Acceso completo al sistema</p>
                      <ul className="small mb-0">
                        <li>Dashboard</li>
                        <li>Inventario (CRUD)</li>
                        <li>Movimientos (CRUD)</li>
                        <li>Reportes</li>
                        <li>Análisis</li>
                        <li><strong>Seguridad (CRUD)</strong></li>
                        <li><strong>Configuración</strong></li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-4">
                  <Card className="border-primary">
                    <Card.Header className="bg-primary text-white">
                      <h6 className="mb-0 d-flex align-items-center gap-2">
                        <FaUserCheck />
                        Operador
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <p className="small mb-3">Gestión operativa del inventario</p>
                      <ul className="small mb-0">
                        <li>Dashboard</li>
                        <li>Inventario (CRUD)</li>
                        <li>Movimientos (CRUD)</li>
                        <li>Reportes</li>
                        <li>Análisis</li>
                        <li className="text-muted">Sin acceso a Seguridad</li>
                        <li className="text-muted">Sin acceso a Configuración</li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-4">
                  <Card className="border-secondary">
                    <Card.Header className="bg-secondary text-white">
                      <h6 className="mb-0 d-flex align-items-center gap-2">
                        <FaEye />
                        Visualizador
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <p className="small mb-3">Solo lectura y consultas</p>
                      <ul className="small mb-0">
                        <li>Dashboard (solo lectura)</li>
                        <li className="text-muted">Sin acceso a Inventario</li>
                        <li className="text-muted">Sin acceso a Movimientos</li>
                        <li>Reportes</li>
                        <li>Análisis</li>
                        <li className="text-muted">Sin acceso a Seguridad</li>
                        <li className="text-muted">Sin acceso a Configuración</li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Alert variant="warning">
                <strong>⚠️ Importante:</strong> Solo los usuarios con rol de Administrador pueden acceder a este módulo de Seguridad y gestionar otros usuarios.
              </Alert>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para agregar/editar usuario */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="lg"
      >
        <UserForm
          user={editingUser}
          onSubmit={handleSubmitUser}
          onCancel={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          currentUser={currentUser}
        />
      </Modal>
    </div>
  );
};

export default Security;