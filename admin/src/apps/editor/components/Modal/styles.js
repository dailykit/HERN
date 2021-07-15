import styled, { css } from 'styled-components'

export const StyledModal = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
`

export const ModalCard = styled.div`
    height: auto;
    width: 480px;
    min-height: 432px;
    background: #fff;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
`

export const Styledheader = styled.header(
    ({ theme }) => css`
        height: ${theme.basePt * 4}px;
        padding: 0 ${theme.basePt * 1.5}px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid ${theme.border.color};
    `
)

export const StyledBody = styled.main(
    ({ theme }) => css`
        padding: ${theme.basePt * 1.5}px;
        flex: 1;
        max-height: 360px;
        overflow-y: auto;
    `
)

export const StyledFooter = styled.footer(
    ({ theme }) => css`
        height: ${theme.basePt * 5}px;
        padding: 0 ${theme.basePt * 1.5}px;
        display: flex;
        align-items: center;
        border-top: 1px solid ${theme.border.color};
    `
)
