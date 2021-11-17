import React from 'react';
import { Wrapper } from './styled';
import { useApiKey } from '../state';
import { Text, TextButton, Flex, HorizontalTab, HorizontalTabs, HorizontalTabList, HorizontalTabPanel, HorizontalTabPanels } from '@dailykit/ui';
import { ApiKeyInfo } from './info';
// import { ApiKeyPermissions } from './permissions';


const ApiKeyDetails = () => {
    const {state, dispatch} = useApiKey()

    return (
        <>
            <Wrapper>
                <Flex container alignItems="center" justifyContent="space-between">
                    <Flex container height="80px" alignItems="center">
                    <Text as="h2">
                        Api Key Details
                    </Text>
                    </Flex>
                    {state.apiKeySelected &&
                    <TextButton size="sm" type="outline" style={{"color":"red", "border-color": "red", "padding": "4px 20px 25px 20px"}} onClick={()=>{
                    if (window.confirm("Are you sure you wan to delete this api key ?")){
                    state.apiKeyDeleteFunction({variables: {"apiKey": state.apiKeyDetails.apiKey}})
                    dispatch({type:'SET_API_KEY_SELECTED', payload: false})
                    }
                    
                }}>Delete</TextButton>}
                </Flex>
                <div style={{
                    height: 'calc(100vh - 32px)'
                    }}>
                    <HorizontalTabs>
                    <HorizontalTabList>
                        <HorizontalTab style={{"margin-right": "10px"}}>Info</HorizontalTab>
                        <HorizontalTab style={{"margin-right": "10px"}}>Permissions</HorizontalTab>
                    </HorizontalTabList>
                    <HorizontalTabPanels>
                        <HorizontalTabPanel>
                            {state.apiKeySelected ?
                            <ApiKeyInfo />:
                            <Text as="h3">Select an api key to see details</Text>}
                        </HorizontalTabPanel>
                        {/* <HorizontalTabPanel>
                            {state.apiKeySelected ?
                            <ApiKeyPermissions />:
                            <Text as="h3">Select an api key to see details</Text>}
                        </HorizontalTabPanel> */}
                    </HorizontalTabPanels>
                    </HorizontalTabs>
                </div>
            </Wrapper>
        </>
    )
}

export default ApiKeyDetails