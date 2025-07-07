// src/pages/Movements.jsx
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
  Tab
} from 'react-bootstrap';
import { 
  FaPlus, 
  FaSearch, 
  FaArrowUp, 
  FaArrowDown, 
  FaFilter,
  FaExchangeAlt,
  FaCalendarAlt,
  FaUser,
  FaFileAlt
} from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import { MOVEMENT_REASONS } from '../utils/mockData';
import Modal from '../components/Modal';
import MovementForm from '../components/MovementForm';
import QuickMovement from '../components/QuickMovement';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Movements = () => {
  const { 
    movements, 
    products, 
    addMovement, 
    user,
    hasPermission 
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [activeTab, setActiveTab] = useState('list');

  // Filtrar movimientos
  const filteredMovements = movements
    .filter(movement => {
      const matchesSearch = movement.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movement.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movement.user.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !typeFilter || movement.type === typeFilter;
      const matchesDate = !dateFilter || format(new Date(movement.date), 'yyyy-MM-dd') === dateFilter;
      
      return matchesSearch && matchesType && matchesDate;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Estadísticas
  const todayMovements = movements.filter(m => {
    const today = new Date().toDateString();
    const movementDate = new Date(m.date).toDateString();
    return today === movementDate;
  });

  const stats = {
    totalMovements: movements.length,
    todayMovements: todayMovements.length,
    todayEntries: todayMovements.filter(m => m.type === 'entrada').length,
    todayExits: todayMovements.filter(m => m.type === 'salida').length,
    totalEntries: movements.filter(m => m.type === 'entrada').length,
    totalExits: movements.filter(m => m.type === 'salida').length
  };

  const handleNewMovement = () => {
    setShowModal(true);
  };

  const handleSubmitMovement = (movementData) => {
    try {
      addMovement({
        ...movementData,
        user: user?.name || 'Usuario'
      });
      toast.success(`${movementData.type === 'entrada' ? 'Entrada' : 'Salida'} registrada correctamente`);
      setShowModal(false);
    } catch (error) {
      toast.error('Error al registrar el movimiento');
    }
  };

  const handleQuickMovement = (movementData) => {
    try {
      addMovement({
        ...movementData,
        user: user?.name || 'Usuario'
      });
      toast.success(`${movementData.type === 'entrada' ? 'Entrada' : 'Salida'} rápida registrada`);
    } catch (error) {
      toast.error('Error al registrar el movimiento');
    }
  };

  const getMovementIcon = (type) => {
    return type === 'entrada' ? 
      <FaArrowUp className="text-success" /> : 
      <FaArrowDown className="text-danger" />;
  };

  const getMovementBadge = (type) => {
    return type === 'entrada' ? 
      <Badge bg="success">Entrada</Badge> : 
      <Badge bg="danger">Salida</Badge>;
  };

  const canAddMovement = hasPermission('movements');

  return (
    <div>
      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value text-primary">
                  {stats.totalMovements}
                </h2>
                <p className="metric-label">Total Movimientos</p>
              </div>
              <div 
                className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px' }}
              >
                <FaExchangeAlt className="text-primary" size={20} />
              </div>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value text-info">
                  {stats.todayMovements}
                </h2>
                <p className="metric-label">Movimientos Hoy</p>
              </div>
              <div 
                className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px' }}
              >
                <FaCalendarAlt className="text-info" size={20} />
              </div>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value text-success">
                  {stats.todayEntries}
                </h2>
                <p className="metric-label">Entradas Hoy</p>
              </div>
              <div 
                className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px' }}
              >
                <FaArrowUp className="text-success" size={20} />
              </div>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value text-danger">
                  {stats.todayExits}
                </h2>
                <p className="metric-label">Salidas Hoy</p>
              </div>
              <div 
                className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px' }}
              >
                <FaArrowDown className="text-danger" size={20} />
              </div>
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
            <Tab eventKey="list" title={
              <span className="d-flex align-items-center gap-2">
                <FaFileAlt />
                Historial de Movimientos
              </span>
            } />
            {canAddMovement && (
              <Tab eventKey="quick" title={
                <span className="d-flex align-items-center gap-2">
                  <FaExchangeAlt />
                  Movimiento Rápido
                </span>
              } />
            )}
          </Tabs>
        </Card.Header>

        <Card.Body className="p-0">
          {activeTab === 'list' && (
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
                          placeholder="Buscar movimientos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>

                      {/* Filtro por tipo */}
                      <Form.Select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{ maxWidth: '150px' }}
                      >
                        <option value="">Todos los tipos</option>
                        <option value="entrada">Entradas</option>
                        <option value="salida">Salidas</option>
                      </Form.Select>

                      {/* Filtro por fecha */}
                      <Form.Control
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{ maxWidth: '200px' }}
                      />
                    </div>
                  </Col>
                  
                  <Col md={6} lg={4} className="text-end">
                    {canAddMovement && (
                      <Button 
                        variant="primary" 
                        onClick={handleNewMovement}
                        className="d-flex align-items-center gap-2 ms-auto"
                      >
                        <FaPlus size={14} />
                        Nuevo Movimiento
                      </Button>
                    )}
                  </Col>
                </Row>
              </div>

              {/* Tabla de movimientos */}
              {filteredMovements.length > 0 ? (
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th className="text-center">Tipo</th>
                        <th className="text-center">Cantidad</th>
                        <th>Motivo</th>
                        <th>Usuario</th>
                        <th>Referencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMovements.map((movement) => (
                        <tr key={movement.id}>
                          <td>
                            <div>
                              <div className="fw-medium">
                                {format(new Date(movement.date), 'dd/MM/yyyy', { locale: es })}
                              </div>
                              <small className="text-muted">
                                {format(new Date(movement.date), 'HH:mm', { locale: es })}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div className="fw-medium">{movement.product}</div>
                          </td>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              {getMovementIcon(movement.type)}
                              {getMovementBadge(movement.type)}
                            </div>
                          </td>
                          <td className="text-center">
                            <span className={`fw-bold ${
                              movement.type === 'entrada' ? 'text-success' : 'text-danger'
                            }`}>
                              {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                            </span>
                          </td>
                          <td>
                            <small>{movement.reason}</small>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <FaUser size={12} className="text-muted" />
                              <small>{movement.user}</small>
                            </div>
                          </td>
                          <td>
                            <code className="bg-secondary bg-opacity-10 px-2 py-1 rounded small">
                              {movement.reference}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <FaExchangeAlt size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No se encontraron movimientos</h5>
                  <p className="text-muted mb-3">
                    {searchTerm || typeFilter || dateFilter 
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Aún no hay movimientos registrados'
                    }
                  </p>
                  {canAddMovement && !searchTerm && !typeFilter && !dateFilter && (
                    <Button variant="primary" onClick={handleNewMovement}>
                      <FaPlus className="me-2" />
                      Registrar Primer Movimiento
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'quick' && canAddMovement && (
            <div className="p-4">
              <QuickMovement 
                products={products}
                onSubmit={handleQuickMovement}
              />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para nuevo movimiento */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Registrar Nuevo Movimiento"
        size="lg"
      >
        <MovementForm
          products={products}
          onSubmit={handleSubmitMovement}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Movements;