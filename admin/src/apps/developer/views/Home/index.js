import React from 'react';
import { DashboardTile, Loader } from '@dailykit/ui';
import { useTranslation } from 'react-i18next';
import { useTabs } from '../../../../shared/providers';
import { StyledHome, StyledCardList } from './styled'
import { Banner } from '../../../../shared/components'
import {logger}  from '../../../../shared/utils'
import { useQuery, useSubscription } from '@apollo/react-hooks';
import { GET_WEBHOOK_URL_EVENTS_COUNT } from '../../graphql';

const address = 'apps.developer.views.home.';

const Home = () => {
    const { addTab } = useTabs();
    const { t } = useTranslation();
    const {loading, error, data} = useSubscription(GET_WEBHOOK_URL_EVENTS_COUNT)
    if(loading) return <Loader />
    if(error) {
        logger(error)
        return null
    }

    const webhookUrl_eventsCount = data.developer_webhookUrl_events_aggregate.aggregate.count

    return (
            <>
                <StyledHome>
                {/* <Banner id="developer-app-home-top" /> */}
                {/* <h1>{t(address.concat('developer app'))}</h1> */}
                <h1>Developer</h1>
                    <StyledCardList>
                        
                        <DashboardTile
                            // title={t(address.concat('webhook'))}
                            title="Webhook"
                            conf="Add Webhooks"
                            count={webhookUrl_eventsCount || "..."}
                            onClick={() => addTab('Webhook', '/developer/webhook')}
                        />
                        <DashboardTile
                            // title={t(address.concat('webhook'))}
                            title="Api Key"
                            conf="Add Api Key"
                            // count={webhookUrl_eventsCount || "..."}
                            onClick={() => addTab('Api Key', '/developer/apiKey')}
                        />
                    </StyledCardList>
                    {/* <Banner id="developer-app-home-bottom" />    */}
                </StyledHome>
            </>
    )
}

export default Home;