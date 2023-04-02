import React, { Fragment, useState, useEffect } from "react";
import { Row, Col, Spinner, Container, Form, Card, Button, Alert} from 'react-bootstrap';
import { auth, db } from '../../fb.js';
import {withRouter} from 'react-router-dom'
import Logo from '../figuras/encontrar.svg';
const Manzana=(props)=>{
    const [user, setUser] = useState(null)
    const [manz, setManz] = useState('0')
    const [encontrados, setEncontrados] = useState('0')
    const [no, setNo] = useState('0')
    const [lotes, setLotes] = useState([])
    const [error1, setError] = useState('0')
    const [acc, setAcc] = useState(false)
    const abc=['A','B','C','D','E','F','G','H','I',
    'J','K','L','M','N','O','P','Q','R','S','T','U'
    ,'V','W','X','Y','Z']
     //ordenamiento por lote
     function ordLote( a, b ) {
        if ( a.lote < b.lote ){
          return -1;
        }
        if ( a.lote > b.lote ){
          return 1;
        }
        return 0;
      }
    const obtenerRegistros = async ()=>{    
        if(manz.trim()==="0"){
            setError('2')
            return
        }else{
        try {
            setEncontrados(1)            
            const datos = await db.collectionGroup("control").where('manzana', '==', manz)
            .get()
            var canti=0
            const arraydatos = await datos.docs
            .map(doc=>({
                id: doc.id,
                ...doc.data()
            }))
            arraydatos.sort(ordLote)
            arraydatos.forEach(item => {
                item['canti'] = canti;
                item['mod'] = '';
                canti++;
               });
            setLotes(arraydatos)
            setEncontrados(2)
            arraydatos.length===0 ? (setNo('1')):(setNo('0'))
        } catch (error) {
            console.log(error)
        } setError('0')
    }                  
    }   
    //funcion para obtener fecha del mes pagado
    const fecha= (ultimoMes, cant)=>{
        let aux= new Date(ultimoMes)
        var auxF  = new Date(aux.setMonth(aux.getMonth()+(cant+1)));
        let month = auxF.getMonth() + 1;
        let year = auxF.getFullYear();
        let nuevaFecha= `${year}${'-'}${month<10?`0${month}`:`${month}`}${'-'}${20}`
        return nuevaFecha
    }
    //realiza las actualizaciones....
    const actualizar=async(lugar, accion)=>{
        if(lotes[lugar].mod==='' || parseInt(lotes[lugar].mod)<1){
            setError('2')
        }else{           
        var ultima=''
        let newDate = new Date()
        let date = newDate.getDate();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        let actualFecha= `${year}${'-'}${month<10?`0${month}`:`${month}`}${'-'}${date<10?`0${date}`:`${date}`}`
        if (accion===1) {
            setAcc(true)           
            for (let index = 0; index < lotes[lugar].mod; index++) {
                ultima=fecha(lotes[lugar].ultimoMesPagado,index)
                 let fechaPgada=ultima
                 const agregar={                    
                    fecha:actualFecha,
                    lote:lotes[lugar].lote,
                    manzana:lotes[lugar].manzana,
                    mesPagado: fechaPgada,
                    accion:'pago'
                }
                try {
                  await db.collection('control/' + lotes[lugar].id + '/pagos').add(agregar)    
                } catch (error) {
                  setError('1')  
                }            
            }
            try {
                await db.collection('control/').doc(lotes[lugar].id).update({ultimoMesPagado: ultima});   
            } catch (error) {
                setError('1')  
            }   
            const arrayEditado = lotes.map(item => item.canti === lugar ? {...item, mod: '',ultimoMesPagado:ultima} : item)
            setLotes(arrayEditado)
            setAcc(false)
        } else {
            var datos=[]
            try {
                setAcc(true)
                await db.collection('control')
                .doc(lotes[lugar].id).collection('pagos').where('accion','==','pago')
                .orderBy('mesPagado','desc').limit(parseInt(lotes[lugar].mod)+1)
                .get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {                            
                        datos.push({id: doc.id, ...doc.data()});
                    });
                }); 
                if (datos.length===0 || datos.length===1) {
                    setError('1')  
                    return
                }
                for (let index = 0; index < (parseInt(datos.length)-1); index++) {
                    await db.collection('control').doc(lotes[lugar].id)
                    .collection('pagos').doc(datos[index].id).update({accion: 'eliminado'});
                }
                  await db.collection('control').doc(lotes[lugar].id)
                  .update({ultimoMesPagado: (datos[datos.length-1].mesPagado)});
                  setAcc(false)  
                } catch (error) {
                    console.log(error)
                  setError('1') 
                  return 
                }    
                const arrayEditado = lotes.map(item => item.canti === lugar ? {...item, mod:'',ultimoMesPagado: (datos[datos.length-1].mesPagado)} : item)
                setLotes(arrayEditado)
                setError('0')
                setAcc(false)
            }            
        } 
}
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
    function handleChange(e) {
        e.preventDefault();
        const { name, value } = e.target;
        const arrayEditado = lotes.map(item => (
            // eslint-disable-next-line eqeqeq
            item.canti == name ? {...item, mod: value} : item
          ))
          setLotes(arrayEditado)
      }
    useEffect(() => {
        if(auth.currentUser){
            setUser(auth.currentUser)
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
                    <Col className="d-flex ini my-2 py-3 justify-content-around col-md-8 col-12 offset-md-2 text-black">
                    <Form.Label>Seleccione manzana:</Form.Label>
                    <select className="w-25"
                        onChange={(e)=>{setManz(e.target.value)}}                         
                        value={manz}>                                
                            <option key='a' value="0" disabled>Seleccione manzana</option>
                            {
                            abc.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))
                            }
                    </select>
                        <Button className="w-25 "
                        onClick={()=>{obtenerRegistros()}}
                        >Buscar</Button>                        
                    </Col>
                    {acc&&(<Spinner animation="border" />)}
                    {error1>'0'?(
                            error1==="1"?(
                                
                                <Alert  variant="danger">
                                <center>Ocurrio un problema al realizar los cambios, intente de nuevo</center>
                                </Alert>
                            ):(
                                <Alert  variant="danger">
                                <center>Algunos campos se encuentran vacios, o introdujo un número no valido</center>
                                </Alert>
                            )
                        ):(
                            null
                    )}
                </Row>
                {
                    no!=='0' && (
                        <Col className="ini col-10 offset-1 col-md-4 offset-md-4 pt-4 font-weight-bold">
                            <center>
                            <img src={Logo} alt="logo" height="200px"/>
                            <p>No se han encontrado registros</p>
                            </center>
                        </Col>
                    )
                    }{
                    encontrados!==0 && 
                    (
                        encontrados===1 ?
                        (<center><Spinner animation="border" /></center>)
                        :
                        (
                            <Row className="mt-4 d-flex justify-content-around">
                    {
                        lotes.map(item => {
                            const stat=meses(item.ultimoMesPagado)
                            return(
                            <Col md="auto" sm="auto" className="col-5 mt-2" key={item.lote}>
                            <Card 
                                bg={
                                    stat>0 ? 
                                    ('dark')
                                    :
                                    (
                                        stat<0? 
                                        ('success')
                                        :
                                        ('primary')
                                    )
                                } 
                            text='light' 
                            style={{ width: '9rem' }}
                            >                    
                                <Card.Body><center>
                                <Card.Title>#. {item.lote}</Card.Title>
                                <Card.Text >                                    
                                    {
                                    stat>0 ? 
                                    ('Debe: '+stat)
                                    :
                                    (
                                        stat<0? 
                                        ('Adelantado: '+Math.abs(stat))
                                        :
                                        ('Al día')
                                    )
                                    } <br/>
                                    Último mes pagado: {item.ultimoMesPagado} <br/>
                                    Meses a pagar:                                  
                                </Card.Text></center><br/>
                                <Form.Control 
                                size="sm" 
                                type="number"
                                min="0"
                                name={item.canti}
                                value={lotes[item.canti].mod}
                                onChange={handleChange}                                
                                />
                                <center><Button 
                                className="mt-3" 
                                size="sm" 
                                variant="success" 
                                onClick={()=>actualizar(item.canti, 1)}
                                style={{ width: '6rem'}}
                                >
                                    Agregar
                                </Button>
                                <Button 
                                className="mt-3" 
                                size="sm" 
                                variant="warning" 
                                onClick={()=>actualizar(item.canti, 2)}
                                style={{ width: '6rem'}}
                                >
                                    Quitar
                                </Button></center>
                                </Card.Body>
                            </Card>                            
                            </Col>
                            
                            )                            
                        })                     
                    }                                                                                          
                </Row> 
                        )
                    )                    
                }                                                          
            </Container> 
        </Fragment>
    )
}
export default withRouter(Manzana)