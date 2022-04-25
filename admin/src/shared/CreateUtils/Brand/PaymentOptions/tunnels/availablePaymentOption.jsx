import React, { useState } from 'react'
import { Form, Spacer, Tunnel, TunnelHeader, Tunnels, useTunnel } from '@dailykit/ui'
import { InlineLoader, Tooltip } from '../../../../components'
import { TunnelBody } from '../../../styled'
import { OptionList, StyledText } from '../styled'
import validatorFunc from '../../../validator'
import { toast } from 'react-toastify'
import { logger } from '../../../../utils'
import { useMutation } from '@apollo/react-hooks'
import { PAYMENT_OPTIONS } from '../../../../../apps/brands/graphql'

export const AvailablePaymentOption = ({ close, companyDetails }) => {

    const [availablePaymentOption, setAvailablePaymentOption] = useState(null)
    const [label, setLabel] = useState(
        {
            value: '',
            meta: {
                isTouched: false,
                isValid: true,
                errors: [],
            },
        }
    )

    const [updateLocation] = useMutation(PAYMENT_OPTIONS.UPDATE_LABEL, {
        onCompleted: (data) => {
            if (data.insert_brands_availablePaymentOption.affected_rows === 0) {
                toast.error('Already Present payment method!')
            } else {
                toast.success('Updated!')
            }
        },
        onError: error => {
            toast.error('Something went wrong!')
            console.log('error', error)
            logger(error)
        },
    })

    const onChange = (field, value) => {
        setLabel({
            ...label,
            value,
        })
    }
    const onBlur = field => {
        const { isValid, errors } = validatorFunc.text(label.value)
        if (isValid) {
            updateLocation({
                variables: {
                    objects: {
                        label: label.value,
                        supportedPaymentOptionId: availablePaymentOption,
                    },
                    supportedPaymentOptionId: availablePaymentOption,
                }
            })
            setLabel({
                ...label,
                meta: {
                    isTouched: true,
                    isValid,
                    errors,
                },
            })
        }
    }
    return (
        <div>
            <TunnelHeader title="Select Payment option"
                right={{
                    action: () => {
                        console.log("selection", availablePaymentOption);
                    },
                    title: 'Next',
                }}
                close={() => (
                    close(1)
                )}
                tooltip={<Tooltip identifier="create_payment_option_tunnelHeader" />}
            />
            <TunnelBody>
                <OptionList>
                    {
                        companyDetails.supportedPaymentOptions.map(option => (
                            <StyledText
                                key={option.id}
                                onClick={() => setAvailablePaymentOption(option.id)}
                                active={option.id === availablePaymentOption}
                            >
                                {option.paymentOptionLabel}
                            </StyledText>
                        ))
                    }
                </OptionList>
                <Spacer yAxis size="48px" />
                {availablePaymentOption && <Form.Group>
                    <Form.Label
                        htmlFor={`Label`}
                        title={`Label`}
                    >
                        Label
                    </Form.Label>
                    <Form.Text
                        id={`Label`}
                        name={`Label`}
                        value={label.value}
                        placeholder="Enter Label"
                        onChange={e => onChange('value', e.target.value)}
                        onBlur={e => onBlur('value', e.target.value)}
                        hasError={
                            !label.meta.isValid &&
                            label.meta.isTouched
                        }
                    />
                    {label.meta.isTouched &&
                        !label.meta.isValid &&
                        label.meta.errors.map((error, index) => (
                            <Form.Error key={index}>{error}</Form.Error>
                        ))}
                </Form.Group>
                }

            </TunnelBody>
        </div>
    )
}
