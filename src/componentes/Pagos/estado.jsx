import React, { Fragment, useState, useEffect } from "react";
import { Row, Col, Container, Table, Badge, Spinner, Button } from 'react-bootstrap';
import { auth,db } from '../../fb';
import {withRouter} from 'react-router-dom'
import Logo from '../figuras/encontrar.svg';
const Estado=(props)=>{
    const [user, setUser] = useState(null)
    const [historial, setHistorial] = useState([])
    const [cargando, setCargando] = useState(true)
    const [ultimo, setUltimo] = useState([])
    const [mas, setMAs] = useState([])
    const [paginacion, setPaginacion] = useState(false)
    //obtencion de mes a mostrar
    const mes=(fecha)=>{
        var date=new Date(fecha);
        var year=date.getFullYear();
        var month=date.getMonth()+1;
            return month+'/'+year
    }
    //obtencion de mes a mostrar
    const mes2=(fecha)=>{
        return fecha.replace(/^(\d{4})-(\d{2})-(\d{2})$/g,'$3/$2/$1');
    }
    //obtencion de meses que debe
    const meses=(fecha)=>{
        var date1=new Date(fecha);
        var date2=new Date();
        var year1=date1.getFullYear();
        var year2=date2.getFullYear();
        var month1=date1.getMonth();
        var month2=date2.getMonth();
        if(month1===0){
        month1++;
        month2++;
        }
        var numberOfMonths; 
        numberOfMonths = (year2 - year1) * 12 + (month2 - month1);
            return (numberOfMonths)
    }
    //visualizar mas historial de pago
    const verMas= async () =>{
        try {

            const datos = await db.collection('control').doc(auth.currentUser.uid)
            .collection('pagos').where('accion','==','pago')
            .orderBy("mesPagado",'desc').limit(10).startAfter(mas).get()
            const arraydatos1 = await datos.docs.map(doc=>({id: doc.id, ...doc.data()}))
            setMAs(await datos.docs[datos.docs.length - 1])
            setHistorial(await historial.concat(arraydatos1))
            if (arraydatos1.length<10) {
                setPaginacion(true)
            }
        } catch (error) {
            setPaginacion(true)
        }
       
    }
    //lectura de datos de historial de visitas registradas
    useEffect( () => {       
        const obtenerRegistros = async ()=>{  
            try {
                const datos = await db.collection('control').doc(auth.currentUser.uid)
                .collection('pagos').where('accion','==','pago')
                .orderBy("mesPagado",'desc').limit(5).get()
                const arraydatos = await datos.docs.map(doc=>({id: doc.id, ...doc.data()}))
                if (arraydatos.length===0) {
                    setCargando(false) 
                    return    
                }
                if (arraydatos.length<=4) {
                    setPaginacion(true)
                }
                setHistorial(arraydatos)                
                setMAs(await datos.docs[datos.docs.length - 1])
                setUltimo(meses(arraydatos[0].mesPagado))              
                setCargando(false)                 
            } catch (error) {
                console.log(error)
            }             
        }
        obtenerRegistros();
    }, [])
    useEffect( () => {
        if(auth.currentUser){
            setUser(auth.currentUser)
            if(auth.currentUser.displayName==="Z2"){
                props.history.push('/visual')
            }
            if(auth.currentUser.displayName==="Z3"){
                props.history.push('/Visualizacion')
            }
            if(auth.currentUser.displayName==="Z1"){
                props.history.push('/histopiscina')
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
    <Container fluid>
    {
            cargando  ? (
            <center><Spinner animation="border" /></center>
        ) : (
            historial.length===0?(
                <>  
                <Col className="vist col-10 offset-1 col-md-4 offset-md-4 pt-4 font-weight-bold">
                <center>
                <img src={Logo} alt="logo" height="200px"/>
                <p>No se han encontrado registros</p>
                </center>
                </Col>
            </>
            ):(
                <Row>
                <Row>
                    <Col className="vist col-11 offset-1 offset-md-1 col-md-5 d-flex justify-content-center mt-4 pt-5 pb-5 shadow">
                    <h1>
                    Estado:{ultimo <= 0 ? (
                        ultimo === 0 ? 
                        (<Badge className="bg-primary rounded-5">Al día</Badge>)
                        :
                        (<Badge className="bg-success rounded-5">Adelantado</Badge>)                    
                    ):(
                        <Badge className="bg-warning rounded-5">Falta pago</Badge>              
                    )
                    }   
                    </h1>
                    </Col>
                    <Col className="vist  mx-md-4 col-11 offset-1 col-md-5 d-flex justify-content-center mt-4 pt-5 pb-5 shadow">
                    <h1>
                    Meses: {ultimo <= 0 ? (
                        ultimo === 0 ? 
                        (<Badge className="bg-primary rounded-5">0</Badge>)
                        :
                        (<Badge className="bg-success rounded-5">{Math.abs(ultimo)}</Badge>)                    
                    ):(
                        <Badge className="bg-warning rounded-5">{ultimo}</Badge>              
                    )
                    }
                    </h1>
                </Col>
                </Row>                   
                <Col className="col-12 ">
                <h2 align="center" className="mb-4 mt-4">Historial de pagos</h2>
                </Col>
                <Col className="col-10 offset-1 col-md-6 offset-md-3">
                <Table striped bordered hover variant="dark">
                <thead align='center'>
                    <tr>
                    <th>Fecha de pago</th>
                    <th>Mes pagado</th>
                    </tr>
                </thead>
                <tbody align='center'>
                    {
                        historial.map(item => {
                            return(
                            <tr key={item.id}>
                            <td>{mes2(item.fecha)}</td>
                            <td>{mes(item.mesPagado)}</td>
                            </tr>)
                        })
                    }
                </tbody>
                </Table>
                {paginacion ? (
                    <center><Button
                    className="mb-3"
                    variant="primary"
                    onClick={null}
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
            </Row>
            )
            
        )
    }                                
    </Container>            
</Fragment>
    )
}
export default withRouter(Estado)