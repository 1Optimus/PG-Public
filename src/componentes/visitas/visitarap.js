import React, { useState, useEffect } from "react";
import { auth, db } from '../../fb';
import { Row, Col, Container, Form, Button, Alert } from 'react-bootstrap';
const Visitarap=(fech)=>{
    const [frecuente, setFrecuente] = useState([])
    const [fecha, setFecha] = useState("")
    const [tipoEntrada, setTipoEntrada] = useState('')
    const [visitante, setVisitante] = useState('0')
    const [err, setErr] = useState('')
    const [exito, setExito] = useState(false)
    //boton para registrar visita
    const registrar= async ()=>{
        if (visitante==='0') {          
            handleShow('No ha seleccionado visitante')
            return
        }
        if (!fecha.trim()) {
            handleShow('No ha seleccionado fecha')
            return
        }        
        if (!tipoEntrada.trim()) {
            handleShow('No ha seleccionado el tipo de entrada')
            return
        }
        var arrayFecha = fecha.split("T")   
        const agregarV ={
            visitante: visitante,
            cod:auth.currentUser.uid,
            fechaIngreso: arrayFecha[0],
            Hora: arrayFecha[1],
            Tipo: tipoEntrada,
            lote: auth.currentUser.displayName,
            Estado: "Pendiente"
        }
        try {
            await db.collection('Visitantes/' + auth.currentUser.uid + '/Historial')
            .add(agregarV)      
            setVisitante('0')            
            handleShow2()
        } catch (error) {
            if (error.code==='permission-denied') {
                handleShow('¡Ups!. Al parecer no tienes permiso para agregar visitas....')
            } else {
                handleShow('Ha ocurrido un error al realizar su proceso, si el problema persiste contacte al administrador')   
            }
        }         
    }
    const handleShow = ((error) => {//el del error
        setErr(error)
        setTimeout(() => {
            setErr('')
        }, 2000)
    })
    const handleShow2 = (() => {//el del enviado
        setExito(true)
        setTimeout(() => {
            setExito(false)
        }, 2000)
    })
    useEffect(() => {
        setFecha(fech.fech)
        let isCancelled = false;
        //lectura de datos de visitas registradas
        const obtenerRegistros = async ()=>{    
            try {
                await db.collection('residentes/' + auth.currentUser.uid + '/VisitantesFrec')
                .get().then((datos)=>{
                    if (!isCancelled) {
                        const arraydatos = datos.docs.map(doc=>({id: doc.id, ...doc.data()}))             
                        setFrecuente(arraydatos)
                      }                    
                })
                
            } catch (error) {
                if (error.code==='permission-denied') {
                    handleShow('¡Ups!. Al parecer no tienes permiso para agregar visitas....')
                } else {
                    console.log(error)
                    handleShow('Ha ocurrido un error al realizar su proceso, si el problema persiste contacte al administrador')   
                }
            }                   
        }
        obtenerRegistros()
        return () => {
            isCancelled = true;
          };          
    }, [fech.fech])
    return(
        <div className="vist pb-3 shadow">
            <Container className={frecuente.length === 0?('disabledbutton'):(null)}>
                <Row>
                    <Col className="pt-2">
                    <h2 align="center">Visitas frecuentes</h2>
                    <Form>  
                        <Row>
                            <Col className="d-flex justify-content-center mt-4 mb-md-4">                            
                            <select value={visitante} onChange={(e)=>{setVisitante(e.target.value)}}>
                            <option value="0">Seleccione</option>
                                 {
                                    frecuente.map(item => (
                                        <option key={item.id} value={item.visitante}>{item.visitante}</option>
                                    ))
                                }                            
                            </select>                            
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex justify-content-center mt-3 mb-3">
                                <Form.Check
                                type="radio"
                                label="Vehicular"
                                name="formHorizontalRadios"
                                className="mx-3"
                                onChange={(e)=>{setTipoEntrada('vehiculo')}}
                                />
                                <Form.Check
                                type="radio"
                                label="Peatonal"
                                name="formHorizontalRadios"
                                onChange={(e)=>{setTipoEntrada('peatonal')}}
                                />
                            </Col>
                        </Row>                         
                        <Row>
                            <Col className="col-12 mt-md-3 d-md-inline-flex pb-md-3">
                            <Col className="col-12 col-md-6 d-flex justify-content-center">                            
                                <input  
                                type="datetime-local"  
                                min={fech.fech} 
                                value={fecha}                                 
                                id="fecha"                        
                                onChange={(e)=>{setFecha(e.target.value)}}
                                />
                            </Col>                                
                            <Col className="col-12 col-md-6 d-flex justify-content-center pt-md-0 mt-3 mt-md-0">
                                <Button variant="primary" disabled={ frecuente.length === 0?(true):(false) }
                                onClick={registrar}
                                >
                                Registrar vista
                                </Button>
                            </Col>
                            </Col>
                        </Row>
                    </Form>
                    </Col>
                </Row>
                {
                   err!==""&&(
                    <Alert  variant="danger">
                        <center>{err}</center>
                    </Alert>
                   )                   
                } 
                {
                   exito && (
                    <Alert  variant="primary">
                        <center>Visita registrada</center>
                    </Alert> )                                     
                }
            </Container>            
        </div>
    )
}
export default Visitarap