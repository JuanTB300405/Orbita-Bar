import { useState, useEffect, useRef } from "react";
import {consultaMesas} from "../js/mesa";
import '../styles/GestionMesas.css';

const GestionMesas = () => {

    const [cargando, setCargando] = useState(false);
    const [MesasData, setMesasData] = useState([]);

    const obtenerMesas = async () => {
        try {
            const MesasD = await consultaMesas();
            if (MesasD != null) {
                setMesasData(MesasD);
            } else {
                console.error("Respuesta inesperada:", MesasD);
            }
        } catch (error) {
            console.error("Error en la consulta:", error);
        } finally {
            setCargando(false);
        }
    };
    
    useEffect(() => {
        obtenerMesas();
    }, []);

    if (cargando) {
        return (
            <div className="gm-loading">
                <div className="gm-loader" />
                <p className="gm-loading-text">CARGANDO GESTION DE MESAS...</p>
            </div>
        );
    }

    return (
        <>
            <div className="gm-page">

                <div className="gm-header">
                    <div className="gm-header-left">
                        <div className="gm-status">
                            <span className="gm-status-dot" />
                            <span className="gm-status-text">SISTEMA ACTIVO</span>
                        </div>
                        <h2 className="gm-title">Gestion de Mesas</h2>
                    </div>
                    <div className="gm-header-right">
                        <button className="gm-btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10" />
                                <polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            ACTUALIZAR
                        </button>
                    </div>
                </div>

                <div className="gm-contenido">
                    {MesasData.length > 0 ? (
                        MesasData.map((mesa, index) => (
                            <div key={index} className="gm-mesa">
                                <h3 className="gm-mesa-name">{mesa.numero}</h3>
                                <p className="gm-mesa-capacidad">Capacidad: {mesa.capacidad}</p>
                                <p className="gm-mesa-estado">Estado: {mesa.estado ? "Disponible" : "Ocupada"}</p>
                            </div>
                        ))) 
                        : 
                        (
                            <p className="gm-no-mesas">No hay mesas disponibles.</p>
                        )
                    }
                </div>

            </div>
        </>
    );
}

export default GestionMesas;