import React, {  useState, useEffect } from "react";
import { auth } from '../fb'
import  { useHistory, withRouter } from 'react-router-dom'
import './css/login.css'
import { Button,Row, Col, Container, Form, Alert } from 'react-bootstrap';
const Login=(props)=>{    
    const [email, setEmail] = useState('')
    const [pass, setPass] = useState('')
    const [msgerror, setError] = useState(null)
    const historial= useHistory()        
    const loginUsuario =()=>{
        if(!email.trim() || !pass.trim()){
            setError('Algunos campos estan vacios')
            return
        }
        if(pass.length < 6){
            setError('La contraseña debe de tener 6 o más carácteres')
            return
        }
        setError(null)        
        auth.signInWithEmailAndPassword(email, pass)
        .then((r)=>historial.push('/estado'))
        .catch((err)=>{              
            if (err.code==='auth/wrong-password') {
                setError('Contraseña o correo es invalido')
            }else if (err.code==='auth/user-not-found') {
                setError('Contraseña o correo es invalido')
            }else {
                setError('Posible error desconocido:'+err) 
            }
          })          
    }
    useEffect(() => {
        if(auth.currentUser){
                props.history.push('/estado')
        }
    }, [props.history])
    return(
        <div className='fondo m-0 vh-100 row justify-content-center align-items-center'> 
        <Container className="iniL shadow col-10 offset-1 col-md-4 offset-md-4 justify-content-center align-items-center">
            <Col className=" mb-3">
            <Row>
                <Col className="inic text-white text-center font-weight-bolder display-4 mb-3">
                    Iniciar sesión
                </Col>
            </Row>
            <Row>                
                <Col>
                    <Form.Group className="mb-3 offset-md-3 col-md-6" controlId="formBasicEmail">
                        <Form.Control type="email"
                        placeholder="Ingrese correo"
                        onChange={(e)=>{setEmail(e.target.value)}} />
                     </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="offset-md-3 col-md-6" controlId="formBasicPassword">                    
                        <Form.Control type="password"
                        placeholder="Contraseña"
                        onChange={(e)=>{setPass(e.target.value)}} />
                    </Form.Group>                
                </Col>
            </Row>
            <Row>
                <Col className="d-flex justify-content-center">
                    <Button 
                    variant="primary"
                    type="submit"                    
                    className="rounded mt-3"
                    onClick={loginUsuario}
                    >
                        Iniciar sesion
                    </Button>                  
                </Col>
            </Row> 
            {
            msgerror !=null ?
            (<center><Alert variant='danger' className="w-50 h-25 pt-2">
                {msgerror}
              </Alert></center>
            ):(
            <div>                        
            </div>)
            }           
            </Col>
        </Container>
        </div>
    )
}
export default withRouter(Login)