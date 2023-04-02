import React, { Fragment, useState, useEffect } from "react";
import { auth } from '../fb';
import {withRouter} from 'react-router-dom';
import { Row, Col, Container, Form, Button,Alert,Spinner} from 'react-bootstrap';
const Inicio=(props)=>{
    const [user, setUser] = useState('')
    const [contra, setContra] = useState('')
    const [contra2, setContra2] = useState('')
    const [fallo, setFallo]= useState('')
    const [exito, setExito]= useState(false)
    const [procesando, setProcesando]= useState(false)    
    const borrar= ()=>{
        setContra('')
        setContra2('')
    }
    const cambioContra= ()=>{
        setProcesando(true)
        if (contra.trim()===""&& contra2.trim()==="") {
            handleShow('Ingrese los datos requeridos')
            return;
        }
        if (contra===contra2) {
            user.updatePassword(contra).then(() => {
                handleShow2()            
                borrar()
              }).catch((error) => {
                handleShow('El cambio de contraseña no se logro llevar a cabo')
                return;
              });
        }
    }
    useEffect(() => {
        if(auth.currentUser){
            setUser(auth.currentUser)
            if(auth.currentUser.displayName==="Z2"){
                props.history.push('/visual')
            }
        }else{
            props.history.push('/login')
        }
    }, [props.history])
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
    return(
        <Fragment>
            {
                user && (
                    <p>{}</p>
                )
            }
            <h2 align="center" className="mb-4">Cambio de contraseña</h2>
            <Container fluid>               
                <Row>
                <Col className="ini col-10 offset-1 col-md-8 offset-md-2 py-3 mt-3">
                    <Row>
                        <Col className="col-12 col-md-6 offset-md-3">
                        <Form.Control type="password" 
                            placeholder="Ingrese su nueva contraseña"
                            id="correo"
                            value={contra}
                            onChange={(e)=>{setContra(e.target.value)}}
                        />
                        </Col>
                    </Row>                                        
                    <Row>
                        <Col className="col-12 col-md-6 offset-md-3">
                            <Form.Control 
                            type="password" 
                            className="mt-2"
                            placeholder="Digite nuevamente su nueva contraseña"
                            onChange={(e)=>{setContra2(e.target.value)}} 
                            value={contra2}/>                   
                            <center><Button
                            className="mt-2" 
                            variant= 'success'
                            onClick={()=>cambioContra()}
                            >
                            Realizar Cambio de contraseña
                            </Button> </center>
                        </Col>
                    </Row>                                                   
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