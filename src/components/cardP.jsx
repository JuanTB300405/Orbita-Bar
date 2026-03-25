import React from 'react';
import { useState } from "react";
import "../styles/CardP.css"

const CardP = ({img, nombre, precio} ) => {
    const [contador, setContador] = useState(1);
        const agregar = () => {
            setContador(contador + 1);
        }
        const restar = () => {
            if (contador > 0) {
                setContador(contador - 1);
            }
        }

  return (
    <section className="card">
        <img src={img} alt="" />
        <h2>{nombre}</h2>
        <section className='card_Precio'>
            <section className='precio'>
             <p>${( precio * contador).toFixed(2)} <span>$</span></p>
            </section>
            <p><span>X</span>{contador}</p>
            <button className='btnV' onClick={agregar}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor"> <path d="M12 5l0 14"></path><path d="M5 12l14 0"></path></svg></button>
            <button className='btnR' onClick={restar}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2"> <path d="M5 12l14 0"></path> </svg> </button>
               
        </section>

    </section>
  );
};

export default CardP;