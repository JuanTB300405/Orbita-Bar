import React from 'react';
import '../styles/Button.css';

const Button = ({ onClick, children, className = '', icon = null, type = 'button', variant = 'neutro' }) => {
    return (
        <button 
            type={type} 
            className={`boton ${variant} ${className}`} 
            onClick={onClick}
        >
            {icon && <span className="icono-boton">{icon}</span>}
            {children}
        </button>
    )
};

export default Button;