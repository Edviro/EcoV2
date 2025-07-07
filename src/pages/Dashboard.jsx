// src/pages/Dashboard.jsx
import React from 'react';
import { Row, Col, Card, Button, Alert, Badge, Table } from 'react-bootstrap';
import { 
  FaPlus, 
  FaMinus, 
  FaChartBar, 
  FaBoxes, 
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaEye
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const { 
    metrics, 
    formatCurrency, 
    settings, 
    movements, 
    products, 
    hasPermission 
  } = useApp();
  const navigate = useNavigate();

  // Obtener movimientos recientes (últimos 5)
  const recentMovements = movements
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Obtener productos con stock bajo
  const lowStockProducts = metrics.lowStockProducts;

  return (
    <div>
      {/* Tarjetas de métricas principales */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value text-primary">
                  {metrics.totalProducts}
                </h2>
                <p className="metric-label">Total Productos</p>
              </div>
              <div 
                className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px' }}
              >
                <FaBoxes className="text-primary" size={20} />
              </div>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value text-success">
                  {metrics.totalStock.toLocaleString()}
                </h2>
                <p className="metric-label">Stock Total</p>
              </div>
              <div 
                className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px' }}
              >
                <FaChartBar className="text-success" size={20} />
              </div>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value text-danger">
                  {lowStockProducts.length}
                </h2>
                <p className="metric-label">Productos Bajo Stock</p>
              </div>
              <div 
                className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px' }}
              >
                <FaExclamationTriangle className="text-danger" size={20} />
              </div>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value text-info">
                  {formatCurrency(metrics.totalValue)}
                </h2>
                <p className="metric-label">Valor de Inventario</p>
              </div>
              <div 
                className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px' }}
              >
                <span className="text-info fw-bold">{settings.currencySymbol}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Acciones rápidas */}
      {hasPermission('inventory') && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Acciones Rápidas</h5>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <Button
                    variant="success"
                    className="d-flex align-items-center gap-2"
                    onClick={() => navigate('/movements')}
                  >
                    <FaPlus size={14} />
                    Entrada Rápida
                  </Button>
                  <Button
                    variant="warning"
                    className="d-flex align-items-center gap-2"
                    onClick={() => navigate('/movements')}
                  >
                    <FaMinus size={14} />
                    Salida Rápida
                  </Button>
                  <Button
                    variant="primary"
                    className="d-flex align-items-center gap-2"
                    onClick={() => navigate('/inventory')}
                  >
                    <FaBoxes size={14} />
                    Añadir Producto
                  </Button>
                  <Button
                    variant="info"
                    className="d-flex align-items-center gap-2"
                    onClick={() => navigate('/reports')}
                  >
                    <FaChartBar size={14} />
                    Generar Reporte
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Alertas de stock bajo */}
      {lowStockProducts.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning" className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <FaExclamationTriangle />
                <div>
                  <strong>Productos con Stock Bajo ({lowStockProducts.length})</strong>
                  <div className="mt-1">
                    {lowStockProducts.slice(0, 3).map(product => product.name).join(', ')}
                    {lowStockProducts.length > 3 && ` y ${lowStockProducts.length - 3} más...`}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline-warning" 
                size="sm"
                onClick={() => navigate('/inventory')}
              >
                <FaEye className="me-1" />
                Ver Todos
              </Button>
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        {/* Movimientos recientes */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Movimientos Recientes</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate('/movements')}
              >
                Ver Todos
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {recentMovements.length > 0 ? (
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Usuario</th>
                      <th>Referencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMovements.map((movement) => (
                      <tr key={movement.id}>
                        <td>
                          <small>
                            {format(new Date(movement.date), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </small>
                        </td>
                        <td>
                          <div className="fw-medium">{movement.product}</div>
                        </td>
                        <td>
                          <Badge 
                            bg={movement.type === 'entrada' ? 'success' : 'danger'}
                            className="d-flex align-items-center gap-1"
                            style={{ width: 'fit-content' }}
                          >
                            {movement.type === 'entrada' ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                            {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                          </Badge>
                        </td>
                        <td>
                          <span className={movement.type === 'entrada' ? 'text-success' : 'text-danger'}>
                            {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                          </span>
                        </td>
                        <td>{movement.user}</td>
                        <td>
                          <small className="text-muted">{movement.reference}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="p-4 text-center text-muted">
                  <FaChartBar size={32} className="mb-2 opacity-50" />
                  <p className="mb-0">No hay movimientos registrados</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Resumen de productos */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Stock por Categoría</h5>
            </Card.Header>
            <Card.Body>
              {Object.entries(
                products.reduce((acc, product) => {
                  if (!acc[product.category]) {
                    acc[product.category] = { count: 0, stock: 0 };
                  }
                  acc[product.category].count += 1;
                  acc[product.category].stock += product.stock;
                  return acc;
                }, {})
              ).map(([category, data]) => (
                <div key={category} className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-medium">{category}</div>
                    <small className="text-muted">{data.count} productos</small>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold">{data.stock.toLocaleString()}</div>
                    <small className="text-muted">unidades</small>
                  </div>
                </div>
              ))}
              
              {products.length === 0 && (
                <div className="text-center text-muted py-3">
                  <FaBoxes size={32} className="mb-2 opacity-50" />
                  <p className="mb-0">No hay productos registrados</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Métricas de hoy */}
          <Card className="mt-3">
            <Card.Header>
              <h5 className="mb-0">Actividad de Hoy</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Entradas:</span>
                <Badge bg="success">{metrics.todayEntries}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Salidas:</span>
                <Badge bg="danger">{metrics.todayExits}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Total movimientos:</span>
                <Badge bg="primary">{metrics.todayMovements.length}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;