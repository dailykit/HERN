import styled, { css } from 'styled-components'

export const HistoryPanel = styled.div(
    ({ theme }) => css`
        grid-area: aside;
        overflow-y: auto;
        height: calc(100vh - ${theme.basePt * 11}px);
        border-left: 1px solid ${theme.border.color};
        header {
            padding: ${theme.basePt * 2}px ${theme.basePt * 2}px 0
                ${theme.basePt * 2}px;
            border-bottom: 1px solid ${theme.border.color};
            margin-bottom: ${theme.basePt * 2}px;
        }
        h3 {
            font-size: ${theme.basePt * 3}px;
            margin-bottom: ${theme.basePt * 2}px;
        }
        main {
            padding: 0 ${theme.basePt * 2}px;
        }
    `
)

export const Commit = styled.div(
    ({ theme }) => css`
        height: auto;
        display: flex;
        flex-direction: column;
        padding: ${theme.basePt * 2}px;
        border: 1px solid ${theme.border.color};
        margin-bottom: ${theme.basePt * 2}px;
        border-radius: ${theme.basePt / 2}px;
        & > div {
            display: flex;
            justify-content: space-between;
            margin-bottom: ${theme.basePt * 2}px;
            span {
                font-weight: 400;
                line-height: ${theme.basePt * 3}px;
                font-size: ${theme.basePt * 2.5}px;
            }
        }
        & > span {
            margin-top: auto;
            color: ${theme.colors.grey.light};
        }
        &:hover button {
            visibility: visible;
        }
        button {
            height: ${theme.basePt * 3}px;
            border: none;
            color: #fff;
            cursor: pointer;
            background: grey;
            visibility: hidden;
            border-radius: ${theme.basePt / 2}px;
        }
    `
)
