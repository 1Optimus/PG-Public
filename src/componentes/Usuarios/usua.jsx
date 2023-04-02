import React, { Fragment, useState, useEffect } from "react";
import { auth,db } from '../../fb';
import {withRouter} from 'react-router-dom';
import { Row, Col, Container, Form, Button,Alert,Spinner, ButtonGroup, ToggleButton} from 'react-bootstrap';
const Usua=(props)=>{
    const [user, setUser] = useState('')
    const [email, setEmail] = useState('')
    const [manz, setManz] = useState('0')
    const [lote, setLote] = useState(false)
    const [fallo, setFallo]= useState('')
    const [exito, setExito]= useState(false)
    const [procesando, setProcesando]= useState(false)
    const abc=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
    const [radioValue, setRadioValue] = useState('0');
    const radios = [
        { name: 'Activar visitas', value: '1' },
        { name: 'Desactivar visitas', value: '2' },
        { name: 'Cambio de contraseña', value: '3' },
        { name: 'Corrección de lote y manzana', value: '4' },
    ];
    const borrar= ()=>{
        setEmail('')
        setLote('')
        setManz('0')
    }
    const cambioContra= ()=>{
        setProcesando(true)
        if (email.trim()==="") {
            handleShow('Ingrese los datos requeridos, el campo de correo se encuentra vacio')
            return;
        }
        auth.sendPasswordResetEmail(email)
        .then(() => {
            handleShow2()            
            borrar()
        })
        .catch((error) => {   
            handleShow('No se logró realizar el cambio de correo, revise que el correo sea el correcto')
        });
    }
    const visit= async()=>{
        setProcesando(true)
        if (email.trim()==="") {
            handleShow('Ingrese los datos requeridos, el campo de correo se encuentra vacio')
            return;
        }
        const datos = db.collection('residentes');
        const snapshot=[]
        try {                        
            await datos.where('email', '==', email)
            .get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {                            
                    snapshot.push(doc.data());
                });
            });
            if (snapshot.length===0) {
                handleShow('No se encontraron los datos en la base de datos')
                return;
            } 
        } catch (error) {
            console.log(error)
            return;
        }
        if (radioValue==='1') {
            try {
                await datos.doc(snapshot[0].uid).update({
                    estado:true                    
                  });
                  handleShow2()
            } catch (error) {
                handleShow('No se logro llevar a activar las visitas')
                console.log(error)
                return; 
            }            
        } else {
            try {
                await datos.doc(snapshot[0].uid).update({
                    estado:false                    
                  });
                  handleShow2()  
            } catch (error) {
                handleShow('No se logro llevar a activar las visitas')
                console.log(error)
                return;                
            } 
        }
        borrar()        
    }
    const correccion= async()=>{
        setProcesando(true)
        if (email.trim()==="") {
            handleShow('Ingrese los datos requeridos, el campo de correo se encuentra vacio')
            return;
        }
        if (manz.trim()==="0") {
            handleShow('Ingrese los datos requeridos, el campo de manzana se encuentra vacio')
            return;
        }
        if (lote.trim()==="") {
            handleShow('Ingrese los datos requeridos, el campo de lote se encuentra vacio')
            return;
        }        
        const datos = db.collection('residentes');
        const datos2 = db.collection('control');
        const snapshot=[]
        try {                        
            await datos.where('email', '==', email)
            .get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {                            
                    snapshot.push(doc.data());
                });
            });
            if (snapshot.length===0) {
                handleShow('No se encontraron los datos en la base de datos')
                return;
            } 
        } catch (error) {
            console.log(error)
            return;
        }
        try {
            await datos.doc(snapshot[0].uid).update({
                lote:lote,
                manzana:manz
                });
                await datos2.doc(snapshot[0].uid).update({
                    lote:lote,
                    manzana:manz
                });
                handleShow2()
        } catch (error) {
            handleShow('No se logro llevar a activar las visitas')
            console.log(error)
            return; 
        }            
        borrar() 
    }
    useEffect(() => {
        if(auth.currentUser){
            setUser(auth.currentUser)
            if (auth.currentUser.displayName!=="Z1") {
                switch (auth.currentUser.displayName) {
                    case "Z2":
                        props.history.push('/visual')
                        break;
                    case "Z3":
                        props.history.push('/Visualizacion')  
                        break;                        
                    default:
                        props.history.push('/estado')
                        break;
                }    
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
            <h2 align="center" className="mb-4">Gestion de usuarios</h2>
            <Container fluid>
            <Row>
            <Col className="d-flex ini py-2 justify-content-around  col-md-8 col-12 offset-md-2">            
            <ButtonGroup>
                {radios.map((radio, idx) => (
                <ToggleButton
                    key={idx}
                    id={`radio-${idx}`}
                    type="radio"
                    variant={idx % 2 ? 'outline-success' : 'outline-primary'}
                    name="radio"
                    size="sm"
                    value={radio.value}
                    checked={radioValue === radio.value}
                    onChange={(e) => {setRadioValue(e.currentTarget.value);borrar()}}
                >
                    {radio.name}
                </ToggleButton>
                ))}
            </ButtonGroup>
            </Col>            
            </Row>            
            {(radioValue==='1' || radioValue==='2') &&(
                <Row>
                <Col className="ini col-10 offset-1 col-md-8 offset-md-2 py-3 mt-3">  
                <Row>
                    <Col className="d-flex justify-content-center">
                        <Form.Control type="email" 
                            placeholder="Ingrese el correo del residente"
                            id="correo"
                            value={email}
                            className="w-50"
                            onChange={(e)=>{setEmail(e.target.value)}}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex justify-content-center pt-3">
                        <Button 
                        variant= {radioValue==='1'?('success'):('danger')}
                        className="w-50"
                        onClick={()=>visit()}
                        >
                        {radioValue==='1'?('Activar visitas'):('Desactivar visitas')}
                        </Button>
                    </Col>
                </Row>
                        
                                                       
                </Col> 
                </Row>
            )}        
            {radioValue==='3'&&(
                <Row>
                <Col className="ini col-10 offset-1 col-md-8 offset-md-2 d-flex justify-content-around py-3 mt-3">                     
                        <Form.Control type="email" 
                            placeholder="Ingrese el correo del residente"
                            id="correo2"
                            value={email}
                            className="w-50"
                            onChange={(e)=>{setEmail(e.target.value)}}
                        />
                        <Button 
                        variant='success'
                        className="w-25"
                        onClick={()=>cambioContra()}
                        >
                        Realizar cambio
                        </Button>                               
                </Col> 
                </Row>
            )}
            {radioValue==='4'&&(
                <Row>
                <Col className="ini col-10 offset-1 col-md-8 offset-md-2 py-3 mt-3">
                    <Row>
                        <Col className="col-12 col-md-6 offset-md-3">
                        <Form.Control type="email" 
                            placeholder="Ingrese el correo del residente"
                            id="correo"
                            value={email}
                            onChange={(e)=>{setEmail(e.target.value)}}
                        />
                            <select 
                            className="mt-2"
                            onChange={(e)=>{setManz(e.target.value)}} 
                            value={manz}>                                
                            <option value="0" key="0" defaultValue>Seleccione manzana nuevamente</option>
                            {
                            abc.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))
                            }
                        </select> 
                        </Col>
                    </Row>                                        
                    <Row>
                        <Col className="col-12 col-md-6 offset-md-3">
                            <Form.Control 
                            type="number" 
                            className="mt-2"
                            placeholder="# Lote nuevo"
                            min="1"
                            onChange={(e)=>{setLote(e.target.value)}} 
                            value={lote}/>                   
                            <center><Button
                            className="mt-2" 
                            variant= 'success'
                            onClick={()=>correccion()}
                            >
                            Realizar correción
                            </Button> </center>
                        </Col>
                    </Row>                                                   
                </Col>                 
                </Row>
            )} 
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
export default withRouter(Usua)