import Home from '../../views/Home';
import { Route } from 'react-router-dom';
import React from 'react';
// import WebhookEdit from '../../views/Forms/webhookEdit'
import { Webhooks } from '../../views/Listing';

const Main = () => {
    return (
        <>
        
            <Route exact path="/developer" component={ Home } />
            <Route exact path="/developer/webhook" component={ Webhooks } />
            {/* <Route exact path="/developer/webhook/:id" component={ WebhookEdit } /> */}

        </>
    )
}

export default Main;