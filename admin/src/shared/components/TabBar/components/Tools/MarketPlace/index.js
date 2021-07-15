import React from 'react'
import styled from 'styled-components'
import { useTabs } from '../../../../../providers'
import BackButton from '../BackButton'

const MarketPlace = ({ setOpen, setIsMenuOpen }) => {
   const { addTab } = useTabs()

   return (
      <Wrapper>
         <BackButton setIsMenuOpen={setIsMenuOpen} setOpen={setOpen} />
         <span>Marketplace</span>
         <div>
            <div
               onClick={() => {
                  addTab('Packaging Hub', '/inventory/packaging-hub')
                  setOpen(null)
                  setIsMenuOpen(false)
               }}
            >
               Packaging Hub
            </div>
         </div>
      </Wrapper>
   )
}

export default MarketPlace

const Wrapper = styled.div`
   position: absolute;
   right: 70px;
   top: 48px;
   width: 210px;
   background: rgba(255, 255, 255, 0.13);
   border: 1px solid #f2f3f3;
   backdrop-filter: blur(44.37px);
   border-radius: 10px;
   z-index: 9999;
   min-height: 80px;
   > span {
      font-style: normal;
      font-weight: bold;
      font-size: 10px;
      line-height: 16px;
      letter-spacing: 0.44px;
      text-transform: uppercase;
      color: #919699;
      display: inline-block;
      padding: 8px 0px 0px 12px;
   }
   > div {
      margin-top: 12px;
      > div {
         font-family: Roboto;
         font-style: normal;
         font-weight: 500;
         font-size: 14px;
         line-height: 16px;
         letter-spacing: 0.44px;
         color: #202020;
         margin: 4px;
         padding: 6px 10px;
         cursor: pointer;
         :hover {
            background: #fff;
            color: #367bf5;
            border-radius: 4px;
         }
      }
   }
   @media only screen and (max-width: 767px) {
      width: 100%;
      right: 0;
      left: 0;
      bottom: 0;
      > div {
         > div {
            background: #f7f7f7;
            border-radius: 4px;
            display: flex;
            align-items: center;
            padding: 8px;
            font-weight: 500;
            font-size: 14px;
            color: #202020;
            :hover {
               background: #fff;
               color: #367bf5;
            }
         }
      }
   }
`
