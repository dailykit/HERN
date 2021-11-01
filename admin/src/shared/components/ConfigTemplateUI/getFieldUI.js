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
} from "./UIComponents"

export const getFieldUI = ({ key, configJSON, onConfigChange }) => {
    const field = _.get(configJSON, key)
    const indentation = `${key.split(".").length * 8}px`
    let configUi
    if (field.dataType === "boolean" && field.userInsertType === "toggle") {
        configUi = (
            <Toggle
                fieldDetail={field}
                marginLeft={indentation}
                path={key}
                onConfigChange={(name, value) => onConfigChange(name, value)}
            />
        )
    } else if (
        field.dataType === "color" &&
        field.userInsertType === "colorPicker"
    ) {
        configUi = (
            <ColorPicker
                fieldDetail={field}
                marginLeft={indentation}
                path={key}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "text" &&
        field.userInsertType === "textField"
    ) {
        configUi = (
            <Text
                fieldDetail={field}
                marginLeft={indentation}
                path={key}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "number" &&
        field.userInsertType === "numberField"
    ) {
        configUi = (
            <Number
                fieldDetail={field}
                marginLeft={indentation}
                path={key}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "boolean" &&
        field.userInsertType === "checkbox"
    ) {
        configUi = (
            <Checkbox
                fieldDetail={field}
                marginLeft={indentation}
                path={key}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "date" &&
        field.userInsertType === "datePicker"
    ) {
        configUi = (
            <Date
                fieldDetail={field}
                marginLeft={indentation}
                path={key}
                onConfigChange={onConfigChange}
            />
        )
    } else if (field.dataType === "time" && field.userInsertType === "time") {
        configUi = (
            <Time
                fieldDetail={field}
                marginLeft={indentation}
                path={key}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "select" &&
        field.userInsertType === "dropdown"
    ) {
        configUi = (
            <Select
                fieldDetail={field}
                marginLeft={indentation}
                path={key}
                onConfigChange={onConfigChange}
            />
        )
    } else if (field.dataType === "text" && field.userInsertType === "textArea") {
        configUi = (
            <TextArea
                fieldDetail={field}
                marginLeft={indentation}
                path={key}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "text" &&
        field.userInsertType === "textWithSelect"
    ) {
        configUi = (
            <TextWithSelect
                fieldDetail={field}
                marginLeft={indentation}
                path={key}
                onConfigChange={onConfigChange}
            />
        )
    } else if (
        field.dataType === "number" &&
        field.userInsertType === "numberWithSelect"
    ) {
        configUi = (
            <NumberWithSelect
                fieldDetail={field}
                marginLeft={indentation}
                path={key}
                onConfigChange={onConfigChange}
            />
        )
    }
    return configUi
}