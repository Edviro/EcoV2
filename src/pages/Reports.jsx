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
  Alert,
  Spinner
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
  FaFilter,
  FaFileExcel,
  FaFilePdf
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
  const [exporting, setExporting] = useState(false);

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

  // EXPORTACIÓN REAL A EXCEL
  const exportToExcel = async () => {
    if (!generatedReport) {
      toast.error('Genera un reporte primero');
      return;
    }

    setExporting(true);
    
    try {
      // Importar XLSX dinámicamente
      const XLSX = await import('xlsx');
      
      const wb = XLSX.utils.book_new();
      
      // Hoja de resumen
      const summaryData = [
        ['REPORTE:', generatedReport.title],
        ['FECHA GENERACIÓN:', format(new Date(), 'dd/MM/yyyy HH:mm')],
        ['PERÍODO:', `${dateRange.from} al ${dateRange.to}`],
        ['EMPRESA:', settings.company],
        [''],
        ['RESUMEN EJECUTIVO:'],
        ...Object.entries(generatedReport.summary).map(([key, value]) => [
          key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          typeof value === 'number' && key.includes('Value') ? formatCurrency(value) : value
        ])
      ];
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');

      // Hoja de datos detallados según el tipo de reporte
      switch (generatedReport.type) {
        case 'inventory':
          // Hoja de productos
          const productsData = [
            ['Producto', 'SKU', 'Categoría', 'Ubicación', 'Stock', 'Stock Mínimo', 'Precio Unitario', 'Valor Total', 'Estado'],
            ...generatedReport.data.products.map(product => [
              product.name,
              product.sku,
              product.category,
              product.location,
              product.stock,
              product.minStock || settings.lowStockThreshold,
              product.price,
              product.stock * product.price,
              product.stock <= (product.minStock || settings.lowStockThreshold) ? 'Stock Bajo' : 'Normal'
            ])
          ];
          const productsWs = XLSX.utils.aoa_to_sheet(productsData);
          XLSX.utils.book_append_sheet(wb, productsWs, 'Productos');

          // Hoja de categorías
          const categoriesData = [
            ['Categoría', 'Cantidad Productos', 'Stock Total', 'Valor Total'],
            ...Object.entries(generatedReport.data.categorySummary).map(([category, data]) => [
              category,
              data.count,
              data.stock,
              data.value
            ])
          ];
          const categoriesWs = XLSX.utils.aoa_to_sheet(categoriesData);
          XLSX.utils.book_append_sheet(wb, categoriesWs, 'Por Categoría');
          break;

        case 'movements':
          const movementsData = [
            ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Motivo', 'Usuario', 'Referencia'],
            ...generatedReport.data.movements.map(movement => [
              format(new Date(movement.date), 'dd/MM/yyyy HH:mm'),
              movement.product,
              movement.type,
              movement.quantity,
              movement.reason,
              movement.user,
              movement.reference
            ])
          ];
          const movementsWs = XLSX.utils.aoa_to_sheet(movementsData);
          XLSX.utils.book_append_sheet(wb, movementsWs, 'Movimientos');
          break;

        case 'sales':
          if (generatedReport.data.topProducts.length > 0) {
            const salesData = [
              ['Producto', 'Cantidad Vendida', 'Número de Ventas'],
              ...generatedReport.data.topProducts.map(product => [
                product.product,
                product.quantity,
                product.sales
              ])
            ];
            const salesWs = XLSX.utils.aoa_to_sheet(salesData);
            XLSX.utils.book_append_sheet(wb, salesWs, 'Productos Vendidos');
          }
          break;

        case 'alerts':
          if (generatedReport.data.lowStockProducts.length > 0) {
            const alertsData = [
              ['Producto', 'SKU', 'Stock Actual', 'Stock Mínimo', 'Diferencia', 'Categoría'],
              ...generatedReport.data.lowStockProducts.map(product => [
                product.name,
                product.sku,
                product.stock,
                product.minStock || settings.lowStockThreshold,
                (product.minStock || settings.lowStockThreshold) - product.stock,
                product.category
              ])
            ];
            const alertsWs = XLSX.utils.aoa_to_sheet(alertsData);
            XLSX.utils.book_append_sheet(wb, alertsWs, 'Productos Stock Bajo');
          }
          break;

        case 'valuation':
          // Hoja de valorización por categoría
          const valuationData = [
            ['Categoría', 'Valor Total', '% del Total'],
            ...Object.entries(generatedReport.data.categoryValues)
              .sort(([,a], [,b]) => b - a)
              .map(([category, value]) => [
                category,
                value,
                ((value / generatedReport.summary.totalValue) * 100).toFixed(2) + '%'
              ])
          ];
          const valuationWs = XLSX.utils.aoa_to_sheet(valuationData);
          XLSX.utils.book_append_sheet(wb, valuationWs, 'Valorización por Categoría');

          // Hoja de productos de mayor valor
          const topValueData = [
            ['Producto', 'SKU', 'Stock', 'Precio Unitario', 'Valor Total'],
            ...generatedReport.data.topValueProducts.map(product => [
              product.name,
              product.sku,
              product.stock,
              product.price,
              product.totalValue
            ])
          ];
          const topValueWs = XLSX.utils.aoa_to_sheet(topValueData);
          XLSX.utils.book_append_sheet(wb, topValueWs, 'Top Productos por Valor');
          break;
      }

      // Descargar archivo
      const fileName = `${generatedReport.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Reporte exportado a Excel correctamente');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      toast.error('Error al exportar a Excel');
    } finally {
      setExporting(false);
    }
  };

  // EXPORTACIÓN REAL A PDF
  // SOLUCIÓN ALTERNATIVA: Reemplaza la función exportToPDF en Reports.jsx

// EXPORTACIÓN REAL A PDF - VERSIÓN CORREGIDA
const exportToPDF = async () => {
  if (!generatedReport) {
    toast.error('Genera un reporte primero');
    return;
  }

  setExporting(true);
  
  try {
    // Método alternativo: usar window.jsPDF si está disponible
    let jsPDF;
    
    // Intentar importar jsPDF de diferentes maneras
    try {
      // Método 1: Importación destructurada
      const jsPDFModule = await import('jspdf');
      jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
    } catch (error) {
      // Método 2: Si falla, usar script global
      if (window.jsPDF) {
        jsPDF = window.jsPDF;
      } else {
        throw new Error('jsPDF no está disponible');
      }
    }

    // Importar autotable
    await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // Configurar fuente
    doc.setFont('helvetica');
    
    // Header del documento
    doc.setFontSize(20);
    doc.text(generatedReport.title, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Empresa: ${settings.company}`, 14, 35);
    doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 42);
    doc.text(`Período: ${dateRange.from} al ${dateRange.to}`, 14, 49);
    
    // Resumen ejecutivo
    doc.setFontSize(14);
    doc.text('Resumen Ejecutivo', 14, 65);
    
    let yPosition = 75;
    doc.setFontSize(10);
    
    Object.entries(generatedReport.summary).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const formattedValue = typeof value === 'number' && key.includes('Value') ? 
        formatCurrency(value) : value.toString();
      
      doc.text(`${label}: ${formattedValue}`, 14, yPosition);
      yPosition += 7;
    });

    // Tabla de datos principales según el tipo de reporte
    yPosition += 10;

    switch (generatedReport.type) {
      case 'inventory':
        if (generatedReport.data.products.length > 0) {
          doc.autoTable({
            head: [['Producto', 'SKU', 'Stock', 'Precio', 'Estado']],
            body: generatedReport.data.products.slice(0, 30).map(product => [
              product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name,
              product.sku,
              product.stock.toString(),
              formatCurrency(product.price),
              product.stock <= (product.minStock || settings.lowStockThreshold) ? 'Stock Bajo' : 'Normal'
            ]),
            startY: yPosition,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 130, 246] }
          });
        }
        break;

      case 'movements':
        if (generatedReport.data.movements.length > 0) {
          doc.autoTable({
            head: [['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Usuario']],
            body: generatedReport.data.movements.slice(0, 30).map(movement => [
              format(new Date(movement.date), 'dd/MM/yyyy'),
              movement.product.length > 25 ? movement.product.substring(0, 25) + '...' : movement.product,
              movement.type,
              movement.quantity.toString(),
              movement.user
            ]),
            startY: yPosition,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 130, 246] }
          });
        }
        break;

      case 'sales':
        if (generatedReport.data.topProducts && generatedReport.data.topProducts.length > 0) {
          doc.autoTable({
            head: [['Producto', 'Cantidad Vendida', 'Número de Ventas']],
            body: generatedReport.data.topProducts.map(product => [
              product.product.length > 35 ? product.product.substring(0, 35) + '...' : product.product,
              product.quantity.toString(),
              product.sales.toString()
            ]),
            startY: yPosition,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 130, 246] }
          });
        }
        break;

      case 'alerts':
        if (generatedReport.data.lowStockProducts.length > 0) {
          doc.autoTable({
            head: [['Producto', 'Stock Actual', 'Stock Mínimo', 'Diferencia']],
            body: generatedReport.data.lowStockProducts.map(product => [
              product.name.length > 35 ? product.name.substring(0, 35) + '...' : product.name,
              product.stock.toString(),
              (product.minStock || settings.lowStockThreshold).toString(),
              ((product.minStock || settings.lowStockThreshold) - product.stock).toString()
            ]),
            startY: yPosition,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [245, 158, 11] }
          });
        }
        break;

      case 'valuation':
        if (generatedReport.data.topValueProducts.length > 0) {
          doc.autoTable({
            head: [['Producto', 'Stock', 'Precio Unit.', 'Valor Total']],
            body: generatedReport.data.topValueProducts.map(product => [
              product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name,
              product.stock.toString(),
              formatCurrency(product.price),
              formatCurrency(product.totalValue)
            ]),
            startY: yPosition,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 130, 246] }
          });
        }
        break;
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount} - Generado por ${settings.company}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    // Descargar archivo
    const fileName = `${generatedReport.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
    
    toast.success('Reporte exportado a PDF correctamente');
  } catch (error) {
    console.error('Error detallado al exportar a PDF:', error);
    
    // Fallback: exportar como texto plano si falla PDF
    try {
      const textContent = generateTextReport(generatedReport);
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generatedReport.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Reporte exportado como archivo de texto');
    } catch (fallbackError) {
      toast.error('Error al exportar el reporte. Intenta con Excel.');
    }
  } finally {
    setExporting(false);
  }
};

// Función auxiliar para generar reporte en texto plano como fallback
const generateTextReport = (report) => {
  let content = `${report.title}\n`;
  content += `Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}\n`;
  content += `Empresa: ${settings.company}\n`;
  content += `Período: ${dateRange.from} al ${dateRange.to}\n\n`;
  
  content += 'RESUMEN EJECUTIVO:\n';
  Object.entries(report.summary).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const formattedValue = typeof value === 'number' && key.includes('Value') ? 
      formatCurrency(value) : value.toString();
    content += `${label}: ${formattedValue}\n`;
  });
  
  content += '\n--- FIN DEL REPORTE ---';
  return content;
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
                  <Spinner size="sm" className="me-2" />
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
                variant="success" 
                size="sm"
                onClick={exportToExcel}
                disabled={exporting}
              >
                {exporting ? (
                  <Spinner size="sm" className="me-1" />
                ) : (
                  <FaFileExcel className="me-1" />
                )}
                Excel
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={exportToPDF}
                disabled={exporting}
              >
                {exporting ? (
                  <Spinner size="sm" className="me-1" />
                ) : (
                  <FaFilePdf className="me-1" />
                )}
                PDF
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
    {report.data.topProducts.length > 0 ? (
      <>
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
      </>
    ) : (
      <Alert variant="info">
        No se encontraron ventas en el período seleccionado.
      </Alert>
    )}
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

    {report.data.lowStockProducts.length === 0 && report.data.outOfStockProducts.length === 0 && (
      <Alert variant="success">
        ¡Excelente! No hay productos con alertas de stock en este momento.
      </Alert>
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