import React, { Fragment, useState, useEffect } from "react";
import { auth, db } from '../fb';
import {withRouter} from 'react-router-dom';
import { Row, Col, Container, Alert,  Spinner, ToggleButton, ButtonGroup} from 'react-bootstrap';
const Inicio=(props)=>{
    const [user, setUser] = useState('')
    const [fallo, setFallo]= useState('')
    const [exito, setExito]= useState(false)
    const [procesando, setProcesando]= useState(false)
    const [piscina, setPiscina]=useState(2)
    const [visitas, setVisitas]=useState(2)
    const [pagos, setPagos]=useState(2)
    const modEstado=async(camb,consulta)=>{
        var cambio=""
        try {
            if (camb==="visita") {
                cambio=(consulta===1?(true):(false))
                await db.collection('modulos').doc('estados').update({Visitas: cambio});
            }
            if (camb==="pagos") {
                cambio=(consulta===1?(true):(false))
                await db.collection('modulos').doc('estados').update({Pagos: cambio});
            }
            if (camb==="piscina") {
                cambio=(consulta===1?(true):(false))
                await db.collection('modulos').doc('estados').update({Piscina: cambio});
            }   
            handleShow2("Cambio realizado con éxito")
        } catch (error) {
            console.log(error)
            handleShow("Ha ocurrido un error, los cambios no se lograron llevar a cabo")
        }        
    }        
    const obtenerRegistros = async ()=>{    
        try {
            const datos= await db.collection('modulos').doc('estados').get()
            if (!datos.exists) {
                handleShow('No se encontra la información..., contacte al administrador');
              } else {
                if (datos.data().Visitas) {setVisitas(1)} else {setVisitas(2)}                
                if (datos.data().Pagos) {setPagos(1)} else {setPagos(2)}                
                if (datos.data().Piscina) {setPiscina(1)} else {setPiscina(2)}                
              }
        } catch (error) {
            console.log(error)
            if (error.code==='permission-denied') {
                handleShow('¡Ups!. Al parecer no tienes permiso....')
            } else {
                console.log(error)
                handleShow('Ha ocurrido un error al realizar su proceso, si el problema persiste contacte al administrador')   
            }
        }                   
    }
    const handleShow = ((error) => {//el del error
        setProcesando(false)
        setFallo(error)
        setTimeout(() => {
            setFallo('')
        }, 2000)
    })
    const handleShow2 = (() => {//el del enviado
        setProcesando(false)
        setExito(true)
        setTimeout(() => {
            setExito(false)
        }, 2000)
    })
    useEffect(() => {
        if(auth.currentUser){
            setUser(auth.currentUser)
            if(auth.currentUser.displayName==="Z2"){
                props.history.push('/visual')
            }
        }else{
            props.history.push('/login')
        }
        obtenerRegistros()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.history])
return(
    <Fragment>
        {
            user && (
                <p>{}</p>
            )
        }
        <Container fluid>               
            <Row className="ini mx-2">
                <Col className="col-12 col-md-4 py-3">
                     <h2 align="center" className="mb-4">Visitas</h2>
                     <center><ButtonGroup>
                        <ToggleButton
                            key="1"
                            id="1"
                            type="checkbox"
                            variant='outline-success'
                            name="radioVisitas1"
                            value="visita"
                            checked={1 === visitas}
                            onClick={() => {setVisitas(1);modEstado("visita",1)}}
                        >
                            Activar
                        </ToggleButton>
                    </ButtonGroup>
                    <ButtonGroup>
                        <ToggleButton
                            key="2"
                            id="2"
                            type="checkbox"
                            variant='outline-danger'
                            name="radioVisitas2"
                            value="visita"
                            checked={2 === visitas}
                            onClick={() => {setVisitas(2);modEstado("visita",2)}}
                        >
                            Desactivar
                        </ToggleButton>
                    </ButtonGroup></center>
                </Col>
                <Col className="col-12 col-md-4 py-3">
                    <h2 align="center" className="mb-4">Pagos</h2>
                    <center><ButtonGroup>
                        <ToggleButton
                            key="3"
                            id="3"
                            type="radio"
                            variant='outline-success'
                            name="radioVisitas3"
                            value="pagos"
                            checked={1 === pagos}
                            onClick={() => {setPagos(1);modEstado("pagos",1)}}
                        >
                            Activar
                        </ToggleButton>
                    </ButtonGroup>
                    <ButtonGroup>
                        <ToggleButton
                            key="4"
                            id="4"
                            type="radio"
                            variant='outline-danger'
                            name="radioVisitas4"
                            value="pagos"
                            checked={2 === pagos}
                            onClick={() => {setPagos(2);modEstado("pagos",2)}}
                        >
                            Desactivar
                        </ToggleButton>
                    </ButtonGroup></center>
                </Col>
                <Col className="col-12 col-md-4 py-3">
                    <h2 align="center" className="mb-4">Piscinas</h2>
                    <center><ButtonGroup>
                        <ToggleButton
                            key="5"
                            id="5"
                            type="radio"
                            variant='outline-success'
                            name="radioVisitas5"
                            value="piscina"
                            checked={1 === piscina}
                            onClick={() => {setPiscina(1);modEstado("piscina",1)}}
                        >
                            Activar
                        </ToggleButton>
                    </ButtonGroup>
                    <ButtonGroup>
                        <ToggleButton
                            key="6"
                            id="6"
                            type="radio"
                            variant='outline-danger'
                            name="radioVisitas6"
                            value="piscina"
                            checked={2 === piscina}
                            onClick={() => {setPiscina(2);modEstado("piscina",2)}}
                        >
                            Desactivar
                        </ToggleButton>
                    </ButtonGroup></center>
                </Col>                
            </Row>
        {
            procesando&&(
                <center><Spinner animation="border" /></center>
            )
        }            
        {fallo!==''&&(
            <center><Alert variant='danger' className="w-50 h-25">
            {fallo}
            </Alert></center>
        )} 
        {exito&&(
            <center><Alert variant='success' className="w-50 h-25">
            La operación se realizó con éxito
            </Alert></center>
        )}             
        </Container>            
    </Fragment>
)
}
export default withRouter(Inicio)