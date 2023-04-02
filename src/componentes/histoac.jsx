import React, { Fragment,useState, useEffect } from "react";
import { Row, Col, Container, Table, Button,ButtonGroup, Spinner, ToggleButton,Alert } from 'react-bootstrap';
import { auth, db } from '../fb';
import {withRouter} from 'react-router-dom'
import Logo from './figuras/encontrar.svg';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
const Histoac=(props)=>{
    const [user, setUser] = useState(null)
    const [fecha, setFecha] = useState('')
    const [fecha2, setFecha2] = useState('')
    const [historial, setHistorial] = useState([])
    const [encontrados, setEncontrados] = useState('0')
    const [cargando, setCargando] = useState(false)
    const [err, setErr] = useState('')
    const datos=[]
    const [radioValue, setRadioValue] = useState('0');
    const radios = [
        { name: 'General día', value: '1' },
        { name: 'General rango', value: '2' },       
    ];
    var cantidad=1
    const handleShow = ((error) => {//el del error
        setErr(error)
        setTimeout(() => {
            setErr('')
        }, 2000)
    })
    const borrar=()=>{
        setFecha2("")
        setHistorial([])
        setEncontrados('0')
    }
    const obtenerRegistros = async ()=>{ 
        setCargando(true)
        var cons=''
        if (fecha==='') {
            handleShow('La fecha se encuentra vacía')
            return
        } 
        if (radioValue==='1') {
            cons=db.collectionGroup("Historial").where('fechaIngreso', '==', fecha)
        } else {
            if (fecha2==='') {
                setErr('La fecha se encuentra vacía')
                return
            }   
            cons=db.collectionGroup("Historial")
            .where('fechaIngreso', '>=', fecha).where('fechaIngreso', '<=', fecha2)
        }          
        try {
            await cons
            .get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {                            
                    datos.push(doc.data());
                });
            });  
            setHistorial(datos)
            setCargando(false)
            datos.length===0 ? (setEncontrados('1')):(setEncontrados('2'))
        } catch (error) {
            console.log(error)
        }                   
    }
    useEffect(() => {
        if(auth.currentUser){
            setUser(auth.currentUser)
            if (auth.currentUser.displayName!=="Z1") {
                switch (auth.currentUser.displayName) {
                    case "Z2":
                        console.log("bienvenido")
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
                    <h2 align="center" className="mb-4 mt-4">Historial de visistas</h2>
                    </Col>
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
                    {radioValue==='0'?(
                        null
                    ):(
                    <Col className="d-flex ini my-2 py-3 justify-content-around col-md-8 col-12 offset-md-2">                      
                    {radioValue==='0'?(
                        null
                    ):(
                        <>
                        <input 
                        type="date" 
                        id="fecha"                                
                        min="2021-06-07T00:00"
                        onChange={(e)=>{setFecha(e.target.value)}}
                        />
                        {radioValue==='2'&&(
                            <input 
                            type="date" 
                            id="fecha"                                
                            min="2021-06-07T00:00"
                            onChange={(e)=>{setFecha2(e.target.value)}}
                            />
                        )} 
                        </>
                    )}                                                                 
                        <Button className="w-25 "
                        onClick={obtenerRegistros}
                        >Buscar</Button>
                    </Col>
                    )}
                    {cargando  ? (
                        <center><Spinner animation="border" /></center>
                    ) : (
                    <Col className="col-12">
                        {
                   err!==""&&(
                    <Alert  variant="danger">
                        <center>{err}</center>
                    </Alert>
                   )                   
                } 
                    {
                    encontrados==='2' ? (
                        <>
                    <Table striped bordered hover variant="dark" id="expoEx">
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>Lote</th>
                        <th>Visitante</th>
                        <th>Fecha</th>
                        <th>Tipo de ingreso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            historial.map(item => (
                                <tr key={cantidad++}>
                                <td>{cantidad}</td>
                                <td>{item.lote}</td>
                                <td>{item.visitante}</td>
                                <td>{item.fechaIngreso}</td>
                                <td>{item.Tipo}</td>                        
                                </tr>                              
                            ))
                        }                        
                    </tbody>                    
                    </Table>
                    <center><ReactHTMLTableToExcel
                    id="xls"
                    className="btn btn-success"
                    table="expoEx"
                    filename="Reporte de Visitas"
                    sheet="Visitas"
                    buttonText="Exportar a Excel"/>
                    </center>                        
                    </>
                    ) : (
                        encontrados==='1'&&(
                        <Col className="ini col-10 offset-1 col-md-4 offset-md-4 pt-4 font-weight-bold">
                            <center>
                            <img src={Logo} alt="logo" height="200px"/>
                            <p>No se han encontrado registros</p>
                            </center>
                        </Col>
                        )
                        )                    
                    }                      
                    </Col>
                    )}
                </Row>
            </Container>            
        </Fragment>
    )
}
export default withRouter(Histoac)