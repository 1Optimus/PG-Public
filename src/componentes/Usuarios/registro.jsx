import React, { useState, useEffect, useCallback } from 'react'
import  {  withRouter } from 'react-router-dom'
import { Button,Row, Col, Container, Form, Alert, Toast } from 'react-bootstrap';
import { auth, db, fbAdmin } from '../../fb'
import '../css/estilo.css'
const Registro=(props)=>{    
    const [email, setEmail] = useState('')
    const [pass, setPass] = useState('')
    const [fecha, setFecha] = useState('')
    const [lote, setLote] = useState('')
    const [manz, setManz] = useState('0')
    const [estado, setEstado] = useState(false)
    const [msgerror, setError] = useState(null)
    const [user, setUser] = useState(null)
    const [showA, setShowA] = useState(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const toggleShowA = () => setShowA(!showA)
    const abc=['A','B','C','D','E','F','G','H','I',
    'J','K','L','M','N','O','P','Q','R','S','T','U'
    ,'V','W','X','Y','Z']
    //gestion de fecha
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
    const registrar = useCallback(async(e) => {
        e.preventDefault()
        if(!email.trim() || !pass.trim()){
            setError('Algunos campos estan vacios')
            return
        }
        if(pass.length < 6){
            setError('La contraseña debe de tener 6 o más carácteres')
            return
        }
        if(!fecha.trim()){
            setError('Debe de seleccionar una fecha')
            return
        }
        if(manz==='0'){
            setError('Debe de seleccionar una manzana')
            return
        }
        if(!lote.trim()){
            setError('Debe de ingresar un lote')
            return
        }   
        try {
            var ProvUid=''
            const usua=manz+lote
            await fbAdmin.auth().createUserWithEmailAndPassword(email, pass)
            .then(function(newUser) {
                //update del nombre del perfil                
                fbAdmin.auth().currentUser.updateProfile({
                displayName: usua
                }).then(() => {
                console.log('actulizado')                
                }).catch((error) => {
                console.log('error registro ingreso')
                });
                ProvUid=fbAdmin.auth().currentUser.uid;
                //creando perfil de usuario
                db.collection('residentes').doc(ProvUid).set({
                    fechaCreacion: Date.now(),
                    email: fbAdmin.auth().currentUser.email,
                    lote:lote,
                    manzana:manz,
                    tipo:'Residente',
                    estado:estado,                
                    areas:true,
                    uid: ProvUid                
                }) 
                //creando perfil en pagos
                db.collection('control').doc(ProvUid).set({
                    lote:lote,
                    manzana:manz,
                    ultimoMesPagado:fecha                                  
                }).then(() => {
                    return db.collection('control').doc(ProvUid)
                    .collection('pagos').add({
                            lote:lote,
                            manzana:manz,
                            fecha:fecha,
                            mesPagado:fecha,
                            accion:'pago'
                    });
                })
                //deslogeo de usuario recien creado en ambiente 2 de FB
            fbAdmin.auth().signOut()
            .then(function () {
                console.log('adios');
            }, function (error) {
                // An error happened.
                console.log('Error siging out of fbAdmin.');
                console.log(error);
            });
            }, function (error) {
            // There's a problem here.
            console.log(error.code);
            console.log(error.message+'error al agregar usuario');
            })                                              
            setEmail('')
            setPass('')
            setManz('0')
            setEstado(false)
            setLote('0')
            toggleShowA()
            setError(null)     
        } catch (e) {
            if(e.code==='auth/invalid-email'){
                setError('Correo invalido')
                return
            }
            if(e.code==='auth/weak-password'){
                setError('Contraseña debil')
                return
            }
            if(e.code === 'auth/email-already-in-use'){
                setError('Usuario ya registrado...')
                return
            }
            if(e.code === 'auth/network-request-failed'){
                setError('Al parecer ocurrio un error con la red de internet')
                return
            }
        }
    }, [email, estado, fecha, lote, manz, pass, toggleShowA])    
    return(
        <div >  
        {
                user && (             
        <Container className="ini shadow col-md-6 justify-content-center align-items-center mt-3 pb-2">
            <Col className="mb-2 mb-md-5">
            <Row>
                <Col className="inic text-white text-center font-weight-bolder display-4 mb-md-4 mb-2">
                    Nuevo usuario
                </Col>
            </Row>
            <form>
            <Row>                
                <Col>
                    <Form.Group className="mb-3 offset-md-3 col-md-6" controlId="formBasicEmail">
                        <Form.Control 
                        type="email"
                        value={email}
                        placeholder="Ingrese el correo del residente"
                        onChange={(e)=>{setEmail(e.target.value)}} />
                     </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-2 offset-md-3 col-md-6" controlId="formBasicPassword">                    
                        <Form.Control 
                        type="password"
                        value={pass}                        
                        placeholder="Contraseña temporal"
                        onChange={(e)=>{setPass(e.target.value)}} />
                    </Form.Group>                
                </Col>
            </Row> 
            <Row>
                <Col>
                    <Form.Group className="offset-md-3 col-md-6 d-flex justify-content-around" 
                    controlId="formBasicdate">                    
                    <Form.Label column>
                        Último mes pagado:
                    </Form.Label>
                        <Form.Control 
                        type="date" 
                        className="w-50" 
                        onChange={(e)=>{setFecha(e.target.value)}}
                        />
                    </Form.Group>                
                </Col>
            </Row>
            <Row>
                <Col className="col-12">
                    <Col className="d-flex justify-content-around col-12 mt-md-3 mt-1">
                    <Form.Label >
                        Manzana y lote del residente:
                    </Form.Label>
                    </Col>
                    <Col className="d-flex justify-content-around col-12 mt-md-3 mt-2">
                    <select 
                    onChange={(e)=>{setManz(e.target.value)}} 
                    value={manz}>                                
                        <option value="0" key="0" defaultValue>Seleccione manzana</option>
                        {
                        abc.map(item => (
                            <option key={item} value={item}>{item}</option>
                        ))
                        }
                    </select> 
                    </Col>
                    <Col className="d-flex justify-content-around col-12 mt-md-3 mt-2">
                    <Form.Control 
                    type="number" 
                    className="w-25" 
                    placeholder="# Lote"
                    min="1"
                    onChange={(e)=>{setLote(e.target.value)}} 
                    value={lote}>                        
                    </Form.Control>
                    </Col>
                </Col>
                <Col className="d-flex justify-content-around mt-md-3 mt-2 col-12">
                    <Form.Group controlId="formBasicCheckbox">
                        <Form.Check 
                        type="checkbox" 
                        label="¿Habilitar visitas?" 
                        checked={estado} 
                        onChange={()=>{setEstado(!estado)}} />
                    </Form.Group>
                </Col>
            </Row>   
            </form>          
            <Row>
                <Col className="d-flex justify-content-center">
                    <Button variant="primary"
                    type="submit"                    
                    className="bott rounded mt-2 mt-md-4 w-50"
                    onClick={registrar}
                    >
                        Registrar usuario
                    </Button>                  
                </Col>
            </Row>
            {
            msgerror !=null ?
            (<center><Alert variant='danger' className="w-50 h-25">
                {msgerror}
              </Alert></center>
            ):(
            <div>                        
            </div>)
            }           
            </Col>
            <center>
            <Toast show={showA} onClose={toggleShowA} bg='Success'>
                <Toast.Header>
                    <strong className="me-auto text-dark">Registro de usuarios</strong>
                </Toast.Header>
                <Toast.Body  className='Dark text-dark'>El usuario ha sido registrado con exito</Toast.Body>
            </Toast>            
            </center>
        </Container>
        )
    }
        </div>
    )
}
export default withRouter(Registro)