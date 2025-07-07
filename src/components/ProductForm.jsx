// src/components/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { FaSave, FaTimes, FaBarcode, FaBox, FaDollarSign } from 'react-icons/fa';
import { useApp } from '../context/AppContext';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const { settings, categories, locations } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: categories[0] || '',
    location: locations[0] || '',
    price: '',
    stock: '',
    minStock: settings.lowStockThreshold,
    description: ''
  });

  const [errors, setErrors] = useState({});

  // Cargar datos del producto si estamos editando
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || categories[0] || '',
        location: product.location || locations[0] || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        minStock: product.minStock || settings.lowStockThreshold,
        description: product.description || ''
      });
    }
  }, [product, settings.lowStockThreshold, categories, locations]);

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

  const generateSKU = () => {
    if (!formData.name || !formData.category) return;
    
    const namePart = formData.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    
    const categoryPart = formData.category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const generatedSKU = `${categoryPart}-${namePart}-${randomPart}`;
    
    setFormData(prev => ({
      ...prev,
      sku: generatedSKU
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'El SKU es requerido';
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.stock || Number(formData.stock) < 0) {
      newErrors.stock = 'El stock debe ser mayor o igual a 0';
    }

    if (!formData.minStock || Number(formData.minStock) < 0) {
      newErrors.minStock = 'El stock mínimo debe ser mayor o igual a 0';
    }

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = 'El precio debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      initialStock: !product ? Number(formData.stock) : undefined
    };

    onSubmit(productData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Producto <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Arena Perlada 5 kg"
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>SKU <span className="text-danger">*</span></Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Ej: AP-5KG-001"
                isInvalid={!!errors.sku}
              />
              <Button 
                variant="outline-secondary" 
                onClick={generateSKU}
                disabled={!formData.name || !formData.category}
              >
                <FaBarcode />
              </Button>
            </InputGroup>
            {errors.sku && <div className="invalid-feedback d-block">{errors.sku}</div>}
            <Form.Text className="text-muted">
              O haz clic en el botón para generar automáticamente
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.length > 0 ? (
                categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))
              ) : (
                <option value="">No hay categorías disponibles</option>
              )}
            </Form.Select>
            <Form.Text className="text-muted">
              Las categorías se gestionan en Configuración → Sistema
            </Form.Text>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Ubicación</Form.Label>
            <Form.Select
              name="location"
              value={formData.location}
              onChange={handleChange}
            >
              {locations.length > 0 ? (
                locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))
              ) : (
                <option value="">No hay ubicaciones disponibles</option>
              )}
            </Form.Select>
            <Form.Text className="text-muted">
              Las ubicaciones se gestionan en Configuración → Sistema
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Precio Unitario ({settings.currencySymbol}) <span className="text-danger">*</span></Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaDollarSign />
              </InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                isInvalid={!!errors.price}
              />
            </InputGroup>
            {errors.price && <div className="invalid-feedback d-block">{errors.price}</div>}
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Stock Actual <span className="text-danger">*</span></Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaBox />
              </InputGroup.Text>
              <Form.Control
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                isInvalid={!!errors.stock}
              />
            </InputGroup>
            {errors.stock && <div className="invalid-feedback d-block">{errors.stock}</div>}
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Stock Mínimo</Form.Label>
            <Form.Control
              type="number"
              min="0"
              name="minStock"
              value={formData.minStock}
              onChange={handleChange}
              placeholder={settings.lowStockThreshold.toString()}
              isInvalid={!!errors.minStock}
            />
            {errors.minStock && <div className="invalid-feedback d-block">{errors.minStock}</div>}
            <Form.Text className="text-muted">
              Alerta cuando el stock sea menor o igual a este valor
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label>Descripción (Opcional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción adicional del producto..."
        />
      </Form.Group>

      {/* Vista previa del valor total */}
      {formData.price && formData.stock && (
        <div className="bg-light p-3 rounded mb-4">
          <h6 className="mb-2">Vista Previa</h6>
          <div className="d-flex justify-content-between">
            <span>Valor unitario:</span>
            <span>{settings.currencySymbol} {Number(formData.price).toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Stock:</span>
            <span>{formData.stock} unidades</span>
          </div>
          <hr />
          <div className="d-flex justify-content-between fw-bold">
            <span>Valor total del inventario:</span>
            <span>{settings.currencySymbol} {(Number(formData.price) * Number(formData.stock)).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="d-flex gap-2 justify-content-end">
        <Button variant="secondary" onClick={onCancel}>
          <FaTimes className="me-2" />
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          <FaSave className="me-2" />
          {product ? 'Actualizar' : 'Guardar'} Producto
        </Button>
      </div>
    </Form>
  );
};

export default ProductForm;