import React from 'react';
import { DashboardTile, Loader } from '@dailykit/ui';
import { useTranslation } from 'react-i18next';
import { useTabs } from '../../../../shared/providers';
import { StyledHome, StyledCardList } from './styled'
import { Banner } from '../../../../shared/components'
import {logger}  from '../../../../shared/utils'
import { useQuery, useSubscription } from '@apollo/react-hooks';
import { GET_WEBHOOK_URL_EVENTS_COUNT, GET_API_KEY_COUNT } from '../../graphql';
import { WebhookSvg, ApiKeySvg } from '../../../../shared/assets/illustrationTileSvg';

const address = 'apps.developer.views.home.';

const Home = () => {
    const { addTab } = useTabs();
    const { t } = useTranslation();
    const {loading:webhookUrlCountLoading, error:webhookUrlCountError, data:webhookUrlCountData} = useSubscription(GET_WEBHOOK_URL_EVENTS_COUNT)
    const {loading:apiKeyCountLoading, error:apiKeyCountError, data:apiKeyCountData} = useSubscription(GET_API_KEY_COUNT)
    if(webhookUrlCountLoading||apiKeyCountLoading) return <Loader />
    if(webhookUrlCountError) {
        logger(webhookUrlCountError)
        return null
    }
    if(apiKeyCountError) {
        logger(apiKeyCountError)
        return null
    }

    const webhookUrl_eventsCount = webhookUrlCountData.developer_webhookUrl_events_aggregate.aggregate.count
    const apiKey_Count = apiKeyCountData.developer_apiKey_aggregate.aggregate.count

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
                            tileSvg={<WebhookSvg />}
                        />
                        <DashboardTile
                            // title={t(address.concat('webhook'))}
                            title="Api Key"
                            conf="Add Api Key"
                            count={apiKey_Count || "..."}
                            onClick={() => addTab('Api Key', '/developer/apiKey')}
                            tileSvg={<ApiKeySvg />}
                        />
                    </StyledCardList>
                    {/* <Banner id="developer-app-home-bottom" />    */}
                </StyledHome>
            </>
    )
}

export default Home;