// src/components/Modal.jsx
import React from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ 
  show, 
  onHide, 
  title, 
  children, 
  size = 'md',
  backdrop = true,
  keyboard = true,
  centered = true 
}) => {
  return (
    <BootstrapModal
      show={show}
      onHide={onHide}
      size={size}
      backdrop={backdrop}
      keyboard={keyboard}
      centered={centered}
    >
      <BootstrapModal.Header 
        className="d-flex justify-content-between align-items-center"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <BootstrapModal.Title 
          className="mb-0 d-flex align-items-center gap-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </BootstrapModal.Title>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onHide}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <FaTimes />
        </button>
      </BootstrapModal.Header>
      
      <BootstrapModal.Body 
        style={{ 
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)'
        }}
      >
        {children}
      </BootstrapModal.Body>
    </BootstrapModal>
  );
};

export default Modal;