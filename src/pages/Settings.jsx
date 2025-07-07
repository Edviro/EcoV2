// src/pages/Settings.jsx
import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Tabs,
  Tab,
  Alert,
  Badge,
  Table,
  InputGroup,
  ListGroup
} from 'react-bootstrap';
import { 
  FaCog, 
  FaBuilding, 
  FaDollarSign, 
  FaPalette, 
  FaGlobe,
  FaDatabase,
  FaDownload,
  FaTrash,
  FaSave,
  FaUndo,
  FaPlus,
  FaEdit,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { 
    settings, 
    updateSettings, 
    products, 
    movements, 
    users,
    formatCurrency,
    categories,
    locations,
    addCategory,
    updateCategory,
    deleteCategory,
    addLocation,
    updateLocation,
    deleteLocation
  } = useApp();

  const [formData, setFormData] = useState(settings);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  // Monitorear cambios
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings(formData);
    setHasChanges(false);
    toast.success('Configuración guardada correctamente');
  };

  const handleReset = () => {
    setFormData(settings);
    setHasChanges(false);
    toast.info('Cambios descartados');
  };

  const handleExportData = () => {
    const exportData = {
      products,
      movements,
      users: users.map(u => ({ ...u, password: undefined })),
      settings,
      categories,
      locations,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `econoarena-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    localStorage.setItem('last_backup', new Date().toISOString());
    toast.success('Datos exportados correctamente');
  };

  const handleClearAllData = () => {
    if (window.confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos del sistema. ¿Estás seguro?')) {
      if (window.confirm('🚨 CONFIRMACIÓN FINAL: Se perderán todos los datos. ¿Continuar?')) {
        localStorage.clear();
        toast.success('Todos los datos han sido eliminados');
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const currencies = [
    { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
    { code: 'USD', symbol: '$', name: 'Dólar Estadounidense' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'MXN', symbol: '$', name: 'Peso Mexicano' }
  ];

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' }
  ];

  const systemStats = {
    totalProducts: products.length,
    totalMovements: movements.length,
    totalUsers: users.length,
    totalValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0),
    lastBackup: localStorage.getItem('last_backup') || 'Nunca'
  };

  return (
    <div>
      {/* Header con botones de acción */}
      {hasChanges && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>⚠️ Cambios sin guardar</strong>
              <div className="mt-1">Tienes cambios pendientes en la configuración.</div>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" size="sm" onClick={handleReset}>
                <FaUndo className="me-1" />
                Descartar
              </Button>
              <Button variant="success" size="sm" onClick={handleSave}>
                <FaSave className="me-1" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Pestañas de configuración */}
      <Card>
        <Card.Header>
          <Tabs 
            activeKey={activeTab} 
            onSelect={setActiveTab}
            className="border-0"
          >
            <Tab eventKey="general" title={
              <span className="d-flex align-items-center gap-2">
                <FaCog />
                General
              </span>
            } />
            <Tab eventKey="company" title={
              <span className="d-flex align-items-center gap-2">
                <FaBuilding />
                Empresa
              </span>
            } />
            <Tab eventKey="system" title={
              <span className="d-flex align-items-center gap-2">
                <FaDatabase />
                Sistema
              </span>
            } />
            <Tab eventKey="backup" title={
              <span className="d-flex align-items-center gap-2">
                <FaDownload />
                Respaldo
              </span>
            } />
          </Tabs>
        </Card.Header>

        <Card.Body>
          {activeTab === 'general' && (
            <GeneralSettings 
              formData={formData} 
              handleChange={handleChange} 
              currencies={currencies}
              languages={languages}
              products={products}
            />
          )}

          {activeTab === 'company' && (
            <CompanySettings 
              formData={formData} 
              handleChange={handleChange} 
            />
          )}

          {activeTab === 'system' && (
            <SystemSettings 
              systemStats={systemStats}
              formData={formData}
              languages={languages}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === 'backup' && (
            <BackupSettings 
              systemStats={systemStats}
              categories={categories}
              locations={locations}
              handleExportData={handleExportData}
              handleClearAllData={handleClearAllData}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

// Componente para configuración general
const GeneralSettings = ({ formData, handleChange, currencies, languages, products }) => (
  <div>
    <h5 className="mb-4">Configuración General</h5>
    
    <Row>
      <Col md={6} className="mb-4">
        <Card className="h-100">
          <Card.Header>
            <h6 className="mb-0 d-flex align-items-center gap-2">
              <FaDollarSign />
              Moneda y Formato
            </h6>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Moneda Principal</Form.Label>
              <Form.Select
                value={formData.currency}
                onChange={(e) => {
                  const currency = currencies.find(c => c.code === e.target.value);
                  handleChange('currency', currency.code);
                  handleChange('currencySymbol', currency.symbol);
                }}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="bg-light p-3 rounded">
              <strong>Vista previa:</strong>
              <div className="mt-2">
                <div>Precio: {formData.currencySymbol} 25.50</div>
                <div>Total: {formData.currencySymbol} 1,250.00</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} className="mb-4">
        <Card className="h-100">
          <Card.Header>
            <h6 className="mb-0 d-flex align-items-center gap-2">
              <FaPalette />
              Apariencia
            </h6>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tema de la Interfaz</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  id="theme-dark"
                  name="theme"
                  value="dark"
                  checked={formData.theme === 'dark'}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  label="Tema Oscuro"
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="theme-light"
                  name="theme"
                  value="light"
                  checked={formData.theme === 'light'}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  label="Tema Claro"
                />
              </div>
            </Form.Group>
          </Card.Body>
        </Card>
      </Col>

      <Col md={12}>
        <Card>
          <Card.Header>
            <h6 className="mb-0">Configuración de Inventario</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Umbral de Stock Bajo</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
                  />
                  <Form.Text className="text-muted">
                    Productos con stock menor o igual a este valor mostrarán alertas
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <div className="bg-light p-3 rounded">
                  <strong>Productos afectados:</strong>
                  <div className="mt-2">
                    {products.filter(p => p.stock <= formData.lowStockThreshold).length} productos tendrán alerta de stock bajo
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </div>
);

// Componente para configuración de empresa
const CompanySettings = ({ formData, handleChange }) => (
  <div>
    <h5 className="mb-4">Información de la Empresa</h5>
    
    <Row>
      <Col md={8}>
        <Card>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Empresa</Form.Label>
              <Form.Control
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Nombre de tu empresa"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email de Contacto</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="info@econoarena.com"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+51 999 888 777"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Av. Principal 123, Lima, Perú"
              />
            </Form.Group>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4}>
        <Card>
          <Card.Header>
            <h6 className="mb-0">Vista Previa</h6>
          </Card.Header>
          <Card.Body>
            <div className="text-center">
              <div 
                className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '60px', height: '60px', fontSize: '1.5rem', color: 'white' }}
              >
                {formData.company.charAt(0).toUpperCase()}
              </div>
              <h6>{formData.company}</h6>
              {formData.email && <div className="small text-muted">{formData.email}</div>}
              {formData.phone && <div className="small text-muted">{formData.phone}</div>}
              {formData.address && <div className="small text-muted mt-2">{formData.address}</div>}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </div>
);

// Componente para configuración del sistema
const SystemSettings = ({ systemStats, formData, languages, formatCurrency }) => (
  <div>
    <h5 className="mb-4">Información del Sistema</h5>
    
    <Row>
      <Col md={6} className="mb-4">
        <Card>
          <Card.Header>
            <h6 className="mb-0">Estadísticas Generales</h6>
          </Card.Header>
          <Card.Body>
            <Table className="mb-0">
              <tbody>
                <tr>
                  <td>Total de Productos:</td>
                  <td><Badge bg="primary">{systemStats.totalProducts}</Badge></td>
                </tr>
                <tr>
                  <td>Total de Movimientos:</td>
                  <td><Badge bg="info">{systemStats.totalMovements}</Badge></td>
                </tr>
                <tr>
                  <td>Total de Usuarios:</td>
                  <td><Badge bg="success">{systemStats.totalUsers}</Badge></td>
                </tr>
                <tr>
                  <td>Valor del Inventario:</td>
                  <td><Badge bg="warning">{formatCurrency(systemStats.totalValue)}</Badge></td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} className="mb-4">
        <Card>
          <Card.Header>
            <h6 className="mb-0">Configuración del Sistema</h6>
          </Card.Header>
          <Card.Body>
            <Table className="mb-0">
              <tbody>
                <tr>
                  <td>Versión:</td>
                  <td><Badge bg="info">v1.0.0 Demo</Badge></td>
                </tr>
                <tr>
                  <td>Tema Actual:</td>
                  <td><Badge bg={formData.theme === 'dark' ? 'dark' : 'light'}>{formData.theme === 'dark' ? 'Oscuro' : 'Claro'}</Badge></td>
                </tr>
                <tr>
                  <td>Moneda:</td>
                  <td><Badge bg="success">{formData.currencySymbol} {formData.currency}</Badge></td>
                </tr>
                <tr>
                  <td>Último Respaldo:</td>
                  <td><Badge bg="warning">{systemStats.lastBackup === 'Nunca' ? 'Nunca' : new Date(systemStats.lastBackup).toLocaleDateString()}</Badge></td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    {/* Gestión de Categorías y Ubicaciones */}
    <Row>
      <Col md={6} className="mb-4">
        <CategoryManager />
      </Col>

      <Col md={6} className="mb-4">
        <LocationManager />
      </Col>
    </Row>
  </div>
);

// Componente para respaldo
const BackupSettings = ({ systemStats, categories, locations, handleExportData, handleClearAllData }) => (
  <div>
    <h5 className="mb-4">Respaldo y Restauración</h5>
    
    <Row>
      <Col md={6} className="mb-4">
        <Card>
          <Card.Header>
            <h6 className="mb-0 d-flex align-items-center gap-2">
              <FaDownload />
              Exportar Datos
            </h6>
          </Card.Header>
          <Card.Body>
            <p className="text-muted">
              Descarga una copia de seguridad completa de todos tus datos.
            </p>
            
            <div className="bg-light p-3 rounded mb-3">
              <strong>El respaldo incluye:</strong>
              <ul className="mt-2 mb-0">
                <li>{systemStats.totalProducts} productos</li>
                <li>{systemStats.totalMovements} movimientos</li>
                <li>{systemStats.totalUsers} usuarios</li>
                <li>{categories.length} categorías</li>
                <li>{locations.length} ubicaciones</li>
                <li>Configuración del sistema</li>
              </ul>
            </div>

            <Button 
              variant="success" 
              onClick={handleExportData}
              className="w-100"
            >
              <FaDownload className="me-2" />
              Descargar Respaldo
            </Button>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} className="mb-4">
        <Card className="border-danger">
          <Card.Header className="bg-danger text-white">
            <h6 className="mb-0 d-flex align-items-center gap-2">
              <FaTrash />
              Zona Peligrosa
            </h6>
          </Card.Header>
          <Card.Body>
            <p className="text-muted">
              <strong>⚠️ ADVERTENCIA:</strong> Esta acción eliminará permanentemente todos los datos del sistema.
            </p>
            
            <Alert variant="danger" className="mb-3">
              <strong>Se eliminarán:</strong>
              <ul className="mt-2 mb-0">
                <li>Todos los productos</li>
                <li>Todos los movimientos</li>
                <li>Toda la configuración</li>
                <li>Categorías y ubicaciones</li>
                <li>Datos de sesión</li>
              </ul>
            </Alert>

            <Button 
              variant="danger" 
              onClick={handleClearAllData}
              className="w-100"
            >
              <FaTrash className="me-2" />
              Eliminar Todos los Datos
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    <Alert variant="info">
      <strong>💡 Recomendación:</strong> Realiza respaldos periódicos de tus datos para evitar pérdidas de información.
    </Alert>
  </div>
);

// Componente para gestionar categorías
const CategoryManager = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useApp();
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const success = addCategory(newCategory.trim());
      if (success) {
        setNewCategory('');
        toast.success('Categoría agregada correctamente');
      } else {
        toast.error('La categoría ya existe o está vacía');
      }
    }
  };

  const handleEditCategory = (oldName) => {
    setEditingCategory(oldName);
    setEditValue(oldName);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== editingCategory) {
      const success = updateCategory(editingCategory, editValue.trim());
      if (success) {
        setEditingCategory(null);
        setEditValue('');
        toast.success('Categoría actualizada correctamente');
      } else {
        toast.error('La categoría ya existe o está vacía');
      }
    } else {
      setEditingCategory(null);
      setEditValue('');
    }
  };

  const handleDeleteCategory = (categoryName) => {
    const result = deleteCategory(categoryName);
    if (result.success) {
      toast.success('Categoría eliminada correctamente');
    } else {
      toast.error(result.message);
    }
  };

  const getProductCount = (categoryName) => {
    return products.filter(p => p.category === categoryName).length;
  };

  return (
    <Card>
      <Card.Header>
        <h6 className="mb-0">Gestión de Categorías</h6>
      </Card.Header>
      <Card.Body>
        {/* Agregar nueva categoría */}
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Nueva categoría..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <Button variant="primary" onClick={handleAddCategory}>
            <FaPlus />
          </Button>
        </InputGroup>

        {/* Lista de categorías */}
        <ListGroup>
          {categories.map((category, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              {editingCategory === category ? (
                <div className="d-flex align-items-center gap-2 flex-grow-1">
                  <Form.Control
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    autoFocus
                  />
                  <Button variant="success" size="sm" onClick={handleSaveEdit}>
                    <FaCheck />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setEditingCategory(null)}
                  >
                    <FaTimes />
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <span>{category}</span>
                    <Badge bg="secondary" className="ms-2">
                      {getProductCount(category)} productos
                    </Badge>
                  </div>
                  <div className="d-flex gap-1">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      disabled={getProductCount(category) > 0}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>

        {categories.length === 0 && (
          <Alert variant="info" className="mt-3">
            No hay categorías definidas. Agrega la primera categoría.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

// Componente para gestionar ubicaciones
const LocationManager = () => {
  const { locations, addLocation, updateLocation, deleteLocation, products } = useApp();
  const [newLocation, setNewLocation] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      const success = addLocation(newLocation.trim());
      if (success) {
        setNewLocation('');
        toast.success('Ubicación agregada correctamente');
      } else {
        toast.error('La ubicación ya existe o está vacía');
      }
    }
  };

  const handleEditLocation = (oldName) => {
    setEditingLocation(oldName);
    setEditValue(oldName);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== editingLocation) {
      const success = updateLocation(editingLocation, editValue.trim());
      if (success) {
        setEditingLocation(null);
        setEditValue('');
        toast.success('Ubicación actualizada correctamente');
      } else {
        toast.error('La ubicación ya existe o está vacía');
      }
    } else {
      setEditingLocation(null);
      setEditValue('');
    }
  };

  const handleDeleteLocation = (locationName) => {
    const result = deleteLocation(locationName);
    if (result.success) {
      toast.success('Ubicación eliminada correctamente');
    } else {
      toast.error(result.message);
    }
  };

  const getProductCount = (locationName) => {
    return products.filter(p => p.location === locationName).length;
  };

  return (
    <Card>
      <Card.Header>
        <h6 className="mb-0">Gestión de Ubicaciones</h6>
      </Card.Header>
      <Card.Body>
        {/* Agregar nueva ubicación */}
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Nueva ubicación..."
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
          />
          <Button variant="primary" onClick={handleAddLocation}>
            <FaPlus />
          </Button>
        </InputGroup>

        {/* Lista de ubicaciones */}
        <ListGroup>
          {locations.map((location, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              {editingLocation === location ? (
                <div className="d-flex align-items-center gap-2 flex-grow-1">
                  <Form.Control
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    autoFocus
                  />
                  <Button variant="success" size="sm" onClick={handleSaveEdit}>
                    <FaCheck />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setEditingLocation(null)}
                  >
                    <FaTimes />
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <span>{location}</span>
                    <Badge bg="secondary" className="ms-2">
                      {getProductCount(location)} productos
                    </Badge>
                  </div>
                  <div className="d-flex gap-1">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEditLocation(location)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteLocation(location)}
                      disabled={getProductCount(location) > 0}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>

        {locations.length === 0 && (
          <Alert variant="info" className="mt-3">
            No hay ubicaciones definidas. Agrega la primera ubicación.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default Settings;