import React, { Fragment } from "react";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { auth } from './fb';
import { Spinner } from 'react-bootstrap';
import Inicio from './componentes/inicio.jsx';
import Login from './componentes/login.jsx';
import Menu from './componentes/menu.jsx';
import Visita from './componentes/visitas/visita.jsx';
import Estado from './componentes/Pagos/estado.jsx';
import Visual from './componentes/visual.jsx';
import Histoac from './componentes/histoac.jsx';
import Usuario from './componentes/Usuarios/usua.jsx';
import Pagos from './componentes/Pagos/pagos.jsx';
import VisPagos from './componentes/Pagos/visPagos.jsx';
import Registro from './componentes/Usuarios/registro';
import Piscina from './componentes/recreacion/piscinas';
import HistoPiscina from './componentes/recreacion/visPiscinas';
import Modulo from './componentes/modu.jsx';
function App() {
  const [fbuser,setFbuser]= React.useState(false)
  React.useEffect(() => {
   auth.onAuthStateChanged(user=>{
     if (user) {
       setFbuser(user)
     }else{
       setFbuser(null)
     }
   })
}, [])
  return fbuser!== false ? (
    <Fragment>
      <Router>      
        <Menu fbuser={fbuser}></Menu>
        <Switch>  
          <Route path='/Login' component={Login}></Route>          
          <Route path='/Visita' component={Visita}></Route>          
          <Route path='/inicio' component={Inicio}></Route>
          <Route path='/Histoac' component={Histoac}></Route>
          <Route path='/Usuario' component={Usuario}></Route>
          <Route path='/Registro' component={Registro}></Route>
          <Route path='/Visual' component={Visual}></Route>                    \
          <Route path='/mod' component={Modulo}></Route>                    
          <Route path='/Visualizacion' component={VisPagos}></Route> 
          <Route path='/Estado' component={Estado}></Route>
          <Route path='/Pagos' component={Pagos}></Route>
          <Route path='/histopiscina' component={HistoPiscina}></Route>
          <Route path='/piscina' component={Piscina}></Route>          
          <Route exact path='/' component={Inicio}></Route>          
          <Route path='*' component={NotFound}></Route>         
        </Switch>        
      </Router>
    </Fragment>
  ):(
    <center><Spinner animation="border"/></center>
  )
}
function NotFound() {
  return <><center><h1>Ha llegado a una página que no existe</h1></center></>;
}

export default App;