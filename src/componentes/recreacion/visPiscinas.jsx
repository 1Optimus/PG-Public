import React, { Fragment, useState, useEffect } from "react";
import { Row, Col, Spinner, Alert, ButtonGroup, ToggleButton, Container, Form, Table, Button} from 'react-bootstrap';
import { auth,db } from '../../fb';
import {withRouter} from 'react-router-dom';
import Logo from '../figuras/encontrar.svg';
const VisPagos=(props)=>{
    const [user, setUser] = useState(null)
    const [fecha, setFecha] = useState("")
    const [fecha2, setFecha2] = useState("")
    const [encontrados, setEncontrados] = useState('0')
    const [lotes, setLotes] = useState([])
    const [error, setError] = useState('3')
    const [cargando, setCargando] = useState(false)
    const [radioValue, setRadioValue] = useState('0');
    const radios = [
        { name: 'General día', value: '1' },
        { name: 'General rango', value: '2' },
    ];
    var cantidad=1;
    var inf=[];    
    //borra al cambiar de opcion
    const borrar=()=>{
        setFecha2("")
        setLotes([])
        setEncontrados("0")
    }
    const obtenerRegistros = async ()=>{
        var cons="";
        setCargando(true)
        if (fecha.trim()==="") {
            setError('1')  
            return
        }
        if (radioValue==='1') {
            cons =db.collectionGroup('Reservacion')
            .where("Fecha","==",fecha)         
        }        
        if (radioValue==='2') {
            if (fecha2.trim()==="") {
                setError('1')      
                return
            }else{
            cons = db.collectionGroup('Reservacion')
            .where("Fecha",">=",fecha).where("Fecha","<=",fecha2)          
            }
        }     
        try {                      
            await cons.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {                            
                    inf.push(doc.data());
                });
            }); 
            setEncontrados(1)            
            setLotes(inf)       
            setError('3')
            setCargando(false)
            if (inf.length===0) {
                setEncontrados('3')
            } else {
                setEncontrados('2')               
            }
        } catch (error) {
            setError('2')
            console.log(error)
        }                  
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
    return(
<Fragment >
    {
        user && (
            <p>{}</p>
        )
    }           
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
        {radioValue !== '0'&&(            
        <Row>
            <Col className="ini my-1 py-2 col-12 col-md-8 offset-md-2 pt-3">
            <center>
                <Col md="auto" className="d-flex flex-wrap justify-content-center align-content-md-center">                    
                <Form.Label>Seleccione { (radioValue==='2')? ('Rango:'):(':')}</Form.Label>
                </Col>
                <Col md="auto">
                {(radioValue==='2')&& (<Form.Label>Inicio:&nbsp;</Form.Label>)}
                    <input  
                    type="date"  
                    min="2021-10-01T00:00"
                    onChange={(e)=>{setFecha(e.target.value)}}
                    />
                    {(radioValue==='2')&& (
                        <>
                        <br/>
                        <Form.Label>Final:&nbsp;</Form.Label>
                        <input  
                        type="date"  
                        min="2021-10-01T00:00"
                        onChange={(e)=>{setFecha2(e.target.value)}}
                        />
                        </>
                    )}
                </Col><br/>
                <Button 
                    size="sm"
                    onClick={()=>{obtenerRegistros()}}
                    >Realizar busqueda
                </Button>         
                </center>   
            </Col> 
        </Row>
        )}
        {cargando&&(<center><Spinner animation="border" /></center>)}
        {error==='2' ? (
            <Alert  variant="danger">
            <center>Ha ocurrido un error interno, por favor revise su conexión al internet, si persiste contacte con el administrador</center>
            </Alert>
        ) : (
            error==='3'?(null):(
            <Alert  variant="warning">
            <center>Introduzca todos los campos pedidos</center>
            </Alert>        
       ))}
        {encontrados==='2'?(
            <Row>
                <Col className="col-12 col-md-6 offset-md-3 pt-3">
                <Table striped bordered hover variant="dark" size='sm'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Fecha de pago</th>
                        <th>Lote</th>
                        <th>Estado</th>
                        </tr>
                    </thead>
                <tbody>
                    {lotes.map(item => (
                        <tr key={cantidad++}>
                            <td>{cantidad}</td>
                            <td>{item.Fecha}</td>
                            <td>{item.Lote}</td>
                            <td>{item.Estado}</td>                    
                        </tr>                              
                    ))}
                </tbody>                    
                </Table> 
                </Col>
            </Row>                
        ):(
            encontrados==='3'?(
            <Col className="ini col-10 offset-1 col-md-4 offset-md-4 pt-4 font-weight-bold">
            <center>
            <img src={Logo} alt="logo" height="200px"/>
            <p>No se han encontrado registros</p>
            </center>
            </Col>
            ):(null)
        )
        }                                                                 
    </Container> 
</Fragment>
    )
}
export default withRouter(VisPagos)