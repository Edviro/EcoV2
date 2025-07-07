// src/components/MovementForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaSave, FaTimes, FaArrowUp, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa';
import { MOVEMENT_REASONS } from '../utils/mockData';

const MovementForm = ({ products, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    productId: '',
    type: 'entrada',
    quantity: '',
    reason: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Obtener producto seleccionado
  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p.id === Number(formData.productId));
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

  // Actualizar razones disponibles según el tipo
  useEffect(() => {
    if (formData.type && formData.reason) {
      const availableReasons = MOVEMENT_REASONS[formData.type] || [];
      if (!availableReasons.includes(formData.reason)) {
        setFormData(prev => ({ ...prev, reason: '' }));
      }
    }
  }, [formData.type, formData.reason]);

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

  const validateForm = () => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.productId) {
      newErrors.productId = 'Debe seleccionar un producto';
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.reason) {
      newErrors.reason = 'Debe seleccionar un motivo';
    }

    // Validar stock suficiente para salidas
    if (formData.type === 'salida' && selectedProduct && formData.quantity) {
      const requestedQuantity = Number(formData.quantity);
      if (requestedQuantity > selectedProduct.stock) {
        newErrors.quantity = `No hay suficiente stock. Disponible: ${selectedProduct.stock}`;
      }
    }

    // Validación de formato de cantidad
    if (formData.quantity && (isNaN(Number(formData.quantity)) || Number(formData.quantity) % 1 !== 0)) {
      newErrors.quantity = 'La cantidad debe ser un número entero válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const movementData = {
      productId: Number(formData.productId),
      product: selectedProduct.name,
      type: formData.type,
      quantity: Number(formData.quantity),
      reason: formData.reason,
      notes: formData.notes.trim()
    };

    onSubmit(movementData);
  };

  const getStockAfterMovement = () => {
    if (!selectedProduct || !formData.quantity) return null;
    
    const currentStock = selectedProduct.stock;
    const quantity = Number(formData.quantity);
    
    if (formData.type === 'entrada') {
      return currentStock + quantity;
    } else {
      return Math.max(0, currentStock - quantity);
    }
  };

  const stockAfterMovement = getStockAfterMovement();
  const willHaveLowStock = stockAfterMovement !== null && 
                          stockAfterMovement <= (selectedProduct?.minStock || 10);

  return (
    <Form onSubmit={handleSubmit}>
      {/* Tipo de movimiento */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Tipo de Movimiento</Form.Label>
        <div className="d-flex gap-3">
          <Form.Check
            type="radio"
            id="entrada"
            name="type"
            value="entrada"
            checked={formData.type === 'entrada'}
            onChange={handleChange}
            label={
              <span className="d-flex align-items-center gap-2">
                <FaArrowUp className="text-success" />
                <Badge bg="success">Entrada</Badge>
                <span>Aumentar stock</span>
              </span>
            }
          />
          <Form.Check
            type="radio"
            id="salida"
            name="type"
            value="salida"
            checked={formData.type === 'salida'}
            onChange={handleChange}
            label={
              <span className="d-flex align-items-center gap-2">
                <FaArrowDown className="text-danger" />
                <Badge bg="danger">Salida</Badge>
                <span>Reducir stock</span>
              </span>
            }
          />
        </div>
      </Form.Group>

      <Row>
        {/* Selección de producto */}
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Producto <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              isInvalid={!!errors.productId}
            >
              <option value="">Seleccionar producto...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku}) - Stock: {product.stock}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.productId}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        {/* Cantidad */}
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              min="1"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              isInvalid={!!errors.quantity}
            />
            <Form.Control.Feedback type="invalid">
              {errors.quantity}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Información del producto seleccionado */}
      {selectedProduct && (
        <Alert variant="info" className="mb-3">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="alert-heading mb-1">{selectedProduct.name}</h6>
              <div><small><strong>SKU:</strong> {selectedProduct.sku}</small></div>
              <div><small><strong>Categoría:</strong> {selectedProduct.category}</small></div>
              <div><small><strong>Ubicación:</strong> {selectedProduct.location}</small></div>
            </div>
            <div className="text-end">
              <div><small><strong>Stock actual:</strong></small></div>
              <div className="h5 mb-1">{selectedProduct.stock}</div>
              {stockAfterMovement !== null && (
                <div>
                  <small><strong>Stock después:</strong></small>
                  <div className={`fw-bold ${willHaveLowStock ? 'text-warning' : 'text-success'}`}>
                    {stockAfterMovement}
                    {willHaveLowStock && <FaExclamationTriangle className="ms-1" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Alerta de stock bajo */}
      {willHaveLowStock && formData.type === 'salida' && (
        <Alert variant="warning" className="mb-3">
          <FaExclamationTriangle className="me-2" />
          <strong>Advertencia:</strong> Después de este movimiento, el producto quedará con stock bajo.
        </Alert>
      )}

      {/* Motivo */}
      <Form.Group className="mb-3">
        <Form.Label>Motivo <span className="text-danger">*</span></Form.Label>
        <Form.Select
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          isInvalid={!!errors.reason}
        >
          <option value="">Seleccionar motivo...</option>
          {(MOVEMENT_REASONS[formData.type] || []).map(reason => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.reason}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Notas adicionales */}
      <Form.Group className="mb-4">
        <Form.Label>Notas Adicionales (Opcional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Información adicional sobre el movimiento..."
        />
      </Form.Group>

      {/* Resumen del movimiento */}
      {formData.productId && formData.quantity && formData.type && (
        <div className="bg-light p-3 rounded mb-4">
          <h6 className="mb-2">Resumen del Movimiento</h6>
          <div className="d-flex align-items-center gap-2 mb-2">
            {formData.type === 'entrada' ? 
              <FaArrowUp className="text-success" /> : 
              <FaArrowDown className="text-danger" />
            }
            <span className="fw-bold">
              {formData.type === 'entrada' ? 'ENTRADA' : 'SALIDA'} de {formData.quantity} unidades
            </span>
          </div>
          <div><strong>Producto:</strong> {selectedProduct?.name}</div>
          <div><strong>Motivo:</strong> {formData.reason}</div>
          {stockAfterMovement !== null && (
            <div><strong>Stock resultante:</strong> 
              <span className={willHaveLowStock ? 'text-warning' : 'text-success'}>
                {' '}{stockAfterMovement} unidades
              </span>
            </div>
          )}
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
          Registrar Movimiento
        </Button>
      </div>
    </Form>
  );
};

export default MovementForm;