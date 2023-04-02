import React, { Fragment, useState, useEffect } from "react";
import { Row, Col, Spinner, Alert, ButtonGroup, ToggleButton, Container, Form, Table, Button} from 'react-bootstrap';
import { auth,db } from '../../fb';
import {withRouter} from 'react-router-dom';
import Logo from '../figuras/encontrar.svg';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
const VisPagos=(props)=>{
    const [user, setUser] = useState(null)
    const [manz, setManz] = useState('0')
    const [lote, setLote] = useState('')
    const [fecha, setFecha] = useState("")
    const [fecha2, setFecha2] = useState("")
    const [encontrados, setEncontrados] = useState('0')
    const [lotes, setLotes] = useState([])
    const [resumen, setResumen] = useState("")
    const [error, setError] = useState('3')
    const [cargando, setCargando] = useState(false)
    const abc=['A','B','C','D','E','F','G','H','I',
    'J','K','L']
    const [radioValue, setRadioValue] = useState('0');
    const radios = [
        { name: 'General día', value: '1' },
        { name: 'General rango', value: '2' },
        { name: 'Manazana día', value: '3' },
        { name: 'Manazana rango', value: '4' },
        { name: 'Estado general', value: '5' },
        { name: 'Lote especifico', value: '6' },
    ];
    var cantidad=1;
    var inf=[];    
    //calcular meses
    const meses=(fecha)=>{
        var date1=new Date(fecha);//Remember, months are 0 based in JS
        var date2=new Date();
        var year1=date1.getFullYear();
        var year2=date2.getFullYear();
        var month1=date1.getMonth();
        var month2=date2.getMonth();
        if(month1===0){ //Have to take into account
        month1++;
        month2++;
        }
        var numberOfMonths; 
        numberOfMonths = (year2 - year1) * 12 + (month2 - month1);
            return (numberOfMonths)
    }
    //borra al cambiar de opcion
    const borrar=()=>{
        setFecha2("")
        setManz("0")
        setLotes([])
        setEncontrados("0")
    }
    const obtenerRegistros = async ()=>{        
        var pago=0;
        var elminado=0;
        var cant=0;
        setCargando(true)
        if (fecha.trim()==="" && radioValue!=="5" && radioValue!=="6") {
            setError('1')  
            return
        }
        var cons="";
        if (radioValue==='1' || radioValue==='3') {
            if (radioValue==="3" && manz.trim()==="0") {
                setError('1')     
                return
            }
                if (radioValue==='3') {
                    cons = db.collectionGroup("pagos")
                    .where('manzana', '==', manz).where('fecha', '==', fecha);
                } else {
                    cons = db.collectionGroup("pagos")
                    .where('fecha', '==',fecha);
                }            
        }
        if (radioValue==='2' || radioValue==='4') {
            if (fecha2.trim()==="") {
                setError('1')      
                return
            }
            if (radioValue==="4" && manz.trim()==="0") {
                setError('1')   
                return
            }
                if (radioValue==='4') {
                    cons = db.collectionGroup("pagos")
                    .where('manzana', '==', manz).where('fecha', '>=', fecha)
                    .where('fecha', '<=', fecha2);
                } else {
                    cons = db.collectionGroup("pagos")
                    .where('fecha', '>=', fecha).where('fecha', '<=', fecha2);
                }           
        } 
        if (radioValue==='5') {
            cons = db.collectionGroup("control");          
        }         
        if (radioValue==='6') {            
            if (lote.trim()==="") {                
                setError('1')      
                return
            }
            cons = db.collectionGroup("pagos")
            .where('lote', '==', lote).where('manzana', '==', manz)
            .orderBy("fecha","desc");          
        }     
        try {
            setEncontrados(1)           
            await cons.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {                            
                    inf.push(doc.data());
                    if (inf[cant].accion==="pago") {
                        pago++;
                    } else {
                        elminado++;
                    } 
                    cant++;
                });
            });            
            if (radioValue==='5') {
                var pre=inf.sort
                    (function (a, b) {
                        if (a.lote > b.lote) {
                          return 1;
                        }
                        if (a.lote < b.lote) {
                          return -1;
                        }
                        // a must be equal to b
                        return 0;
                      })
                      setLotes(pre.sort
                        (function (a, b) {
                            if (a.manzana > b.manzana) {
                              return 1;
                            }
                            if (a.manzana < b.manzana) {
                              return -1;
                            }
                            // a must be equal to b
                            return 0;
                          }))
            }else{
                setLotes(inf)
            }           
            setError('3')
            setCargando(false)
            if (inf.length===0) {
                setEncontrados('3')
            } else {
                setEncontrados('2')
                setResumen("Total a percibir: Q."+(225*pago)+"___ Pagados: "+pago+" ___Eliminados: "+elminado)
            }
        } catch (error) {
            setError('2')
            console.log(error)
        }                         
    }
    useEffect(() => {
        if(auth.currentUser){
            setUser(auth.currentUser)
            if (auth.currentUser.displayName!=="Z3") {
                switch (auth.currentUser.displayName) {
                    case "Z2":
                        props.history.push('/visual')
                        break;
                    case "Z1":
                        props.history.push('/histopiscina')  
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
        {radioValue === '0' ? (null):(            
        <Row>
            <Col className="ini my-1 py-2 col-12 col-md-8 offset-md-2 pt-3">
            <center>
            <Row>
            <Col className="col-12 d-flex justify-content-around mb-2"> 
            {radioValue!=='5' && (
                <Row md="auto" >                
                {radioValue==='6'?(
                    <Col md="auto" className="d-flex justify-content-around">
                        <Form.Label>Lote:</Form.Label>
                        <Form.Control 
                        type="number" 
                        className="w-75" 
                        placeholder="# Lote"
                        min="1"
                        onChange={(e)=>{setLote(e.target.value)}} 
                        value={lote}>                        
                        </Form.Control>
                    </Col>                    
                ):(
                    <>
                    <Col md="auto" className="d-flex flex-wrap justify-content-center align-content-md-center">                    
                    <Form.Label>Seleccione { (radioValue==='2' || radioValue==='4')? ('Rango:'):(':')}</Form.Label>
                    </Col>
                    <Col md="auto">
                    { (radioValue==='2' || radioValue==='4')  && (<Form.Label>Inicio:</Form.Label>)}
                        <input  
                        type="date"  
                        min="2021-10-01T00:00"
                        onChange={(e)=>{setFecha(e.target.value)}}
                        />
                    
                        { (radioValue==='2' || radioValue==='4')  && (
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
                    </Col>
                    </>
                )}                
                </Row>
                )}
            </Col>                 
            </Row>
            {(radioValue==='3' || radioValue==='4' || radioValue==='6')&& (
                <Row>
                <Col className="col-12 col-md-8 offset-md-2 d-flex justify-content-around mb-2">
                <Form.Label>Seleccione manzana:</Form.Label>
                <Form.Select className="w-25" size="sm"
                        onChange={(e)=>{setManz(e.target.value)}}                         
                        value={manz}>                                
                            <option key='a' value="0" disabled>Seleccione manzana</option>
                            {
                            abc.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))
                            }
                    </Form.Select>                        
                </Col>
                </Row>
            )}              
            <Button size="sm"
            onClick={()=>{obtenerRegistros()}}
            >Realizar busqueda</Button><br/><br/>
            {(encontrados==="2"&&radioValue!=='5')&&(<p>{resumen}</p>)}           
            </center>   
            </Col> 
        </Row>
        )}
        {cargando&&(
                        <center><Spinner animation="border" /></center>
                    ) }
        { error==='2' ? (
        <Alert  variant="danger">
        <center>Ha ocurrido un error interno, por favor revise su conexión al internet, si persiste contacte con el administrador</center>
        </Alert>
       ) : (
           error==='3'?(null):(
            <Alert  variant="warning">
            <center>Introduzca todos los campos pedidos</center>
            </Alert>        
       ))}
        {
            encontrados==='2'?(
                radioValue==='5'?(
                    <>
                    <Row>                     
                    <Col className="ini pt-3 pb-1 d-flex align-content-center text-center">{                        
                    abc.map(it => (
                    <Table striped bordered hover size="sm" key={it} id="expoEx">
                    <thead>
                    <tr bgcolor='#daa520'>
                    <th>{it}</th>
                    </tr>
                    </thead>                    
                    <tbody>
                        {
                        lotes.map(item => {
                            const stat=meses(item.ultimoMesPagado)                            
                            return(
                            item.manzana===it&&(
                            <tr key={cantidad++} bgcolor={stat>=0 ?                               
                                (   
                                    stat===0 ?
                                    ('9acd32'):
                                    ('ff6347')
                                )
                                :
                                ('#00bfff')
                                }>
                            <td>{item.manzana+item.lote+' '+(
                                stat>=0 ?                               
                                (   
                                    stat===0 ?
                                    ('Al dia'):
                                    ('Debe: '+stat)
                                )
                                :
                                ("Adel-> "+Math.abs(stat))
                            )}</td>
                            </tr>
                             ) 
                            )
                    })}
                    </tbody>
                    </Table>                                        
                    ))
                    }
                    </Col> 
                    </Row>                    
                    </>
                ):(
                    <>                    
                <Table striped bordered hover variant="dark" size='sm' id="expoEx">
                <thead>
                    <tr>
                    <th>#</th>
                    <th>Fecha de pago</th>
                    <th>Lote</th>
                    <th>Mes Pagado</th>
                    <th>Accion</th>
                    </tr>
                    </thead>
                <tbody>
                    {
                        lotes.map(item => (
                            <tr key={cantidad++}>
                            <td>{cantidad}</td>
                            <td>{item.fecha}</td>
                            <td>{item.manzana+item.lote}</td>
                            <td>{item.mesPagado}</td>
                            <td>{item.accion}</td>                       
                            </tr>                              
                        ))}
                </tbody>                    
                </Table> 
                <center><ReactHTMLTableToExcel
                    id="xls"
                    className="btn btn-success"
                    table="expoEx"
                    filename="Reporte de pagos"
                    sheet="Pagos"
                    buttonText="Exportar a Excel"/>
                </center>
                </>
            )):(
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