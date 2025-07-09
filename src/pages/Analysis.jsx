// src/pages/Analysis.jsx
import React, { useState } from 'react';
import { Row, Col, Card, Form, Badge } from 'react-bootstrap';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaArrowUp, 
  FaArrowDown,
  FaEquals
} from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import { 
  calculateStockTrend,
  calculateMonthlyMovements,
  calculateHistoricalStock,
  calculateTopMovedProducts,
  generateCategoryDistribution,
  calculateInventoryTurnover
} from '../utils/formatters';

const Analysis = () => {
  const { 
    products, 
    movements, 
    formatCurrency, 
    settings 
  } = useApp();

  const [timeRange, setTimeRange] = useState('30');

  // Procesar datos REALES para gráficos
  const processChartData = () => {
    const days = parseInt(timeRange);

    // 1. Tendencia de stock REAL (últimos 7 meses)
    const stockTrendData = calculateHistoricalStock(products, movements);

    // 2. Entradas vs Salidas REAL por mes
    const entriesVsExitsData = calculateMonthlyMovements(movements, 6);

    // 3. Distribución por categoría REAL
    const categoryData = generateCategoryDistribution(products);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const categoryDataWithColors = categoryData.map((item, index) => ({
      ...item,
      color: colors[index % colors.length]
    }));

    // 4. Top productos por stock REAL
    const topProductsData = products
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10)
      .map(product => ({
        name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
        stock: product.stock,
        value: product.stock * product.price
      }));

    // 5. Movimientos por día REAL (últimos 7 días)
    const movementsByDay = calculateStockTrend(movements, 7);

    // 6. Estado del stock REAL
    const stockStatusData = [
      {
        name: 'Stock Normal',
        value: products.filter(p => p.stock > (p.minStock || settings.lowStockThreshold)).length,
        color: '#10b981'
      },
      {
        name: 'Stock Bajo',
        value: products.filter(p => p.stock <= (p.minStock || settings.lowStockThreshold) && p.stock > 0).length,
        color: '#f59e0b'
      },
      {
        name: 'Sin Stock',
        value: products.filter(p => p.stock === 0).length,
        color: '#ef4444'
      }
    ];

    // 7. Productos más movidos REAL
    const topMovedProducts = calculateTopMovedProducts(movements, 10);

    // 8. Rotación de inventario REAL
    const inventoryTurnover = calculateInventoryTurnover(movements, products, days);

    return {
      stockTrendData,
      entriesVsExitsData,
      categoryData: categoryDataWithColors,
      topProductsData,
      movementsByDay,
      stockStatusData,
      topMovedProducts,
      inventoryTurnover
    };
  };

  const chartData = processChartData();

  // Calcular tendencias REALES
  const calculateTrend = (data, field) => {
    if (data.length < 2) return 'equal';
    const latest = data[data.length - 1][field];
    const previous = data[data.length - 2][field];
    
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'equal';
  };

  const stockTrend = calculateTrend(chartData.stockTrendData, 'stock');
  const movementTrend = calculateTrend(chartData.movementsByDay, 'entries');

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <FaArrowUp className="text-success" />;
      case 'down': return <FaArrowDown className="text-danger" />;
      default: return <FaEquals className="text-muted" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'danger';
      default: return 'secondary';
    }
  };

  // Calcular métricas avanzadas
  const advancedMetrics = {
    totalMovements: movements.length,
    avgMovementsPerDay: movements.length / Math.max(1, Math.ceil((new Date() - new Date(Math.min(...movements.map(m => new Date(m.date))))) / (1000 * 60 * 60 * 24))),
    totalValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0),
    topCategoryValue: chartData.categoryData.reduce((max, cat) => cat.value > max.value ? cat : max, { value: 0 }),
    fastestTurnover: chartData.inventoryTurnover.find(p => p.turnoverRate > 0 && p.turnoverRate !== Infinity) || { turnoverRate: 0, name: 'N/A' }
  };

  return (
    <div>
      {/* Controles */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FaChartLine />
                Análisis Avanzado
                <Badge bg="info">Últimos {timeRange} días</Badge>
              </h5>
              <small className="text-muted">
                Visualiza tendencias y patrones de tu inventario con datos reales
              </small>
            </Col>
            <Col xs="auto">
              <Form.Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Métricas rápidas con tendencias REALES */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value">
                  {products.reduce((sum, p) => sum + p.stock, 0).toLocaleString()}
                </h2>
                <p className="metric-label">Stock Total Real</p>
                <Badge bg={getTrendColor(stockTrend)} className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                  {getTrendIcon(stockTrend)}
                  Tendencia
                </Badge>
              </div>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value">
                  {advancedMetrics.totalMovements}
                </h2>
                <p className="metric-label">Total Movimientos</p>
                <Badge bg="info">
                  {advancedMetrics.avgMovementsPerDay.toFixed(1)}/día
                </Badge>
              </div>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value">
                  {chartData.categoryData.length}
                </h2>
                <p className="metric-label">Categorías Activas</p>
                <Badge bg="info">
                  {products.length} productos
                </Badge>
              </div>
            </div>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value">
                  {formatCurrency(advancedMetrics.totalValue)}
                </h2>
                <p className="metric-label">Valor Total Real</p>
                <Badge bg="secondary">
                  {advancedMetrics.topCategoryValue.name || 'N/A'}
                </Badge>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Gráficos principales con datos REALES */}
      <Row>
        {/* Tendencia de Stock Histórico REAL */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartLine />
                Tendencia de Stock Histórico
                <small className="text-muted">Últimos 7 meses - Datos reales</small>
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.stockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="stock" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="Stock Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Estado del Stock REAL */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartPie />
                Estado de Stock Real
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.stockStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Entradas vs Salidas REAL */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartBar />
                Entradas vs Salidas Reales
                <small className="text-muted">Últimos 6 meses</small>
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.entriesVsExitsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
                  <Bar dataKey="salidas" fill="#ef4444" name="Salidas" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Distribución por Categoría REAL */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartPie />
                Stock por Categoría Real
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, stock }) => `${name}: ${stock}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="stock"
                  >
                    {chartData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Productos por Stock REAL */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartBar />
                Top 10 Productos por Stock Real
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.topProductsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis type="number" stroke="var(--text-secondary)" />
                  <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={120} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="stock" fill="#3b82f6" name="Stock" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Actividad Diaria REAL */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartLine />
                Actividad Diaria Real
                <small className="text-muted">Últimos 7 días</small>
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.movementsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="entries" stackId="a" fill="#10b981" name="Entradas" />
                  <Bar dataKey="exits" stackId="a" fill="#ef4444" name="Salidas" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Productos Más Movidos REAL */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartBar />
                Productos Más Movidos
                <small className="text-muted">Por cantidad total</small>
              </h6>
            </Card.Header>
            <Card.Body>
              {chartData.topMovedProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.topMovedProducts.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis 
                      dataKey="product" 
                      stroke="var(--text-secondary)" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="totalQuantity" fill="#8b5cf6" name="Cantidad Total" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-muted">
                  No hay suficientes movimientos para mostrar estadísticas
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Rotación de Inventario REAL */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartLine />
                Rotación de Inventario
                <small className="text-muted">Últimos {timeRange} días</small>
              </h6>
            </Card.Header>
            <Card.Body>
              {chartData.inventoryTurnover.filter(p => p.turnoverRate > 0 && p.turnoverRate !== Infinity).length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="text-center">Rotación</th>
                        <th className="text-center">Días Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.inventoryTurnover
                        .filter(p => p.turnoverRate > 0 && p.turnoverRate !== Infinity)
                        .slice(0, 8)
                        .map((product, index) => (
                        <tr key={index}>
                          <td>
                            <small>{product.name.length > 25 ? product.name.substring(0, 25) + '...' : product.name}</small>
                          </td>
                          <td className="text-center">
                            <Badge bg={product.turnoverRate > 2 ? 'success' : product.turnoverRate > 1 ? 'warning' : 'danger'}>
                              {product.turnoverRate.toFixed(2)}x
                            </Badge>
                          </td>
                          <td className="text-center">
                            <small>{Math.round(product.daysOfStock)} días</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  No hay suficientes datos de salidas para calcular rotación
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Insights automáticos REALES */}
      <Card>
        <Card.Header>
          <h6 className="mb-0">💡 Insights Automáticos (Datos Reales)</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6 className="text-primary">Productos</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  • <strong>{chartData.categoryData[0]?.name || 'N/A'}</strong> es la categoría con más stock ({chartData.categoryData[0]?.stock || 0} unidades)
                </li>
                <li className="mb-2">
                  • <strong>{chartData.topProductsData[0]?.name || 'N/A'}</strong> es el producto con mayor stock
                </li>
                <li className="mb-2">
                  • <strong>{chartData.stockStatusData.find(s => s.name === 'Sin Stock')?.value || 0}</strong> productos sin stock requieren reabastecimiento
                </li>
                {chartData.topMovedProducts.length > 0 && (
                  <li className="mb-2">
                    • <strong>{chartData.topMovedProducts[0].product}</strong> es el producto más movido ({chartData.topMovedProducts[0].totalQuantity} unidades)
                  </li>
                )}
              </ul>
            </Col>
            <Col md={6}>
              <h6 className="text-success">Tendencias</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  • Stock total muestra tendencia {stockTrend === 'up' ? 'creciente' : stockTrend === 'down' ? 'decreciente' : 'estable'}
                </li>
                <li className="mb-2">
                  • Promedio de {advancedMetrics.avgMovementsPerDay.toFixed(1)} movimientos por día
                </li>
                <li className="mb-2">
                  • {chartData.movementsByDay.reduce((sum, day) => sum + day.entries, 0)} entradas vs {chartData.movementsByDay.reduce((sum, day) => sum + day.exits, 0)} salidas esta semana
                </li>
                {advancedMetrics.fastestTurnover.turnoverRate > 0 && (
                  <li className="mb-2">
                    • <strong>{advancedMetrics.fastestTurnover.name}</strong> tiene la mayor rotación ({advancedMetrics.fastestTurnover.turnoverRate.toFixed(1)}x/año)
                  </li>
                )}
              </ul>
            </Col>
          </Row>
          
          {/* Métricas adicionales */}
          <Row className="mt-3 pt-3 border-top">
            <Col md={12}>
              <h6 className="text-info">Métricas de Rendimiento</h6>
              <div className="d-flex gap-4 flex-wrap">
                <div className="text-center">
                  <div className="h5 mb-0">{formatCurrency(advancedMetrics.totalValue / products.length)}</div>
                  <small className="text-muted">Valor promedio por producto</small>
                </div>
                <div className="text-center">
                  <div className="h5 mb-0">{(products.reduce((sum, p) => sum + p.stock, 0) / products.length).toFixed(0)}</div>
                  <small className="text-muted">Stock promedio por producto</small>
                </div>
                <div className="text-center">
                  <div className="h5 mb-0">{((chartData.stockStatusData.find(s => s.name === 'Stock Normal')?.value || 0) / products.length * 100).toFixed(0)}%</div>
                  <small className="text-muted">Productos con stock normal</small>
                </div>
                <div className="text-center">
                  <div className="h5 mb-0">{chartData.categoryData.length}</div>
                  <small className="text-muted">Categorías con productos</small>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Analysis;