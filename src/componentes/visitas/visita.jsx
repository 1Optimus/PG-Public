import React, { Fragment, useState, useEffect } from "react";
import { auth, db } from '../../fb';
import {withRouter} from 'react-router-dom'
import Rapida from './visitarap'
import Lenta from './visitalen'
import Logo from '../figuras/encontrar.svg';
import { Row, Col, Container, Table, Alert, Button, Spinner} from 'react-bootstrap';
const Visita=(props)=>{
    const [user, setUser] = useState(null)
    const [historial, setHistorial] = useState([])
    const [cargando, setCargando] = useState(true)
    const [ultimo, setUltimo] = useState([])
    const [verTabla, setVerTabla] = useState(true)
    const [paginacion, setPaginacion] = useState(false)
    const [erro, setErro] = useState('')
    let cantidad=1
    const getCurrentDate=(separator='-')=>{
        let newDate = new Date()
        let date = newDate.getDate();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        return `${year}${separator}${month<10?`0${month}`:`${month}`}${separator}${date<10?`0${date}`:`${date}`}${'T00:00'}`
        }
        const eliminarRegistro=(id, est)=>{
            try {
                if (est==="Pendiente"||est==="Cancelado") {
                    db.collection('Visitantes/' + auth.currentUser.uid + '/Historial')
                    .doc(id).update({
                        Estado: "Cancelado"
                    }).then(() => {
                    const arrayEditado = historial.map(item => item.id === id?({...item, Estado:'Cancelado'}): item)
                    setHistorial(arrayEditado)
                    }).catch((error) => {
                    console.error("Error removing document: ", error);
                    });   
                }else{
                    setErro('No se pueden borrar los ya Finalizados')    
                }                
            } catch (error) {
                setErro('No se logro llevar a las peticiones, contacte con el administrador en caso el problema persista')
            }                        
        }   
        //lectura de datos de historial de visitas registradas
        const obtenerRegistros = async ()=>{
            setVerTabla(false)    
            try {
                const datos = await db.collection('Visitantes/' + auth.currentUser.uid + '/Historial')
                .orderBy("fechaIngreso",'desc').limit(5).get()
                const arraydatos = await datos.docs.map(doc=>({id: doc.id, ...doc.data()}))
                setHistorial(arraydatos)
                console.log(arraydatos)
                setCargando(false) 
                setUltimo(await datos.docs[datos.docs.length - 1])
                if (arraydatos.length<5) {
                    setPaginacion(true)
                }               
            } catch (error) {
                console.log(error)
                if (error.code==='permission-denied') {
                    setErro('¡Ups!. Al parecer no tienes permiso para visualizar visitas....')
                } else {
                    setErro('Ha ocurrido un error al realizar su proceso, si el problema persiste contacte al administrador')   
                }
            }             
        }
        //obtener  registros
        const verMas= async () =>{
            try {
                const datos = await db.collection('Visitantes/' + auth.currentUser.uid + '/Historial')
                .orderBy("fechaIngreso",'desc').limit(10).startAfter(ultimo).get()
                const arraydatos1 = await datos.docs.map(doc=>({id: doc.id, ...doc.data()}))
                setUltimo(await datos.docs[datos.docs.length - 1])
                setHistorial(await historial.concat(arraydatos1))
                if (arraydatos1.length<10) {
                    setPaginacion(true)
                }
            } catch (error) {
                if (error.code==='permission-denied') {
                    setErro('¡Ups!. Al parecer no tienes permiso para agregar visitas....')
                } else {
                    setErro('Ha ocurrido un error al realizar su proceso, si el problema persiste contacte al administrador')   
                }
                setPaginacion(true)                
            }
           
        }
    useEffect(() => {
        //identificar si existe usuario
        if(auth.currentUser){
            setUser(auth.currentUser)
            if(auth.currentUser.displayName==="Z2"){
                props.history.push('/visual')
            }
            if(auth.currentUser.displayName==="Z3"){
                props.history.push('/Visualizacion')
            }
        }else{
            props.history.push('/login')
        }        
    }, [props.history])
    return(
        <Fragment>
            {user &&(<p></p>)}
            {erro!==""&&(
                 <center><Alert variant='danger' className="w-50 h-25">{erro}</Alert></center>
            )}
            <h2 align="center" className="mb-4">Visitas</h2>
            <Container fluid>
                <Row>
                    <Col className="col-12 col-md-6 ">
                    <Rapida fech={getCurrentDate()}></Rapida>
                    </Col>
                    <Col className="col-12 col-md-6 pt-md-0 pt-3 ">
                    <Lenta fech={getCurrentDate()}></Lenta>
                    </Col>
                </Row>
                <Row>
                    <Col className="col-12">
                    <h2 align="center" className="mb-4 mt-4 ">Historial de visitas</h2>
                    </Col>                    
                    {   
                        verTabla ? (
                            <Col className="col-12">
                                <center>
                                    <Button
                                    className="mb-3"
                                    variant="primary"
                                    onClick={()=>obtenerRegistros()}
                                    >
                                        Visualizar Historial
                                    </Button>
                                </center>
                            </Col>
                        ):(
                            cargando  ? (
                                <center><Spinner animation="border" variant="light"/></center>
                            ) : (
                                historial.length>0 ? (
                                
                                    <Col className="col-12">
                                        <Table striped bordered hover variant="dark">
                                        <thead>
                                            <tr>
                                            <th>#</th>
                                            <th>Visitante</th>
                                            <th>Fecha</th>
                                            <th>Tipo de ingreso</th>
                                            <th>Estado</th>
                                            <th>Cancelar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {historial.map(item => (
                                            <tr key={item.id}>                                    
                                            <td>{cantidad++}</td>
                                            <td>{item.visitante}</td>
                                            <td>{item.fechaIngreso}</td>
                                            <td>{item.Tipo}</td>
                                            <td>{item.Estado}</td>
                                            <td><center>
                                                <Button
                                                variant="danger"
                                                onClick={()=>eliminarRegistro(item.id, item.Estado)}
                                                >X</Button></center>
                                            </td>
                                            </tr>                                
                                    ))}
                                    </tbody>
                                    </Table>
                                    
                                    {paginacion ? (
                                        <center><Button
                                        className="mb-3"
                                        variant="primary"
                                        disabled
                                        >No hay más datos</Button>
                                        </center>
                                    ):(
                                        <center><Button
                                        className="mb-3"
                                        variant="primary"
                                        onClick={()=>verMas()}
                                        >Ver más...</Button>
                                        </center>  
                                    )}                                                                 
                                    </Col>
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
                        )                                                                  
                    }                                        
                </Row>
            </Container>            
        </Fragment>
    )
}
export default withRouter(Visita)