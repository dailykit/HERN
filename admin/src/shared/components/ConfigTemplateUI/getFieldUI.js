import React from "react"
import _ from "lodash"
import {
    ColorPicker,
    Text,
    Toggle,
    Number,
    Checkbox,
    Date,
    Time,
    Select,
    TextArea,
    TextWithSelect,
    NumberWithSelect,
    PhoneNumberSelector,
    ImageUpload,
    RichText,
    CollectionSelector
} from "./UIComponents"
import { Address } from "./UIComponents/Address"

export const getFieldUI = ({ fieldKey, configJSON, onConfigChange, isValid, setIsValid, configSaveHandler, value }) => {
    const field = _.get(configJSON, key)
    const indentation = `${key.split(".").length * 8}px`
    let configUI
    if (field.dataType === "boolean" && field.userInsertType === "toggle") {
        configUI = (
            <>{editMode ? <Toggle
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={(name, value) => onConfigChange(name, value)}
            /> : (<Flex
                container
                justifyContent="space-between"
                alignItems="center"
                margin={`0 0 0 ${indentation}`}
            >
                <Flex container alignItems="flex-end">
                    <Form.Label title={value.label} htmlFor="toggleValue">
                        {value.label.toUpperCase()}
                    </Form.Label>
                </Flex>
                <p>{value.value && value.default ? 'TRUE' : 'FALSE'}</p>
            </Flex>)}</>

        )
    } else if (
        field.dataType === "color" &&
        field.userInsertType === "colorPicker"
    ) {
        configUI = (
            <ColorPicker
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "text" &&
        field.userInsertType === "textField"
    ) {
        configUI = (
            <Text
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                validationType={field?.validationType}
                isValid={isValid}
                setIsValid={setIsValid}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "number" &&
        field.userInsertType === "numberField"
    ) {
        configUI = (
            <Number
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "boolean" &&
        field.userInsertType === "checkbox"
    ) {
        configUI = (
            <>
                {editMode ? (
                    <Checkbox
                        fieldDetail={field}
                        marginLeft={indentation}
                        path={fieldKey}
                        onConfigChange={onConfigChange}
                    />
                ) : (
                    <p>
                        {value.label} {value.value === true ? 'YES' : 'NO'}
                    </p>
                )}
            </>
        )
    } else if (
        field.dataType === "date" &&
        field.userInsertType === "datePicker"
    ) {
        configUI = (
            <Date
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
            />
        )
    } else if (field.dataType === "time" && field.userInsertType === "time") {
        configUI = (
            <Time
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "select" &&
        field.userInsertType === "dropdown"
    ) {
        configUI = (
            <Select
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
            />
        )
    } else if (field.dataType === "text" && field.userInsertType === "textArea") {
        configUI = (
            <TextArea
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "text" &&
        field.userInsertType === "textWithSelect"
    ) {
        configUI = (
            <TextWithSelect
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "number" &&
        field.userInsertType === "numberWithSelect"
    ) {
        configUI = (
            <NumberWithSelect
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
            />
        )
    }
    else if (
        field.dataType === "phoneNumber" &&
        field.userInsertType === "phoneNumber"
    ) {
        configUI = (
            <PhoneNumberSelector
                setIsValid={setIsValid}
                isValid={isValid}
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
            />
        )
    }

    else if (
        field.dataType === "address" &&
        field.userInsertType === "addressField"
    ) {
        configUI = (
            <Address
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
                configSaveHandler={configSaveHandler}
                configJSON={configJSON}
            />
        )
    }
    else if (
        field.dataType === "imageUpload" &&
        field.userInsertType === "imageUpload"
    ) {
        configUI = (
            <ImageUpload
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
                configSaveHandler={configSaveHandler}
                configJSON={configJSON}
            />
        )
    }
    else if (
        field.dataType === 'html' &&
        field.userInsertType === 'richTextEditor'
    ) {
        configUI = (
            <RichText
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
            />
        )
    } else if (field.userInsertType === 'collectionSelector') {
        configUI = (
            <CollectionSelector
                fieldDetail={field}
                marginLeft={indentation}
                path={fieldKey}
                onConfigChange={onConfigChange}
            />
        )
    }
    return <div data-config-path={fieldKey}>{configUI}</div>
}

export const FieldUI = ({ fieldKey, configJSON, onConfigChange, value }) => {
    const { editMode } = useEditMode()
    return (
        <div>
            {getFieldUI(fieldKey, configJSON, onConfigChange, editMode, value)}
        </div>
    )
}