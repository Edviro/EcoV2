// src/components/QuickMovement.jsx
import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaMinus, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import toast from 'react-hot-toast';

const QuickMovement = ({ products, onSubmit }) => {
  const [quickEntries, setQuickEntries] = useState({});
  const [quickExits, setQuickExits] = useState({});

  const handleQuickChange = (productId, value, type) => {
    const quantity = Math.max(0, Number(value) || 0);
    
    if (type === 'entrada') {
      setQuickEntries(prev => ({
        ...prev,
        [productId]: quantity
      }));
    } else {
      setQuickExits(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const handleQuickSubmit = (productId, type) => {
    const quantities = type === 'entrada' ? quickEntries : quickExits;
    const quantity = quantities[productId];
    
    if (!quantity || quantity <= 0) {
      toast.error('Ingresa una cantidad válida');
      return;
    }

    const product = products.find(p => p.id === productId);
    
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    // Validar stock para salidas
    if (type === 'salida' && quantity > product.stock) {
      toast.error(`No hay suficiente stock. Disponible: ${product.stock}`);
      return;
    }

    const movementData = {
      productId: product.id,
      product: product.name,
      type: type,
      quantity: quantity,
      reason: type === 'entrada' ? 'Entrada rápida' : 'Salida rápida'
    };

    onSubmit(movementData);

    // Limpiar el campo después del envío
    if (type === 'entrada') {
      setQuickEntries(prev => ({ ...prev, [productId]: 0 }));
    } else {
      setQuickExits(prev => ({ ...prev, [productId]: 0 }));
    }
  };

  const getStockStatus = (stock, minStock = 10) => {
    if (stock <= 0) return { variant: 'danger', text: 'Sin Stock' };
    if (stock <= minStock) return { variant: 'warning', text: 'Stock Bajo' };
    return { variant: 'success', text: 'Normal' };
  };

  return (
    <div>
      <div className="mb-4">
        <h5>Movimiento Rápido</h5>
        <p className="text-muted">
          Registra entradas y salidas de manera rápida. Ideal para movimientos frecuentes y ventas directas.
        </p>
      </div>

      {products.length === 0 ? (
        <Alert variant="info">
          No hay productos disponibles para registrar movimientos.
        </Alert>
      ) : (
        <Row>
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock, product.minStock);
            const entryQuantity = quickEntries[product.id] || '';
            const exitQuantity = quickExits[product.id] || '';

            return (
              <Col md={6} lg={4} key={product.id} className="mb-4">
                <Card className="h-100">
                  <Card.Body>
                    {/* Info del producto */}
                    <div className="mb-3">
                      <h6 className="mb-1">{product.name}</h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{product.sku}</small>
                        <div className="text-end">
                          <div className="fw-bold">Stock: {product.stock}</div>
                          <span className={`badge bg-${stockStatus.variant}`}>
                            {stockStatus.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Entrada rápida */}
                    <div className="mb-3">
                      <Form.Label className="small text-success fw-bold">
                        <FaArrowUp className="me-1" />
                        Entrada
                      </Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="number"
                          min="0"
                          placeholder="0"
                          value={entryQuantity}
                          onChange={(e) => handleQuickChange(product.id, e.target.value, 'entrada')}
                          size="sm"
                        />
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleQuickSubmit(product.id, 'entrada')}
                          disabled={!entryQuantity || entryQuantity <= 0}
                        >
                          <FaPlus />
                        </Button>
                      </div>
                    </div>

                    {/* Salida rápida */}
                    <div>
                      <Form.Label className="small text-danger fw-bold">
                        <FaArrowDown className="me-1" />
                        Salida
                      </Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="number"
                          min="0"
                          max={product.stock}
                          placeholder="0"
                          value={exitQuantity}
                          onChange={(e) => handleQuickChange(product.id, e.target.value, 'salida')}
                          size="sm"
                          disabled={product.stock <= 0}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleQuickSubmit(product.id, 'salida')}
                          disabled={!exitQuantity || exitQuantity <= 0 || product.stock <= 0}
                        >
                          <FaMinus />
                        </Button>
                      </div>
                      {product.stock <= 0 && (
                        <small className="text-danger">Sin stock disponible</small>
                      )}
                    </div>

                    {/* Vista previa */}
                    {(entryQuantity > 0 || exitQuantity > 0) && (
                      <div className="mt-3 p-2 bg-light rounded">
                        <small>
                          <strong>Resultado:</strong>
                          {entryQuantity > 0 && (
                            <div className="text-success">
                              +{entryQuantity} → Stock: {product.stock + Number(entryQuantity)}
                            </div>
                          )}
                          {exitQuantity > 0 && (
                            <div className="text-danger">
                              -{exitQuantity} → Stock: {Math.max(0, product.stock - Number(exitQuantity))}
                            </div>
                          )}
                        </small>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Información de ayuda */}
      <Alert variant="info" className="mt-4">
        <div className="d-flex align-items-start gap-2">
          <div>
            <strong>💡 Consejos para movimientos rápidos:</strong>
            <ul className="mt-2 mb-0 small">
              <li>Las entradas se registran con motivo "Entrada rápida"</li>
              <li>Las salidas se registran con motivo "Salida rápida"</li>
              <li>Para movimientos detallados, usa el formulario completo</li>
              <li>Los productos sin stock no permiten salidas</li>
            </ul>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default QuickMovement;