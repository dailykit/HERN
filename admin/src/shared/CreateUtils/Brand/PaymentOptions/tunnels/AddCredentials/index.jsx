import { useSubscription } from '@apollo/react-hooks'
import { Flex, TunnelHeader } from '@dailykit/ui'
import React from 'react'
import { PAYMENT_OPTIONS } from '../../../../../../apps/brands/graphql'
import { Tooltip } from '../../../../../components'
import { TunnelBody } from '../../../../styled'
import { SettingsCard } from './settingsCard'

export const AddCredentials = ({ closeTunnel, paymentId }) => {
    const [isChangeSaved, setIsSavedChange] = React.useState(true)
    const [mode, setMode] = React.useState('saved')
    const [saveAllSettings, setSaveAllSettings] = React.useState({})
    const [componentIsOnView, setIsComponentIsOnView] = React.useState([])
    const [alertShow, setAlertShow] = React.useState(false)
    const newMap = [
        { id: 1, label: 'publicCreds' },
        { id: 2, label: 'privateCreds' }
    ]
    const { loading, error, data: { brands_availablePaymentOption: paymentOption = [] } = {} } = useSubscription(PAYMENT_OPTIONS.VIEW_CREDS, {
        variables: {
            id: {
                _eq: paymentId
            }
        }
    })
    console.log(paymentOption);
    return (
        <div>
            <TunnelHeader title="Add Credentials"
                close={() => (
                    closeTunnel(1)
                )}
                tooltip={<Tooltip identifier="create_payment_option_tunnelHeader" />}
            />
            <TunnelBody>
                <Flex>
                    {paymentOption.map(option => {
                        return (
                            <div key={option.id}>
                                {newMap.map(each => {
                                    return (
                                        <div key={each.id}>
                                            <a
                                                name={option.label}
                                            ></a>
                                            <SettingsCard
                                                option={option}
                                                key={each?.id}
                                                title={each?.label}
                                                creds={each?.label}
                                                isChangeSaved={isChangeSaved}
                                                setIsSavedChange={setIsSavedChange}
                                                setIsComponentIsOnView={
                                                    setIsComponentIsOnView
                                                }
                                                componentIsOnView={componentIsOnView}
                                                mode={mode}
                                                setMode={setMode}
                                                saveAllSettings={saveAllSettings}
                                                setSaveAllSettings={setSaveAllSettings}
                                                alertShow={alertShow}
                                                setAlertShow={setAlertShow}
                                            />
                                        </div>
                                    )
                                })}

                            </div>
                        )
                    })}
                </Flex>
            </TunnelBody>
        </div>
    )
}
