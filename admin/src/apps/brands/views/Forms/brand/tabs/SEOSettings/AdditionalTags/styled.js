import styled from 'styled-components'

export const StyledWrapper = styled.div`
display: flex;
justify-content: center;
padding: 2rem;

.ant-input {
   font-weight: 500;
   font-size: 16px;
   background-color: transparent;
   border: none;
   box-shadow: none;
}
.anticon {
margin-left:5px;
}
.ant-form {
   margin-top: 50px;
}
.ant-card-head{
   display:none;
}
div.ant-typography,span.ant-typography{
   font-size: 14px;
   color: #919699;
}
.ant-input-wrapper>.ant-input-group-addon{
   font-size: 16px;
}
.ant-card{
   width: 80%;
   margin-top: 10px;
   border:1px solid #e4e4e4;
   border-radius:4px;
}

.ant-card-body>.link{
   color: #555B6E;
    font-size: 16px;
    font-weight: 500;
}
.ant-card-body>p{
   color: #555B6E;
    font-size: 15px;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

}
.ant-modal-content{
   width: 50%;
   height: auto;
}
.ant-btn-background-ghost{
   width:23rem !important;
   height:3rem !important;
    font-size: 15px !important;
    border-radius: 6px !important;
}
`
export const ListItemWrapper = styled.div`
li.ant-list-item>section{
   width: -webkit-fill-available !important;
 }

`
export const DrawerWrapper = styled.div`
.ant-drawer-close{
   display:none;
}
.ant-drawer.ant-drawer-open .ant-drawer-mask{
   opacity: 0.2 !important;
}
.ant-drawer-content-wrapper{
   width:250px !important;
}
.ant-drawer-body{
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   padding-bottom:10px !important;
}
.ant-drawer.ant-drawer-open .ant-drawer-mask {
   animation-duration: 0s !important;
   animation:none !important;
}
`
export const ModalList = styled.div`

content: '';
width: 100%;
height: 100%;
font-weight:500;
border-radius: 6px;
cursor: default;
background-color: #cfc6c61a;
:hover{
   background-color: #6e6a6a1a;
}
}
.metatag_text{
   span{
      color: #000000d9;
   }
   color:#919699;
}
.listItem{
   border-radius: 6px;
   border: 1px solid #e3e3e3;
   text-align: left;
   font-size: 16px;
   padding: 6px;
}
`