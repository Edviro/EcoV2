// src/pages/Reports.jsx
import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Table,
  Badge,
  Alert
} from 'react-bootstrap';
import { 
  FaFileAlt, 
  FaDownload, 
  FaEye, 
  FaChartBar,
  FaBoxes,
  FaExchangeAlt,
  FaShoppingCart,
  FaExclamationTriangle,
  FaGem,
  FaCalendarAlt,
  FaFilter
} from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Reports = () => {
  const { 
    products, 
    movements, 
    formatCurrency, 
    settings 
  } = useApp();

  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [generatedReport, setGeneratedReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    {
      id: 'inventory',
      name: 'Reporte de Inventario',
      description: 'Estado actual del inventario, productos por categoría y alertas de stock',
      icon: FaBoxes,
      color: 'primary'
    },
    {
      id: 'movements',
      name: 'Reporte de Movimientos',
      description: 'Entradas y salidas de productos en el período seleccionado',
      icon: FaExchangeAlt,
      color: 'info'
    },
    {
      id: 'sales',
      name: 'Reporte de Ventas',
      description: 'Análisis de ventas, productos más vendidos y revenue',
      icon: FaShoppingCart,
      color: 'success'
    },
    {
      id: 'alerts',
      name: 'Reporte de Alertas',
      description: 'Productos con stock bajo y alertas de reabastecimiento',
      icon: FaExclamationTriangle,
      color: 'warning'
    },
    {
      id: 'valuation',
      name: 'Valorización de Inventario',
      description: 'Valor total del inventario y análisis financiero',
      icon: FaGem,
      color: 'secondary'
    }
  ];

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const setQuickDateRange = (days) => {
    const today = new Date();
    const from = format(subDays(today, days), 'yyyy-MM-dd');
    const to = format(today, 'yyyy-MM-dd');
    
    setDateRange({ from, to });
  };

  const generateReport = async () => {
    if (!selectedReport) {
      toast.error('Selecciona un tipo de reporte');
      return;
    }

    setLoading(true);
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reportData = generateReportData(selectedReport, dateRange);
      setGeneratedReport(reportData);
      toast.success('Reporte generado correctamente');
    } catch (error) {
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const generateReportData = (reportType, dateRange) => {
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    // Filtrar movimientos por fecha
    const filteredMovements = movements.filter(movement => {
      const movementDate = new Date(movement.date);
      return movementDate >= fromDate && movementDate <= toDate;
    });

    switch (reportType) {
      case 'inventory':
        return generateInventoryReport();
      case 'movements':
        return generateMovementsReport(filteredMovements);
      case 'sales':
        return generateSalesReport(filteredMovements);
      case 'alerts':
        return generateAlertsReport();
      case 'valuation':
        return generateValuationReport();
      default:
        return null;
    }
  };

  const generateInventoryReport = () => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    const lowStockProducts = products.filter(p => p.stock <= (p.minStock || settings.lowStockThreshold));
    
    const categorySummary = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = { count: 0, stock: 0, value: 0 };
      }
      acc[product.category].count += 1;
      acc[product.category].stock += product.stock;
      acc[product.category].value += product.stock * product.price;
      return acc;
    }, {});

    return {
      type: 'inventory',
      title: 'Reporte de Inventario',
      summary: {
        totalProducts,
        totalStock,
        totalValue,
        lowStockCount: lowStockProducts.length
      },
      data: {
        products,
        lowStockProducts,
        categorySummary
      }
    };
  };

  const generateMovementsReport = (filteredMovements) => {
    const totalMovements = filteredMovements.length;
    const entries = filteredMovements.filter(m => m.type === 'entrada');
    const exits = filteredMovements.filter(m => m.type === 'salida');
    
    const totalEntriesQuantity = entries.reduce((sum, m) => sum + m.quantity, 0);
    const totalExitsQuantity = exits.reduce((sum, m) => sum + m.quantity, 0);

    return {
      type: 'movements',
      title: 'Reporte de Movimientos',
      summary: {
        totalMovements,
        totalEntries: entries.length,
        totalExits: exits.length,
        totalEntriesQuantity,
        totalExitsQuantity
      },
      data: {
        movements: filteredMovements,
        entries,
        exits
      }
    };
  };

  const generateSalesReport = (filteredMovements) => {
    const sales = filteredMovements.filter(m => 
      m.type === 'salida' && (m.reason === 'Venta' || m.reason === 'Salida rápida')
    );
    
    const totalSales = sales.length;
    const totalQuantitySold = sales.reduce((sum, m) => sum + m.quantity, 0);
    
    // Calcular revenue estimado
    const totalRevenue = sales.reduce((sum, sale) => {
      const product = products.find(p => p.id === sale.productId);
      return sum + (product ? product.price * sale.quantity : 0);
    }, 0);

    // Productos más vendidos
    const productSales = sales.reduce((acc, sale) => {
      if (!acc[sale.productId]) {
        acc[sale.productId] = { 
          product: sale.product, 
          quantity: 0, 
          sales: 0 
        };
      }
      acc[sale.productId].quantity += sale.quantity;
      acc[sale.productId].sales += 1;
      return acc;
    }, {});

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      type: 'sales',
      title: 'Reporte de Ventas',
      summary: {
        totalSales,
        totalQuantitySold,
        totalRevenue
      },
      data: {
        sales,
        topProducts
      }
    };
  };

  const generateAlertsReport = () => {
    const lowStockProducts = products.filter(p => 
      p.stock <= (p.minStock || settings.lowStockThreshold)
    );
    const outOfStockProducts = products.filter(p => p.stock === 0);
    const criticalProducts = products.filter(p => 
      p.stock > 0 && p.stock <= Math.floor((p.minStock || settings.lowStockThreshold) / 2)
    );

    return {
      type: 'alerts',
      title: 'Reporte de Alertas',
      summary: {
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        criticalCount: criticalProducts.length
      },
      data: {
        lowStockProducts,
        outOfStockProducts,
        criticalProducts
      }
    };
  };

  const generateValuationReport = () => {
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    const averageValue = totalValue / products.length || 0;
    
    const categoryValues = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = 0;
      }
      acc[product.category] += product.stock * product.price;
      return acc;
    }, {});

    const topValueProducts = products
      .map(p => ({ ...p, totalValue: p.stock * p.price }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    return {
      type: 'valuation',
      title: 'Valorización de Inventario',
      summary: {
        totalValue,
        averageValue,
        totalProducts: products.length
      },
      data: {
        categoryValues,
        topValueProducts
      }
    };
  };

  const exportReport = () => {
    if (!generatedReport) {
      toast.error('Genera un reporte primero');
      return;
    }

    // Simular exportación
    toast.success('Reporte exportado a Excel (simulado)');
  };

  const selectedReportType = reportTypes.find(r => r.id === selectedReport);

  return (
    <div>
      {/* Configuración del reporte */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <FaFileAlt />
            Configurar Reporte
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {/* Selección de tipo de reporte */}
            <Col md={6} className="mb-3">
              <Form.Label>Tipo de Reporte</Form.Label>
              <Form.Select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                <option value="">Seleccionar tipo de reporte...</option>
                {reportTypes.map(report => (
                  <option key={report.id} value={report.id}>
                    {report.name}
                  </option>
                ))}
              </Form.Select>
              {selectedReportType && (
                <Form.Text className="text-muted">
                  {selectedReportType.description}
                </Form.Text>
              )}
            </Col>

            {/* Rango de fechas */}
            <Col md={6} className="mb-3">
              <Form.Label>Rango de Fechas</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                  />
                </Col>
              </Row>
              <div className="d-flex gap-2 mt-2">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setQuickDateRange(7)}
                >
                  Últimos 7 días
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setQuickDateRange(30)}
                >
                  Últimos 30 días
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    setDateRange({
                      from: format(startOfMonth(today), 'yyyy-MM-dd'),
                      to: format(endOfMonth(today), 'yyyy-MM-dd')
                    });
                  }}
                >
                  Este mes
                </Button>
              </div>
            </Col>
          </Row>

          <div className="d-flex gap-2 justify-content-end mt-3">
            <Button
              variant="primary"
              onClick={generateReport}
              disabled={loading || !selectedReport}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Generando...
                </>
              ) : (
                <>
                  <FaChartBar className="me-2" />
                  Generar Reporte
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Tipos de reportes disponibles */}
      {!generatedReport && (
        <Row className="mb-4">
          {reportTypes.map(report => {
            const IconComponent = report.icon;
            return (
              <Col md={6} lg={4} key={report.id} className="mb-3">
                <Card 
                  className={`h-100 cursor-pointer ${selectedReport === report.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedReport(report.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="text-center">
                    <div 
                      className={`rounded-circle bg-${report.color} bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3`}
                      style={{ width: '60px', height: '60px' }}
                    >
                      <IconComponent className={`text-${report.color}`} size={24} />
                    </div>
                    <h6 className="mb-2">{report.name}</h6>
                    <p className="text-muted small mb-0">
                      {report.description}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Reporte generado */}
      {generatedReport && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{generatedReport.title}</h5>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-success" 
                size="sm"
                onClick={exportReport}
              >
                <FaDownload className="me-1" />
                Exportar Excel
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setGeneratedReport(null)}
              >
                Nuevo Reporte
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <ReportContent report={generatedReport} formatCurrency={formatCurrency} />
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

// Componente para mostrar el contenido del reporte
const ReportContent = ({ report, formatCurrency }) => {
  switch (report.type) {
    case 'inventory':
      return <InventoryReportContent report={report} formatCurrency={formatCurrency} />;
    case 'movements':
      return <MovementsReportContent report={report} />;
    case 'sales':
      return <SalesReportContent report={report} formatCurrency={formatCurrency} />;
    case 'alerts':
      return <AlertsReportContent report={report} />;
    case 'valuation':
      return <ValuationReportContent report={report} formatCurrency={formatCurrency} />;
    default:
      return <div>Tipo de reporte no soportado</div>;
  }
};

// Componentes específicos para cada tipo de reporte
const InventoryReportContent = ({ report, formatCurrency }) => (
  <div>
    {/* Resumen */}
    <Row className="mb-4">
      <Col md={3}>
        <div className="text-center">
          <h3 className="text-primary">{report.summary.totalProducts}</h3>
          <small>Total Productos</small>
        </div>
      </Col>
      <Col md={3}>
        <div className="text-center">
          <h3 className="text-success">{report.summary.totalStock.toLocaleString()}</h3>
          <small>Total Stock</small>
        </div>
      </Col>
      <Col md={3}>
        <div className="text-center">
          <h3 className="text-info">{formatCurrency(report.summary.totalValue)}</h3>
          <small>Valor Total</small>
        </div>
      </Col>
      <Col md={3}>
        <div className="text-center">
          <h3 className="text-warning">{report.summary.lowStockCount}</h3>
          <small>Stock Bajo</small>
        </div>
      </Col>
    </Row>

    {/* Resumen por categoría */}
    <h6>Resumen por Categoría</h6>
    <Table responsive className="mb-4">
      <thead>
        <tr>
          <th>Categoría</th>
          <th className="text-center">Productos</th>
          <th className="text-center">Stock Total</th>
          <th className="text-end">Valor Total</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(report.data.categorySummary).map(([category, data]) => (
          <tr key={category}>
            <td>{category}</td>
            <td className="text-center">{data.count}</td>
            <td className="text-center">{data.stock.toLocaleString()}</td>
            <td className="text-end">{formatCurrency(data.value)}</td>
          </tr>
        ))}
      </tbody>
    </Table>

    {/* Productos con stock bajo */}
    {report.data.lowStockProducts.length > 0 && (
      <>
        <h6 className="text-warning">Productos con Stock Bajo</h6>
        <Table responsive>
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th className="text-center">Stock</th>
              <th className="text-center">Stock Mínimo</th>
              <th className="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {report.data.lowStockProducts.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td><code>{product.sku}</code></td>
                <td className="text-center">{product.stock}</td>
                <td className="text-center">{product.minStock || 10}</td>
                <td className="text-center">
                  <Badge bg={product.stock === 0 ? 'danger' : 'warning'}>
                    {product.stock === 0 ? 'Sin Stock' : 'Stock Bajo'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    )}
  </div>
);

const MovementsReportContent = ({ report }) => (
  <div>
    {/* Resumen */}
    <Row className="mb-4">
      <Col md={3}>
        <div className="text-center">
          <h3 className="text-primary">{report.summary.totalMovements}</h3>
          <small>Total Movimientos</small>
        </div>
      </Col>
      <Col md={3}>
        <div className="text-center">
          <h3 className="text-success">{report.summary.totalEntries}</h3>
          <small>Entradas</small>
        </div>
      </Col>
      <Col md={3}>
        <div className="text-center">
          <h3 className="text-danger">{report.summary.totalExits}</h3>
          <small>Salidas</small>
        </div>
      </Col>
      <Col md={3}>
        <div className="text-center">
          <h3 className="text-info">
            {report.summary.totalEntriesQuantity - report.summary.totalExitsQuantity}
          </h3>
          <small>Balance</small>
        </div>
      </Col>
    </Row>

    {/* Tabla de movimientos */}
    <Table responsive>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Producto</th>
          <th className="text-center">Tipo</th>
          <th className="text-center">Cantidad</th>
          <th>Motivo</th>
          <th>Usuario</th>
        </tr>
      </thead>
      <tbody>
        {report.data.movements.slice(0, 50).map(movement => (
          <tr key={movement.id}>
            <td>{format(new Date(movement.date), 'dd/MM/yyyy HH:mm', { locale: es })}</td>
            <td>{movement.product}</td>
            <td className="text-center">
              <Badge bg={movement.type === 'entrada' ? 'success' : 'danger'}>
                {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
              </Badge>
            </td>
            <td className="text-center">{movement.quantity}</td>
            <td>{movement.reason}</td>
            <td>{movement.user}</td>
          </tr>
        ))}
      </tbody>
    </Table>
    
    {report.data.movements.length > 50 && (
      <Alert variant="info">
        Mostrando los primeros 50 movimientos de {report.data.movements.length} total.
      </Alert>
    )}
  </div>
);

const SalesReportContent = ({ report, formatCurrency }) => (
  <div>
    {/* Resumen */}
    <Row className="mb-4">
      <Col md={4}>
        <div className="text-center">
          <h3 className="text-primary">{report.summary.totalSales}</h3>
          <small>Total Ventas</small>
        </div>
      </Col>
      <Col md={4}>
        <div className="text-center">
          <h3 className="text-success">{report.summary.totalQuantitySold}</h3>
          <small>Unidades Vendidas</small>
        </div>
      </Col>
      <Col md={4}>
        <div className="text-center">
          <h3 className="text-info">{formatCurrency(report.summary.totalRevenue)}</h3>
          <small>Revenue Estimado</small>
        </div>
      </Col>
    </Row>

    {/* Top productos */}
    <h6>Productos Más Vendidos</h6>
    <Table responsive>
      <thead>
        <tr>
          <th>Producto</th>
          <th className="text-center">Unidades Vendidas</th>
          <th className="text-center">Número de Ventas</th>
        </tr>
      </thead>
      <tbody>
        {report.data.topProducts.map((product, index) => (
          <tr key={index}>
            <td>{product.product}</td>
            <td className="text-center">{product.quantity}</td>
            <td className="text-center">{product.sales}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
);

const AlertsReportContent = ({ report }) => (
  <div>
    {/* Resumen */}
    <Row className="mb-4">
      <Col md={4}>
        <div className="text-center">
          <h3 className="text-warning">{report.summary.lowStockCount}</h3>
          <small>Stock Bajo</small>
        </div>
      </Col>
      <Col md={4}>
        <div className="text-center">
          <h3 className="text-danger">{report.summary.outOfStockCount}</h3>
          <small>Sin Stock</small>
        </div>
      </Col>
      <Col md={4}>
        <div className="text-center">
          <h3 className="text-warning">{report.summary.criticalCount}</h3>
          <small>Stock Crítico</small>
        </div>
      </Col>
    </Row>

    {/* Productos sin stock */}
    {report.data.outOfStockProducts.length > 0 && (
      <>
        <h6 className="text-danger">Productos Sin Stock</h6>
        <Table responsive className="mb-4">
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Categoría</th>
              <th>Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {report.data.outOfStockProducts.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td><code>{product.sku}</code></td>
                <td>{product.category}</td>
                <td>{product.location}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    )}

    {/* Productos con stock bajo */}
    {report.data.lowStockProducts.length > 0 && (
      <>
        <h6 className="text-warning">Productos con Stock Bajo</h6>
        <Table responsive>
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th className="text-center">Stock Actual</th>
              <th className="text-center">Stock Mínimo</th>
              <th className="text-center">Requerido</th>
            </tr>
          </thead>
          <tbody>
            {report.data.lowStockProducts.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td><code>{product.sku}</code></td>
                <td className="text-center">{product.stock}</td>
                <td className="text-center">{product.minStock || 10}</td>
                <td className="text-center">
                  <Badge bg="info">
                    {(product.minStock || 10) - product.stock}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    )}
  </div>
);

const ValuationReportContent = ({ report, formatCurrency }) => (
  <div>
    {/* Resumen */}
    <Row className="mb-4">
      <Col md={4}>
        <div className="text-center">
          <h3 className="text-primary">{formatCurrency(report.summary.totalValue)}</h3>
          <small>Valor Total</small>
        </div>
      </Col>
      <Col md={4}>
        <div className="text-center">
          <h3 className="text-success">{formatCurrency(report.summary.averageValue)}</h3>
          <small>Valor Promedio</small>
        </div>
      </Col>
      <Col md={4}>
        <div className="text-center">
          <h3 className="text-info">{report.summary.totalProducts}</h3>
          <small>Total Productos</small>
        </div>
      </Col>
    </Row>

    {/* Valor por categoría */}
    <h6>Valor por Categoría</h6>
    <Table responsive className="mb-4">
      <thead>
        <tr>
          <th>Categoría</th>
          <th className="text-end">Valor Total</th>
          <th className="text-end">% del Total</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(report.data.categoryValues)
          .sort(([,a], [,b]) => b - a)
          .map(([category, value]) => (
          <tr key={category}>
            <td>{category}</td>
            <td className="text-end">{formatCurrency(value)}</td>
            <td className="text-end">
              {((value / report.summary.totalValue) * 100).toFixed(1)}%
            </td>
          </tr>
        ))}
      </tbody>
    </Table>

    {/* Productos de mayor valor */}
    <h6>Productos de Mayor Valor</h6>
    <Table responsive>
      <thead>
        <tr>
          <th>Producto</th>
          <th>SKU</th>
          <th className="text-center">Stock</th>
          <th className="text-end">Precio Unitario</th>
          <th className="text-end">Valor Total</th>
        </tr>
      </thead>
      <tbody>
        {report.data.topValueProducts.map(product => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td><code>{product.sku}</code></td>
            <td className="text-center">{product.stock}</td>
            <td className="text-end">{formatCurrency(product.price)}</td>
            <td className="text-end">{formatCurrency(product.totalValue)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
);

export default Reports;