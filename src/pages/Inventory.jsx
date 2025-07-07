// src/pages/Inventory.jsx
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
  Alert,
  Dropdown,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaFilter,
  FaExclamationTriangle,
  FaBoxes,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import { CATEGORIES, LOCATIONS } from '../utils/mockData';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import toast from 'react-hot-toast';

const Inventory = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    formatCurrency, 
    settings,
    hasPermission 
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showLowStock, setShowLowStock] = useState(false);

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      const matchesLowStock = !showLowStock || product.stock <= settings.lowStockThreshold;
      
      return matchesSearch && matchesCategory && matchesLowStock;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Convertir a números si es necesario
      if (sortField === 'stock' || sortField === 'price') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const lowStockProducts = products.filter(p => p.stock <= settings.lowStockThreshold);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ms-1" size={12} />;
    return sortDirection === 'asc' ? 
      <FaSortUp className="ms-1" size={12} /> : 
      <FaSortDown className="ms-1" size={12} />;
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      deleteProduct(product.id);
      toast.success('Producto eliminado correctamente');
    }
  };

  const handleSubmitProduct = (productData) => {
    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, productData);
        toast.success('Producto actualizado correctamente');
      } else {
        addProduct(productData);
        toast.success('Producto agregado correctamente');
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error('Error al guardar el producto');
    }
  };

  const getStockBadge = (stock, minStock) => {
    if (stock <= 0) {
      return <Badge bg="danger">Sin Stock</Badge>;
    } else if (stock <= minStock) {
      return <Badge bg="warning">Stock Bajo</Badge>;
    } else {
      return <Badge bg="success">Normal</Badge>;
    }
  };

  const canEdit = hasPermission('inventory');

  return (
    <div>
      {/* Alerta de productos con stock bajo */}
      {lowStockProducts.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <FaExclamationTriangle />
              <div>
                <strong>Productos con Stock Bajo ({lowStockProducts.length})</strong>
                <div className="mt-1">
                  {lowStockProducts.map(p => p.name).join(', ')}
                </div>
              </div>
            </div>
            <Button 
              variant="outline-warning" 
              size="sm"
              onClick={() => setShowLowStock(!showLowStock)}
            >
              {showLowStock ? 'Ver Todos' : 'Filtrar'}
            </Button>
          </div>
        </Alert>
      )}

      {/* Header y controles */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6} lg={8}>
              <div className="d-flex gap-3 align-items-center flex-wrap">
                {/* Búsqueda */}
                <InputGroup style={{ maxWidth: '300px' }}>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                {/* Filtro por categoría */}
                <Form.Select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ maxWidth: '200px' }}
                >
                  <option value="">Todas las categorías</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>

                {/* Toggle stock bajo */}
                <Form.Check
                  type="switch"
                  id="low-stock-switch"
                  label="Solo stock bajo"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                />
              </div>
            </Col>
            
            <Col md={6} lg={4} className="text-end">
              {canEdit && (
                <Button 
                  variant="primary" 
                  onClick={handleAddProduct}
                  className="d-flex align-items-center gap-2 ms-auto"
                >
                  <FaPlus size={14} />
                  Añadir Producto
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de productos */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaBoxes className="me-2" />
            Control de Inventario
          </h5>
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted">
              Mostrando {filteredProducts.length} de {products.length} productos
            </small>
          </div>
        </Card.Header>
        
        <Card.Body className="p-0">
          {filteredProducts.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead>
                  <tr>
                    <th 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => handleSort('name')}
                    >
                      Producto {getSortIcon('name')}
                    </th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('sku')}
                    >
                      SKU {getSortIcon('sku')}
                    </th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('stock')}
                      className="text-center"
                    >
                      Stock {getSortIcon('stock')}
                    </th>
                    <th>Ubicación</th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('price')}
                      className="text-end"
                    >
                      Valor {getSortIcon('price')}
                    </th>
                    {canEdit && <th className="text-center">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div>
                          <div className="fw-medium">{product.name}</div>
                          <small className="text-muted">{product.category}</small>
                        </div>
                      </td>
                      <td>
                        <code className="bg-secondary bg-opacity-10 px-2 py-1 rounded">
                          {product.sku}
                        </code>
                      </td>
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <span className={`fw-bold ${
                            product.stock <= 0 ? 'text-danger' :
                            product.stock <= product.minStock ? 'text-warning' :
                            'text-success'
                          }`}>
                            {product.stock.toLocaleString()}
                          </span>
                          <div>
                            {getStockBadge(product.stock, product.minStock || settings.lowStockThreshold)}
                          </div>
                          <small className="text-muted">
                            Min: {product.minStock || settings.lowStockThreshold}
                          </small>
                        </div>
                      </td>
                      <td>
                        <small>{product.location}</small>
                      </td>
                      <td className="text-end">
                        <div>
                          <div className="fw-medium">
                            {formatCurrency(product.price)}
                          </div>
                          <small className="text-muted">
                            Total: {formatCurrency(product.stock * product.price)}
                          </small>
                        </div>
                      </td>
                      {canEdit && (
                        <td className="text-center">
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                              <FaEye />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item 
                                onClick={() => handleEditProduct(product)}
                                className="d-flex align-items-center gap-2"
                              >
                                <FaEdit size={12} />
                                Editar
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item 
                                onClick={() => handleDeleteProduct(product)}
                                className="d-flex align-items-center gap-2 text-danger"
                              >
                                <FaTrash size={12} />
                                Eliminar
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <FaBoxes size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No se encontraron productos</h5>
              <p className="text-muted mb-3">
                {searchTerm || categoryFilter || showLowStock 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza agregando tu primer producto al inventario'
                }
              </p>
              {canEdit && !searchTerm && !categoryFilter && !showLowStock && (
                <Button variant="primary" onClick={handleAddProduct}>
                  <FaPlus className="me-2" />
                  Añadir Primer Producto
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para agregar/editar producto */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmitProduct}
          onCancel={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Inventory;