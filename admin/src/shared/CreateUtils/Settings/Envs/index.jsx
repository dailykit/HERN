import { useMutation } from '@apollo/react-hooks'
import { ButtonGroup, Flex, Form, IconButton, Spacer, Text, TextButton, TunnelHeader } from '@dailykit/ui'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { ENVS } from '../../../../apps/settings/graphql'
import { DeleteIcon } from '../../../assets/icons'
import { logger } from '../../../utils'
import { ContainerCard, RadioButton, RadioGroupOption, TunnelBody } from '../../styled'
import validatorFunc from '../../validator'

const CreateEnvTunnel = ({ closeTunnel }) => {
    //declaration
    const [allEnvObjects, setAllEnvObjects] = useState()
    const envInstance = {
        envTitle: {
            value: '',
            meta: {
                isTouched: false,
                isValid: false,
                errors: [],
            },
        },
        envValue: {
            value: '',
            meta: {
                isTouched: false,
                isValid: false,
                errors: [],
            },
        },
        belongsTo: {
            value: null,
        }
    }
    const EnvInstances = [envInstance]
    const [envs, setEnvs] = useState(EnvInstances)
    const options = [
        { id: 1, payload: 'admin', title: 'Admin' },
        { id: 2, payload: 'server', title: 'server' },
        { id: 3, payload: 'store', title: 'Store' },
    ]

    //mutation
    const [createEnvs, { loading: inFlight }] = useMutation(
        ENVS.CREATE,
        {
            onCompleted: (data) => {
                const addedData = data.insert_settings_env.returning.map(each => { return each.title })
                const remainingData = allEnvObjects.filter(({ title }) => !addedData.includes(title))
                if (remainingData.length === 0 && allEnvObjects.length === addedData.length) {
                    toast.success('New Env added!')
                } else if (addedData.length === 0) {
                    toast.error(allEnvObjects.length > 1 ? 'All Envs are present' : 'Env is already present')
                } else if (allEnvObjects.length !== addedData.length) {
                    remainingData.forEach(element => {
                        toast.error(`${element.title} Env is already present for ${element.belongsTo}`)
                    })
                    toast.success('Remaining envs added!')
                }
                closeTunnel(1)
            },
            onError: error => {
                console.log(error);
                toast.error('Something went wrong!')
                logger(error)
            },
        }
    )
    // all added  remaining null && all.length === added.length
    // few added  all.length !== added.data
    // none added added.length === 0
    //handler
    const handleEnvChange = (field, value, index) => {
        const newEnvs = [...envs]
        newEnvs[index] = {
            ...newEnvs[index],
            [field]: {
                ...newEnvs[index][field],
                value,
            },
        }
        setEnvs([...newEnvs])
    }
    const handleEnvFocus = (field, index) => {
        const newEnvs = [...envs]
        newEnvs[index] = {
            ...newEnvs[index],
            [field]: {
                ...newEnvs[index][field],
                meta: {
                    isTouched: true,
                    isValid: true,
                    errors: [],
                },
            },
        }
        setEnvs([...newEnvs])
    }
    const validate = (field, index) => {
        const { isValid, errors } = validatorFunc['text'](envs[index][field].value)
        const newEnvs = envs
        newEnvs[index] = {
            ...envs[index],
            [field]: {
                ...envs[index][field],
                meta: {
                    isTouched: false,
                    isValid,
                    errors,
                },
            },
        }
        setEnvs([...newEnvs])
    }
    const createEnvsHandler = () => {
        try {
            const objects = envs.filter(Boolean).map(eachEnv => ({
                title: eachEnv.envTitle.value,
                value: eachEnv.envValue.value,
                belongsTo: eachEnv.belongsTo.value,
                config: {
                    env_details: {
                        label: eachEnv.envTitle.value,
                        value: eachEnv.envValue.value,
                        dataType: "text",
                        userInsertType: "textField"
                    }
                }
            }))
            if (!objects.length) {
                throw Error('Nothing to add!')
            }
            setAllEnvObjects(objects)
            console.log('objects', objects)
            createEnvs({
                variables: {
                    objects,
                },
            })
        } catch (error) {
            toast.error(error.message)
        }
    }

    //remove and addition extra of envs 
    const addField = () => {
        if (envs.every(object => object.envTitle.value.trim().length &&
            object.envValue.value.trim().length &&
            object.belongsTo.value
        )) {
            setEnvs([
                ...envs,
                envInstance
            ])
        } else {
            toast.error("Fill all existing fields!")
        }
    }
    const removeField = index => {
        const newEnvs = envs
        if (newEnvs.length > 1) {
            newEnvs.splice(index, 1)
            setEnvs([...newEnvs])
        } else {
            toast.error('Envs should be atleast 1 !')
        }
    }

    const save = () => {
        if (inFlight) return
        const envsValidation = envs.every(object =>
            object.envTitle.meta.isValid && object.envValue.meta.isValid && object.belongsTo.value)
        if (envsValidation === true) {
            return createEnvsHandler()
        }
        return toast.error('All Fields Are required!')
    }
    return (
        <>
            <TunnelHeader
                title="Create new Envs"
                right={{
                    action: save,
                    title: "Save"
                }}
                close={() => closeTunnel(1)}
            />
            <TunnelBody>
                {envs.map((eachEnvs, index) => (
                    <ContainerCard key={index} >
                        <Form.Group>
                            <Flex
                                container
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Form.Label htmlFor={`envTitle-${index}`} title={`envTitle ${index + 1}`}>
                                    Env Title
                                </Form.Label>
                                <IconButton
                                    type="ghost"
                                    title="Delete this Env"
                                    onClick={() => removeField(index)}
                                    style={{
                                        width: '30px',
                                        height: '20px',
                                        marginBottom: '4px',
                                    }}
                                >
                                    <DeleteIcon color="#FF5A52" />
                                </IconButton>
                            </Flex>
                            <Form.Text
                                id={`envTitle-${index}`}
                                name={`envTitle-${index}`}
                                value={eachEnvs.envTitle.value}
                                onChange={e => handleEnvChange(
                                    "envTitle",
                                    e.target.value,
                                    index
                                )}
                                onFocus={() => {
                                    handleEnvFocus('envTitle', index)
                                }}
                                onBlur={() => validate('envTitle', index)}
                                placeholder="Enter Env Title"
                                hasError={
                                    eachEnvs.envTitle.meta.isTouched &&
                                    !eachEnvs.envTitle.meta.isValid
                                }
                            />
                            {!eachEnvs.envTitle.meta.isTouched &&
                                !eachEnvs.envTitle.meta.isValid &&
                                eachEnvs.envTitle.meta.errors.map(
                                    (error, index) => (
                                        <Form.Error key={index}>
                                            {error}
                                        </Form.Error>
                                    )
                                )}
                        </Form.Group>
                        <Spacer size="16px" yAxis />
                        <Form.Group>
                            <Form.Label htmlFor={`envValue-${index}`} title={`Env Value ${index + 1}`}>
                                Env Value
                            </Form.Label>
                            <Form.Text
                                id={`envValue-${index}`}
                                name={`envValue-${index}`}
                                value={eachEnvs.envValue.value}
                                onChange={e => handleEnvChange(
                                    "envValue",
                                    e.target.value,
                                    index
                                )}
                                onFocus={() => {
                                    handleEnvFocus('envValue', index)
                                }}
                                onBlur={() => validate('envValue', index)}
                                placeholder="Enter Env Value"
                                hasError={
                                    eachEnvs.envValue.meta.isTouched &&
                                    !eachEnvs.envValue.meta.isValid
                                }
                            />
                            {!eachEnvs.envValue.meta.isTouched &&
                                !eachEnvs.envValue.meta.isValid &&
                                eachEnvs.envValue.meta.errors.map(
                                    (error, index) => (
                                        <Form.Error key={index}>
                                            {error}
                                        </Form.Error>
                                    )
                                )}
                        </Form.Group>
                        <Spacer size="16px" yAxis />
                        <Text
                            as='subtitle'
                            style={{ color: '#57567a', marginBottom: '4px' }}
                        >
                            Belongs To
                        </Text>
                        <RadioGroupOption>
                            {options.map(option => (
                                <RadioButton
                                    key={`${index}-${option.id}`}
                                    onClick={() => {
                                        option.payload === eachEnvs.belongsTo.value ? handleEnvChange(
                                            "belongsTo",
                                            null,
                                            index
                                        ) : handleEnvChange(
                                            "belongsTo",
                                            option.payload,
                                            index
                                        )
                                    }}
                                    active={eachEnvs.belongsTo.value === option.payload}
                                >
                                    <span>{option.title}</span>
                                </RadioButton>
                            ))}
                        </RadioGroupOption>
                    </ContainerCard>
                ))
                }
                <ButtonGroup>
                    <TextButton
                        title="Add more envs"
                        type='ghost'
                        size='sm'
                        onClick={addField}>
                        + Add More
                    </TextButton>
                </ButtonGroup>
            </TunnelBody>
        </>
    )
}

export default CreateEnvTunnel