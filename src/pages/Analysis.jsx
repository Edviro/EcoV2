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
import { CHART_DATA } from '../utils/mockData';
import { format, subDays, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const Analysis = () => {
  const { 
    products, 
    movements, 
    formatCurrency, 
    settings 
  } = useApp();

  const [timeRange, setTimeRange] = useState('30'); // días

  // Procesar datos para gráficos
  const processChartData = () => {
    const days = parseInt(timeRange);
    const today = new Date();
    const startDate = subDays(today, days);

    // Tendencia de stock en el tiempo (simulado con datos de ejemplo)
    const stockTrendData = CHART_DATA.stockTrend.map(item => ({
      ...item,
      stock: item.stock + Math.floor(Math.random() * 200) - 100 // Variación aleatoria
    }));

    // Entradas vs Salidas por mes
    const entriesVsExitsData = CHART_DATA.entriesVsExits;

    // Distribución por categoría
    const categoryData = products.reduce((acc, product) => {
      const existing = acc.find(item => item.name === product.category);
      if (existing) {
        existing.value += product.stock;
        existing.count += 1;
      } else {
        acc.push({
          name: product.category,
          value: product.stock,
          count: 1,
          color: getRandomColor(acc.length)
        });
      }
      return acc;
    }, []);

    // Top productos por stock
    const topProductsData = products
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10)
      .map(product => ({
        name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
        stock: product.stock,
        value: product.stock * product.price
      }));

    // Movimientos por día (últimos 7 días)
    const movementsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayMovements = movements.filter(m => {
        const movementDate = new Date(m.date);
        return format(movementDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      const entries = dayMovements.filter(m => m.type === 'entrada').length;
      const exits = dayMovements.filter(m => m.type === 'salida').length;

      movementsByDay.push({
        date: format(date, 'dd/MM', { locale: es }),
        entradas: entries,
        salidas: exits,
        total: entries + exits
      });
    }

    // Estado del stock (normal, bajo, crítico)
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

    return {
      stockTrendData,
      entriesVsExitsData,
      categoryData,
      topProductsData,
      movementsByDay,
      stockStatusData
    };
  };

  const getRandomColor = (index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    return colors[index % colors.length];
  };

  const chartData = processChartData();

  // Calcular métricas de tendencia
  const calculateTrend = (data, field) => {
    if (data.length < 2) return 'equal';
    const latest = data[data.length - 1][field];
    const previous = data[data.length - 2][field];
    
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'equal';
  };

  const stockTrend = calculateTrend(chartData.stockTrendData, 'stock');
  const movementTrend = calculateTrend(chartData.movementsByDay, 'total');

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
                Visualiza tendencias y patrones de tu inventario
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

      {/* Métricas rápidas con tendencias */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="metric-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="metric-value">
                  {chartData.stockTrendData[chartData.stockTrendData.length - 1]?.stock || 0}
                </h2>
                <p className="metric-label">Stock Total</p>
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
                  {chartData.movementsByDay.reduce((sum, day) => sum + day.total, 0)}
                </h2>
                <p className="metric-label">Movimientos ({timeRange}d)</p>
                <Badge bg={getTrendColor(movementTrend)} className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                  {getTrendIcon(movementTrend)}
                  Actividad
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
                  {formatCurrency(chartData.topProductsData.reduce((sum, p) => sum + p.value, 0))}
                </h2>
                <p className="metric-label">Valor Top 10</p>
                <Badge bg="secondary">
                  {((chartData.topProductsData.reduce((sum, p) => sum + p.value, 0) / products.reduce((sum, p) => sum + (p.stock * p.price), 0)) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Gráficos principales */}
      <Row>
        {/* Tendencia de Stock */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartLine />
                Tendencia de Stock
                <small className="text-muted">Últimos 7 meses</small>
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

        {/* Estado del Stock */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartPie />
                Estado de Stock
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

        {/* Entradas vs Salidas */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartBar />
                Entradas vs Salidas
                <small className="text-muted">Por mes</small>
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

        {/* Distribución por Categoría */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartPie />
                Stock por Categoría
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
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
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

        {/* Top Productos por Stock */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartBar />
                Top 10 Productos por Stock
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

        {/* Actividad Diaria */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaChartLine />
                Actividad Diaria
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
                  <Bar dataKey="entradas" stackId="a" fill="#10b981" name="Entradas" />
                  <Bar dataKey="salidas" stackId="a" fill="#ef4444" name="Salidas" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Insights automáticos */}
      <Card>
        <Card.Header>
          <h6 className="mb-0">💡 Insights Automáticos</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6 className="text-primary">Productos</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  • <strong>{chartData.categoryData[0]?.name}</strong> es la categoría con más stock ({chartData.categoryData[0]?.value} unidades)
                </li>
                <li className="mb-2">
                  • <strong>{chartData.topProductsData[0]?.name}</strong> es el producto con mayor stock
                </li>
                <li className="mb-2">
                  • <strong>{chartData.stockStatusData.find(s => s.name === 'Sin Stock')?.value || 0}</strong> productos sin stock requieren reabastecimiento
                </li>
              </ul>
            </Col>
            <Col md={6}>
              <h6 className="text-success">Tendencias</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  • Stock total muestra tendencia {stockTrend === 'up' ? 'creciente' : stockTrend === 'down' ? 'decreciente' : 'estable'}
                </li>
                <li className="mb-2">
                  • Actividad de movimientos es {movementTrend === 'up' ? 'creciente' : movementTrend === 'down' ? 'decreciente' : 'estable'}
                </li>
                <li className="mb-2">
                  • {chartData.movementsByDay.reduce((sum, day) => sum + day.entradas, 0)} entradas vs {chartData.movementsByDay.reduce((sum, day) => sum + day.salidas, 0)} salidas esta semana
                </li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Analysis;