import styled from 'styled-components'

export const StyledTable = styled.table`
    width : 100%;
    margin-top : 20px;
    margin-bottom : 20px;
    max-width:100%;
    font-size : 14px;
    border-collapse: collapse;
    border-spacing: 0;
    td{
    padding: 8px;
    line-height: 1.42857;
    vertical-align: top;
    border: 1px solid #ddd;
    }
    th{
        text-align: left;
        padding: 8px;
        line-height: 1.42857;
        vertical-align: top;
        border: 1px solid #ddd;
        background-color: #f2f2f2!important;
    }
    td.saved-header{
        text-align: left;
        padding: 8px;
        line-height: 1.42857;
        vertical-align: top;
        border-left: 1px solid #ddd;
        border-right: 1px solid #ddd;
        border-top: 0px;
        border-bottom: 0px;
    }
}
`