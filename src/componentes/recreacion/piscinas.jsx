import React, { Fragment, useState, useEffect } from "react";
import { auth, db } from '../../fb';
import {withRouter} from 'react-router-dom';
import { Row, Col, Container, Form, Button, Alert, Spinner, Table} from 'react-bootstrap';
const Piscina=(props)=>{
    const [user, setUser] = useState('')
    const [fallo, setFallo]= useState('')
    const [exito, setExito]= useState(false)
    const [fecha, setFecha]= useState('')
    const [procesando, setProcesando]= useState(false)
    const [historial, setHistorial]= useState(false)
    const [ultimo, setUltimo]= useState(false)
    const [verTabla, setVerTabla] = useState(false)
    const [paginacion, setPaginacion]= useState(false)
    var cantidad=1;
    //lectura de datos de historial de reservaciones
    const obtenerRegistros = async ()=>{ 
        try {
            const datos = await db.collection('piscina/' + auth.currentUser.uid + '/Reservacion')
            .orderBy("Fecha",'desc').limit(5).get()
            const arraydatos = await datos.docs.map(doc=>({id: doc.id, ...doc.data()}))
            setHistorial(arraydatos)
            setVerTabla(true)
            setUltimo(await datos.docs[datos.docs.length - 1])
            if (arraydatos.length<5) {
                setPaginacion(true)
            }               
        } catch (error) {
            setVerTabla(false)
            if (error.code==='permission-denied') {
                handleShow('¡Ups!. Al parecer no tienes permiso para visualizar visitas....')
            } else {
                handleShow('Ha ocurrido un error al realizar su proceso, si el problema persiste contacte al administrador')   
            }
        }             
    } 
    //ver mas reservaciones en historial
    const verMas= async () =>{
        try {
            const datos = await db.collection('piscina/' + auth.currentUser.uid + '/Reservacion')
            .orderBy("Fecha",'desc').limit(10).startAfter(ultimo).get()
            const arraydatos1 = await datos.docs.map(doc=>({id: doc.id, ...doc.data()}))
            setUltimo(await datos.docs[datos.docs.length - 1])
            setHistorial(await historial.concat(arraydatos1))
            if (arraydatos1.length<10) {
                setPaginacion(true)
            }
        } catch (error) {
            if (error.code==='permission-denied') {
                handleShow('¡Ups!. Al parecer no tienes permiso para agregar visitas....')
            } else {
                handleShow('Ha ocurrido un error al realizar su proceso, si el problema persiste contacte al administrador')   
            }
            setPaginacion(true)                
        }
       
    } 
    //obtiene la canitdad total de ese dia
    const disponibilidad=async ()=>{
        if (!fecha.trim()) {
            handleShow('El campo de fecha encuentra vacio')          
            return
        }
        let dia = new Date(fecha).getDay(); 
        if (dia>2 && dia<7) {            
            try {
               await db.collectionGroup('Reservacion')
               .where("Fecha","==",fecha).where("Estado","==","Activo")
               .get().then((value)=>{
                var rep=false
                value.forEach(function(doc) {
                    if (user.displayName===doc.data().Lote) {
                       rep=true
                    }
                }); 
                if (value.size<9) {
                    if (!rep) {
                    reserva()       
                    }else{
                    handleShow('Usted ya ha reservado en ese día')
                    return
                    }                    
                }else{
                    handleShow('¡Cupo ya lleno!')
                    return
                }
               })                                 
            } catch (error) {
                console.log(error)
                handleShow('Ocurrio un error, intente nuevamente más tarde, si persite contacte al administrador')          
                return   
            }           
        }else{
            handleShow('La fecha seleccionada no es válida, esta cerrado ese día')          
            return
        }       
        console.log(fecha+".."+dia)
    } 
    //realizacion de reservacion
    const reserva=async(cant)=>{
        try {
            const agregar ={
                Fecha: fecha,
                Estado:"Activo",
                Lote:auth.currentUser.displayName
            }
            await db.collection('piscina/' + auth.currentUser.uid + '/Reservacion')
            .add(agregar)
            handleShow2()
        } catch (error) {
            console.log(error)
            handleShow('Ocurrio un error, intente nuevamente más tarde, si persite contacte al administrador')          
            return    
        }
    }
    const eliminarRegistro=id=>{
        try {
            db.collection('piscina/' + auth.currentUser.uid + '/Reservacion')
            .doc(id).delete().then(() => {
            const arrayFiltrado=historial.filter(item=>item.id!==id)
            setHistorial(arrayFiltrado)
            }).catch((error) => {
            console.error("Error removing document: ", error);
            });
        } catch (error) {
            handleShow('Ocurrio un error, intente nuevamente más tarde, si persite contacte al administrador') 
        }                        
    }
    const getCurrentDate=(separator='-')=>{
        let newDate = new Date()
        let date = newDate.getDate();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        return `${year}${separator}${month<10?`0${month}`:`${month}`}${separator}${date}`
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
            if (auth.currentUser.displayName==="Z1") {
                props.history.push('/histopiscina')   
            }
            if (auth.currentUser.displayName==="Z2") {
                props.history.push('/visita')
            }
            if (auth.currentUser.displayName==="Z3") {
                props.history.push('/Visualizacion')
            }
        }else{
            props.history.push('/login')
        }
    }, [props.history])
    return(
        <Fragment>
            {
                user && (
                    <p>{}</p>
                )
            }
            <h2 align="center" className="mb-4">Reservación en área de piscina</h2>
            <Container fluid>               
                <Row>
                    <Col className="ini col-12 col-md-4 offset-md-4 py-3 px-3 d-flex flex-column">
                        <center>
                        <Form.Control 
                        type="date"
                        className="w-75"
                        min={getCurrentDate()}
                        onChange={(e)=>{setFecha(e.target.value)}}
                        />
                        <Button                        
                        className="mt-3"
                        onClick={()=>{disponibilidad()}}
                        >
                            Reservar
                        </Button>
                        </center>
                    </Col>        
                </Row>
                {!verTabla&&(
                <center><Button                        
                className="mt-3"
                onClick={()=>{obtenerRegistros()}}
                >
                    Visualizar historial
                </Button>
                </center>
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
            {verTabla&&(
            <Col className="col-12 mt-3">
                <p className="ini col-8 offset-2 py-2"align="center">
                    Por favor no elimine el registro el mismo día de la reservacion,
                     estaría perdiendo su reservación</p>
            <Table striped bordered hover variant="dark">
                <thead>
                    <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                {historial.map(item => (
                    <tr key={item.id}>                                    
                    <td>{cantidad++}</td>
                    <td>{item.Fecha}</td>
                    <td>{item.Estado}</td>
                    <td><center>
                    <Button
                    variant="danger"
                    onClick={()=>eliminarRegistro(item.id)}
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
                onClick={()=>{verMas()}}
                >Ver más...</Button>
                </center>  
            )}                                                                 
            </Col>
            )}                        
            </Container>            
        </Fragment>
    )
}
export default withRouter(Piscina)