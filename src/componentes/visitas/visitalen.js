import React, { useState, useEffect } from "react";
import { auth, db } from '../../fb';
import { Row, Col, Container, Form, Button, Alert } from 'react-bootstrap';
const Visitalen=(fech)=>{
    const [visita, setVisita] = useState('')
    const [fecha, setFecha] = useState('')
    const [tipoEntrada, setTipoEntrada] = useState('')
    const [registro, setRegistro] = useState(false)    
    const [err, setErr] = useState('')
    const [exito, setExito] = useState(false)
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
    //registro de la visita
    const Registrar = async ()=>{
        if (!visita.trim()) {
            handleShow('El campo de la visita se encuentra vacio')          
            return
        }        
        if (!fecha.trim()) {
            handleShow('No ha seleccionado fecha')
            return
        }        
        if (!tipoEntrada.trim()) {
            handleShow('No ha seleccionado tipo de entrada')
            return
        }                    
        //separador de hora y fecha
        var arrayFecha = fecha.split("T")   
        const agregarR ={
            visitante: visita,
            Tipo: tipoEntrada
        }
        const agregarV ={
            visitante: visita,
            cod:auth.currentUser.uid,
            fechaIngreso: arrayFecha[0],
            Hora: arrayFecha[1],
            Tipo: tipoEntrada,
            lote: auth.currentUser.displayName,
            Estado: "Pendiente"
        }
        if (registro) {
            try {
                await db.collection('Visitantes/' + auth.currentUser.uid + '/Historial')
                .add(agregarV)
                await db.collection('residentes/' + auth.currentUser.uid + '/VisitantesFrec')
                .add(agregarR)                
                setVisita('')
                setRegistro(false)
                handleShow2()
            } catch (error) {
                if (error.code==='permission-denied') {
                    handleShow('¡Ups!. Al parecer no tienes permiso para agregar visitas....')
                } else {
                    handleShow('Ha ocurrido un error al realizar su proceso, si el problema persiste contacte al administrador')   
                }
            } 
        } else {
            try {                
                await db.collection('Visitantes/' + auth.currentUser.uid + '/Historial')
                .add(agregarV)            
                setVisita('')
                setRegistro(false)
                handleShow2()
            } catch (error) {
            if (error.code==='permission-denied') {
                handleShow('¡Ups!. Al parecer no tienes permiso para agregar visitas....')
            } else {
                handleShow('Ha ocurrido un error al realizar su proceso, si el problema persiste contacte al administrador')   
            }            
            }
        }    
    }
    useEffect(()=>{
        setFecha(fech.fech)
    }, [fech.fech])
    return(
        <div className="vist pb-3 shadow">
        <Container>
                <Row>
                <Col className="pt-2">
                    <h2 align="center">Nueva visita</h2>
                    <Form>  
                        <Row>
                            <Col className="d-flex justify-content-center mt-3">                            
                            <Form.Control 
                            type="text" 
                            value={visita}
                            onChange={(e)=>{setVisita(e.target.value)}}
                            placeholder="Ingresar nombre de la persona o nombre del servicio"
                             />                            
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex justify-content-center mt-3">
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
                            <Col className="d-flex justify-content-center mt-3">
                            <Form.Check 
                            type="checkbox" 
                            size="sm" 
                            checked={registro} 
                            onChange={()=>{setRegistro(!registro)}}
                            label="Recordar este registro" />
                            </Col>
                        </Row>                    
                        <Row>
                            <Col className="col-12 mt-3 d-md-inline-flex">
                            <Col className="col-12 col-md-6 d-flex justify-content-center">                            
                                <input  
                                type="datetime-local"
                                className="h-75" 
                                id="fecha"
                                value={fecha}
                                min={fech.fech}
                                onChange={(e)=>{setFecha(e.target.value)}}
                                />
                            </Col>                                
                            <Col className="col-12 col-md-6 d-flex justify-content-center mt-3 mt-md-0 pt-md-0 py-md-2">                            
                                <Button 
                                variant="primary"
                                onClick={Registrar}
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
                   err!=="" && (
                    <Alert  variant="danger">
                        <center>{err}</center>
                    </Alert>
                   )                   
                } 
                {
                   exito && (
                    <Alert  variant="primary">
                        <center>Visita registrada</center>
                    </Alert>
                   )                  
                }
            </Container>        
    </div>
    )
}
export default Visitalen