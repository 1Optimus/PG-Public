import React, { Fragment, useState, useEffect } from "react";
import { withRouter,NavLink } from "react-router-dom";
import { auth, db } from "../fb";
import { LinkContainer } from "react-router-bootstrap";
import usuario from '../componentes/figuras/usuario.png';
import { Container,Navbar,Nav,Button } from 'react-bootstrap';
const Menu = (props) => {
  const [datos, setDatos] = useState([])
  const [estado, setEstado] = useState(0)
  const obtenerRegistros = async ()=>{    
    try {
        const datos2= await db.collection('modulos').doc('estados').get()
        if (!datos2.exists) {            
          } else {
            setEstado(1)
            setDatos(datos2.data())
          }
    } catch (error) {
        console.log(error)
        if (error.code==='permission-denied') {            
        } else {
            console.log(error)            
        }
    }                   
}
  const cerrarSesion = () => {
    props.history.push('login')
    auth.signOut();
  }
  useEffect(() => {    
    obtenerRegistros()
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.history])
  return (
    
    <Fragment>
      {
      estado===1&&(<>
  {props.fbuser && (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
    <Container>
    <Navbar.Brand>Greystone</Navbar.Brand>
    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
    <Navbar.Collapse id="responsive-navbar-nav">     
      <Nav className="me-auto" activeKey={window.location.pathname}>   
      {datos.Pagos&&(
        <>
        {(!auth.currentUser.displayName.includes("Z"))&&(
        <LinkContainer to="/estado">
          <Nav.Link>Pagos</Nav.Link>
        </LinkContainer>
        )}        
        {auth.currentUser.displayName==="Z1"&&(
          <>
        <LinkContainer to="/pagos">
          <Nav.Link>Realizar pago</Nav.Link>
        </LinkContainer> 
          </>
        )}
        </>
      )}    
      {datos.Piscina&&(
        <>
        {(!auth.currentUser.displayName.includes("Z"))&&(
        <LinkContainer to="/piscina">
          <Nav.Link>Piscinas</Nav.Link>
        </LinkContainer>
        )}
        {auth.currentUser.displayName==="Z1"&&(
        <LinkContainer to="/histopiscina">
          <Nav.Link>Piscinas</Nav.Link>
        </LinkContainer> 
        )}        
        </>
      )}
      {datos.Visitas&&(
        <>
        {(!auth.currentUser.displayName.includes("Z"))&&(
        <LinkContainer to="/visita">
          <Nav.Link>Visitas</Nav.Link>
        </LinkContainer>
        )}        
        {auth.currentUser.displayName==="Z1"&&(
          <>
        <LinkContainer to="/histoac">
          <Nav.Link>Historial de visitas</Nav.Link>
        </LinkContainer> 
        <LinkContainer to="/visita">
          <Nav.Link>Visitas</Nav.Link>
        </LinkContainer>
        </>
        )}
        </>
      )}
      {auth.currentUser.displayName==="Z2"&&(
          <>
        <LinkContainer to="/visual">
          <Nav.Link>Visitantes</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/histoac">
          <Nav.Link>Historial de visitas</Nav.Link>
        </LinkContainer> 
        </>
        )}
      {auth.currentUser.displayName==="Z3"&&(
        <LinkContainer to="/Visualizacion">
          <Nav.Link>Historial de pagos</Nav.Link>
        </LinkContainer>
      )}
      {auth.currentUser.displayName==="Z1"&&(
        <>
        <LinkContainer to="/mod">
        <Nav.Link>Modulos</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/registro">
        <Nav.Link>Nuevo usuario</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/usuario">
        <Nav.Link>Gestion de usuarios</Nav.Link>
        </LinkContainer>
        </>
      )}          
      </Nav>
      <Nav>
      <Button variant="secondary" size="sm" onClick={()=>cerrarSesion()}>
      Cerrar sesión
      </Button>
      </Nav>
      {auth.currentUser.displayName!=="Z2"&&(
      <Nav>
        <NavLink className="mx-4" to='/inicio'> 
        <center>
          <img
            src={usuario}
            height="30px" 
            width="30px"
            alt="usuario" 
            />
        </center>
          </NavLink>
      </Nav>
      )}
    </Navbar.Collapse>
    </Container>
    </Navbar>
)}
</>
)
}
    </Fragment>
  );
};
export default withRouter(Menu);
