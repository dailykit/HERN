import React from 'react'

import { Container, Grid, Row, Wrapper, Header, Rule, Major } from './styled'
import { useTranslation } from 'react-i18next'
const address = 'shared.components.nutrition.'
const Nutrition = ({ data, vertical = false }) => {
   const { t } = useTranslation()
   return (
      <Container>
         <Major>
            <h4>{t(address.concat('calories'))}</h4>
            <h3>{data?.calories}</h3>
         </Major>
         <Grid vertical={vertical}>
            <Wrapper>
               <Header>
                  <h6>
                     {t(address.concat('amount'))}/
                     {t(address.concat('serving'))}
                  </h6>
                  <h6>% {t(address.concat('daily value'))}</h6>
               </Header>
               <Rule />
               <Row hidden={!data?.totalFat}>
                  <h5>
                     {t(address.concat('total fat'))}{' '}
                     <span>{data?.totalFat}g</span>
                  </h5>
                  <h5>
                     {Math.round((parseInt(data?.totalFat, 10) / 78) * 100)}%
                  </h5>
               </Row>
               <Row inset hidden={!(data?.totalFat && data?.saturatedFat)}>
                  <span>
                     {t(address.concat('saturated fat'))}{' '}
                     <span>{data?.saturatedFat}g</span>
                  </span>
                  <h5>
                     {Math.round((parseInt(data?.saturatedFat, 10) / 20) * 100)}
                     %
                  </h5>
               </Row>
               <Row inset hidden={!(data?.totalFat && data?.transFat)}>
                  <span>
                     {t(address.concat('trans fat'))}{' '}
                     <span>{data?.transFat}g</span>
                  </span>
               </Row>
               <Row hidden={!data?.cholesterol}>
                  <h5>
                     {t(address.concat('cholesterol'))}{' '}
                     <span>{data?.cholesterol}mg</span>
                  </h5>
                  <h5>
                     {Math.round((parseInt(data?.cholesterol, 10) / 300) * 100)}
                     %
                  </h5>
               </Row>
               <Row hidden={!data?.sodium}>
                  <h5>
                     {t(address.concat('sodium'))} <span>{data?.sodium}mg</span>
                  </h5>
                  <h5>
                     {Math.round((parseInt(data?.sodium, 10) / 2300) * 100)}%
                  </h5>
               </Row>
               <Rule vertical={vertical} />
            </Wrapper>
            <Wrapper>
               <Header vertical={vertical}>
                  <h6>
                     {t(address.concat('amount'))}/
                     {t(address.concat('serving'))}
                  </h6>
                  <h6>% {t(address.concat('daily value'))}</h6>
               </Header>
               <Rule vertical={vertical} />
               <Row hidden={!data?.totalCarbohydrates}>
                  <h5>
                     {t(address.concat('total carbohydrates'))}{' '}
                     <span>{data?.totalCarbohydrates}g</span>
                  </h5>
                  <h5>5%</h5>
               </Row>
               <Row
                  inset
                  hidden={!(data?.totalCarbohydrates && data?.dietaryFibre)}
               >
                  <span>
                     {t(address.concat('dietary fibre'))}{' '}
                     <span>{data?.dietaryFibre}g</span>
                  </span>
                  <h5>
                     {Math.round((parseInt(data?.dietaryFibre, 10) / 28) * 100)}
                     %
                  </h5>
               </Row>
               <Row inset hidden={!(data?.totalCarbohydrates && data?.sugars)}>
                  <span>
                     {t(address.concat('sugars'))} <span>{data?.sugars}g</span>
                  </span>
               </Row>
               <Row hidden={!data?.protein}>
                  <h5>
                     {t(address.concat('protein'))}{' '}
                     <span>{data?.protein}g</span>
                  </h5>
               </Row>
               <Rule />
            </Wrapper>
         </Grid>
         <Row>
            <span>
               {t(address.concat('vitamin A'))} {data?.vitaminA}%
            </span>
            <span>&bull;</span>
            <span>
               {t(address.concat('vitamin C'))} {data?.vitaminC}%
            </span>
            <span>&bull;</span>
            <span>
               {t(address.concat('calcium'))} {data?.calcium}%
            </span>
            <span>&bull;</span>
            <span>
               {t(address.concat('iron'))} {data?.iron}%
            </span>
         </Row>
         <Row>
            {data?.excludes?.length > 0 && (
               <>
                  <h3>Excludes</h3>
                  {data?.excludes.map((item, index) => {
                     return <h4>{item}</h4>
                  })}
               </>
            )}
         </Row>
         <Row>
            {data?.allergens?.length > 0 && (
               <>
                  <h3>Allergens</h3>
                  {data?.allergens.map((item, index) => {
                     return <h4>{item}</h4>
                  })}
               </>
            )}
         </Row>
      </Container>
   )
}

export default Nutrition
