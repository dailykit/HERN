import styled, { css } from 'styled-components'

export const EditorOptionsWrapper = styled.div(
    ({ theme }) => css`
        display: flex;
        height: ${theme.basePt * 6}px;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid ${theme.border.color};
        padding: 0 ${theme.basePt}px;
        grid-area: head;
        .btn__icon {
            background: transparent;
            width: ${theme.basePt * 5}px;
            height: ${theme.basePt * 5}px;
            cursor: pointer;
            border: none;
            border-radius: ${theme.basePt / 2}px;
            display: flex;
            align-items: center;
            justify-content: center;
            &:hover {
                background: rgba(0, 0, 0, 0.1);
            }
        }
        #right {
            button {
                border: none;
                cursor: pointer;
                height: ${theme.basePt * 4}px;
                background: ${theme.colors.light};
                padding: 0 ${theme.basePt * 1.5}px;
                border-radius: ${theme.basePt / 2}px;
                margin-left: ${theme.basePt * 1.5}px;
                &:hover {
                    background: rgba(0, 0, 0, 0.1);
                }
            }
        }
    `
)
