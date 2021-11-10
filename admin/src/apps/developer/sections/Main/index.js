import Home from '../../views/Home';
import { Route } from 'react-router-dom';
import React from 'react';
import { Webhooks } from '../../views/Listing';
import {ApiKeyListing} from '../../views/Listing'

const Main = () => {
    return (
        <>
        
            <Route exact path="/developer" component={ Home } />
            <Route exact path="/developer/webhook" component={ Webhooks } />
            <Route exact path="/developer/apiKey" component={ ApiKeyListing } />

        </>
    )
}

export default Main;