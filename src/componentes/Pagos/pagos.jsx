import React, { Fragment, useState, useEffect } from "react";
import { auth } from '../../fb';
import {withRouter} from 'react-router-dom';
import Manzana from './manzana';
const Pagos=(props)=>{
    const [user, setUser] = useState(null)
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
        <Fragment>
            {
                user && (
                    <p>{}</p>
                )
            }
            <h1 align="center">Pagos</h1>
             <Manzana></Manzana>
        </Fragment>
    )
}
export default withRouter(Pagos)