import React, { Fragment, useState, useEffect } from "react";
import { Row, Col, Container, Button, Alert, Card, Spinner,Form } from 'react-bootstrap';
import { auth, db } from '../fb';
import {withRouter} from 'react-router-dom'
import Logo from './figuras/encontrar.svg';
const Visual=(props)=>{
    const [user, setUser] = useState(null)   
    const [historial, setHistorial] = useState([])
    const [cargando, setCargando] = useState(true)
    const [fallo, setFallo] = useState('')
    const [buscado, setBuscado] = useState('')
    //cambio de estado a finalizado de visita, debido a que ingreso
    const confirmar=(id,codigo)=>{
        try {
            db.collection('Visitantes/'+codigo+'/Historial')
            .doc(id).update({
                Estado: "Finalizado"
            })  
        } catch (error) {
            console.log(error.code)
            handleShow('Ha ocurrido un error, si persiste contacte con el administrador')   
        }            
    } 
    const handleShow = ((error) => {//el del error
        setFallo(error)
        setTimeout(() => {
            setFallo('')
        }, 4000)
    })
    //obtencin de fecha actual
    const getCurrentDate=(separator='-')=>{
        let newDate = new Date()
        let date = newDate.getDate();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        return `${year}${separator}${month<10?`0${month}`:`${month}`}${separator}${date<10?`0${date}`:`${date}`}`
        }
        //ordenar datos para separar los finalizados
        function compareHora( a, b ) {
            if ( a.Hora < b.Hora ){
              return -1;
            }
            if ( a.Hora > b.Hora ){
              return 1;
            }
            return 0;
          }
        function compare( a, b ) {
            if ( a.Estado < b.Estado ){
              return 1;
            }
            if ( a.Estado > b.Estado ){
              return -1;
            }
            return 0;
          }                    
    useEffect(() => {
        var isCancelled = false;
        if(auth.currentUser){
            setUser(auth.currentUser)
            if (auth.currentUser.displayName!=="Z2") {
                switch (auth.currentUser.displayName) {
                    case "Z1":
                        props.history.push('/histopiscina')
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
        var hoy=getCurrentDate();
        try {
            db.collectionGroup("Historial").where('fechaIngreso', '==', hoy)
            .onSnapshot(function(querySnapshot) {
                if (!isCancelled) {
                    var datos = [];
                    querySnapshot.forEach(function(doc) {
                    datos.push({id: doc.id, ...doc.data()});
                    });
                  }
                  if(typeof datos !== 'undefined'){                   
                    if(datos.length>0){
                        datos.sort(compareHora);
                        datos.sort(compare);            
                        setHistorial(datos)
                      }
                  }  
                  setCargando(false)                                    
            });   
        } catch (error) {
        }        
        return () => {
            isCancelled = true;
          };
    }, [props.history])
    return(
        <Fragment>  
            {
                user && (
                    <p>{}</p>
                )
            }          
            <Container fluid>
                <Row>
                    <Col className="col-12">
                    <h2 align="center" className="mb-4 mt-4">Visitantes del dia</h2>
                    </Col>
                    <Col className="d-flex ini py-2 px-2 justify-content-around  col-md-4 col-12 offset-md-4 mb-2">
                    <Form.Control 
                        type="text"

                        value={buscado}
                        placeholder="Digite lote a buscar"
                        onChange={(e)=>{setBuscado(e.target.value)}} />
                    </Col>
                    {fallo!==''&&(
                        <center><Alert variant='danger' className="w-50">
                        {fallo}
                    </Alert></center>
                    )} 
                    <Col className="col-12 d-flex flex-wrap align-content-around">
                        {   
                        cargando ? (
                            <Spinner className="offset-6" animation="border"/>
                            ) : (
                            historial.length>0 ? (
                            historial.filter((val)=>{
                                if (buscado==="") {
                                    return val
                                } else if(val.lote.includes(buscado)){
                                    return val
                                }else{return val}
                            })
                            .map(item => (
                                <Col key={item.id} className="col-12 col-md-3 mb-2 mb-md-0">
                                <Card>
                                <Card.Body>
                                    <Card.Title><center>Visitante del lote {item.lote}</center></Card.Title>
                                    <Card.Text>
                                    Visitante: {item.visitante} <br/>Tipo entrada: {item.Tipo}<br/>Posible hora de ingreso: {item.Hora}
                                    </Card.Text>
                                    {item.Estado==="Pendiente"&&(
                                        <center><Button variant="primary" onClick={()=>confirmar(item.id, item.cod)}>Quitar </Button></center>
                                    )}
                                    {item.Estado==="Finalizado"&&(
                                        <center><Button variant="success" disabled>Finalizó</Button></center>
                                    )} 
                                    {item.Estado==="Cancelado"&&(
                                        <center><Button variant="danger" disabled>Cancelado</Button></center>
                                    )}                                  
                                </Card.Body>
                                </Card>
                            </Col>
                            ))                            
                           ) : (
                            <>  
                                <Col className="ini col-10 offset-1 col-md-4 offset-md-4 pt-4 font-weight-bold">
                                <center>
                                <img src={Logo} alt="logo" height="200px"/>
                                <p>No se han encontrado registros</p>
                                </center>
                                </Col>
                            </>
                            )  
                        )                                          
                    }                        
                    </Col>
                </Row>
            </Container>            
        </Fragment>
    )
}
export default withRouter(Visual)