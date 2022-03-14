import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Flex,
   Form,
   RadioGroup,
   Spacer,
   TunnelHeader,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { CREATE_CAMPAIGNS } from '../../../apps/crm/graphql/mutations'
import { Tooltip } from '../../components'
import { useTabs } from '../../providers'
import validator from '../validator'
const CreateCampaign = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [campaignType, setCampaignType] = React.useState('sign up')
   const [campaignTitle, setCampaignTitle] = React.useState('Sign Up')

   const [campaign, setCampaign] = React.useState([
      {
         campaignName: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])
   const options = [
      { id: 'sign up', title: 'Sign Up' },
      { id: 'referral', title: 'Referral' },
      { id: 'post order', title: 'Post Order' },
   ]
   const [createCampaign, { loading }] = useMutation(CREATE_CAMPAIGNS, {
      onCompleted: input => {
         {
            if (click === 'SaveAndOpen') {
               input.createCampaigns.returning.map(separateTab => {
                  addTab(
                     separateTab.metaDetails.title,
                     `/crm/campaign/${separateTab.id}`
                  )
               })
            }
         }
         console.log('The input contains:', input)
         setCampaign([
            {
               campaignName: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            },
         ])
         toast.success('Successfully created the Campaign!')
         closeTunnel(16)
      },
      onError: () =>
         toast.success('Failed to create the Campaign, please try again!'),
   })
   const onChange = (e, i) => {
      const updatedCampaign = campaign
      const { name, value } = e.target
      if (name === `campaignName-${i}`) {
         const campaignNameIs = updatedCampaign[i].campaignName
         const campaignNameMeta = updatedCampaign[i].campaignName.meta

         campaignNameIs.value = value
         campaignNameMeta.isTouched = true
         campaignNameMeta.errors = validator.text(value).errors
         campaignNameMeta.isValid = validator.text(value).isValid
         setCampaign([...updatedCampaign])
         console.log('Campaign Name::::', campaign)
      }
   }
   const createCampaignHandler = () => {
      try {
         const objects = campaign.filter(Boolean).map(campaign => ({
            metaDetails: { title: `${campaign.campaignName.value}` },
            type: `${campaignTitle}`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createCampaign({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }
   const save = type => {
      setClick(type)
      let campaignValid = true
      campaign.map(campaign => {
         campaignValid = campaign.campaignName.meta.isValid
         campaignValid = campaignValid && true
         return campaignValid
      })

      if (campaignValid === true) {
         return createCampaignHandler()
      }
      return toast.error('Campaign Name is required!')
   }
   const close = () => {
      setCampaign([
         {
            campaignName: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
         },
      ])
      closeTunnel(16)
   }

   return (
      <>
         <TunnelHeader
            title="Add Campaign"
            right={{
               action: () => {
                  save('save')
               },
               title: loading && click === 'save' ? 'Saving...' : 'Save',
               // disabled: types.filter(Boolean).length === 0,
            }}
            extraButtons={[
               {
                  action: () => {
                     save('SaveAndOpen')
                  },
                  title:
                     loading && click === 'SaveAndOpen'
                        ? 'Saving...'
                        : 'Save & Open',
               },
            ]}
            close={close}
            tooltip={<Tooltip identifier="create_campaign_tunnelHeader" />}
         />
         <Flex padding="16px">
            <RadioGroup
               options={options}
               active={campaignType}
               onChange={option => {
                  console.log(option)
                  setCampaignType(option.id)
                  setCampaignTitle(option.title)
               }}
            />
         </Flex>
         <Flex padding="16px">
            {campaign.map((campaign, i) => {
               return (
                  <>
                     <Form.Group>
                        <Form.Label
                           htmlFor={`campaignName-${i}`}
                           title={`campaignName-${i}`}
                        >
                           Campaign Name*
                        </Form.Label>
                        <Form.Text
                           id={`campaignName-${i}`}
                           name={`campaignName-${i}`}
                           value={campaign.campaignName.value}
                           placeholder="Enter Campaign Name"
                           onChange={e => onChange(e, i)}
                           // onBlur={e => onBlur(e, i, `campaignName-${i}`)}
                           hasError={
                              !campaign.campaignName.meta.isValid &&
                              campaign.campaignName.meta.isTouched
                           }
                        />
                        {campaign.campaignName.meta.isTouched &&
                           !campaign.campaignName.meta.isValid &&
                           campaign.campaignName.meta.errors.map(
                              (error, index) => (
                                 <Form.Error key={index}>{error}</Form.Error>
                              )
                           )}
                     </Form.Group>
                  </>
               )
            })}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Campaign"
               onClick={() =>
                  setCampaign([
                     ...campaign,
                     {
                        campaignName: {
                           value: null,
                           meta: {
                              isValid: false,
                              isTouched: false,
                              errors: [],
                           },
                        },
                     },
                  ])
               }
            />
         </Flex>
      </>
   )
}

export default CreateCampaign
