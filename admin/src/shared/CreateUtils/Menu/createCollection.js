import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Dropdown,
   Flex,
   Form,
   Spacer,
   TunnelHeader,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { logger } from '../../utils'
import { useTabs } from '../../providers'
import validator from '../validator'
import { Banner, Tooltip } from '../../components'
import { CREATE_COLLECTIONS } from '../../../apps/menu/graphql'

const CreateCollection = ({ close }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [collection, setCollection] = React.useState([
      {
         collectionName: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])

   const [createCollection, { loading }] = useMutation(CREATE_COLLECTIONS, {
      onCompleted: input => {
         {
            if (click === 'SaveAndOpen') {
               input.createCollections.returning.map(separateTab => {
                  addTab(
                     separateTab.name,
                     `/menu/collections/${separateTab.id}`
                  )
               })
            }
         }
         console.log('The input contains:', input)
         setCollection([
            {
               collectionName: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            },
         ])
         toast.success('Successfully created the Collection!')
         closeTunnel(1)
      },
      onError: () =>
         toast.success('Failed to create the Collection, please try again!'),
   })

   const createCollectionHandler = () => {
      try {
         const objects = collection.filter(Boolean).map(collection => ({
            name: `${collection.collectionName.value}`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createCollection({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const onChange = (e, i) => {
      const updatedCollection = collection
      const { name, value } = e.target
      if (name === `collectionName-${i}`) {
         const collectionNameIs = updatedCollection[i].collectionName
         const collectionNameMeta = updatedCollection[i].collectionName.meta

         collectionNameIs.value = value
         collectionNameMeta.isTouched = true
         collectionNameMeta.errors = validator.text(value).errors
         collectionNameMeta.isValid = validator.text(value).isValid
         setCollection([...updatedCollection])
         console.log('Collection Name::::', collection)
      }
   }

   // const onBlur = (e, i) => {
   //    const { name, value } = e.target
   //    if (name === `collectionName-${i}` && name === `collectionAuthor-${i}`) {
   //       const collectionInstant = collection[i]

   //       setCollection([
   //          ...collection,
   //          {
   //             ...collectionInstant,
   //             collectionName: {
   //                ...collectionInstant.collectionName,
   //                meta: {
   //                   ...collectionInstant.collectionName.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //             collectionAuthor: {
   //                ...collectionInstant.collectionAuthor,
   //                meta: {
   //                   ...collectionInstant.collectionAuthor.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //          },
   //       ])
   //    }
   // }

   const save = type => {
      setClick(type)
      let collectionValid = true
      collection.map(collection => {
         collectionValid = collection.collectionName.meta.isValid
         collectionValid = collectionValid && true
         return collectionValid
      })

      if (collectionValid === true) {
         return createCollectionHandler()
      }
      return toast.error('Collection Name and Author is required!')
   }
   const closeTunnel = () => {
      setCollection([
         {
            collectionName: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
         },
      ])
      close(1)
   }
   return (
      <>
         <TunnelHeader
            title="Add Collection"
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
            close={closeTunnel}
            tooltip={<Tooltip identifier="create_collection_tunnelHeader" />}
         />
         <Banner id="product-app-collection-create-collection-tunnel-top" />
         <Flex padding="16px">
            {collection.map((collection, i) => (
               <>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`collectionName-${i}`}
                        title={`collectionName-${i}`}
                     >
                        Collection Name*
                     </Form.Label>
                     <Form.Text
                        id={`collectionName-${i}`}
                        name={`collectionName-${i}`}
                        value={collection.collectionName.value}
                        placeholder="Enter collection name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e => onBlur(e, i, `collectionName-${i}`)}
                        hasError={
                           !collection.collectionName.meta.isValid &&
                           collection.collectionName.meta.isTouched
                        }
                     />
                     {collection.collectionName.meta.isTouched &&
                        !collection.collectionName.meta.isValid &&
                        collection.collectionName.meta.errors.map(
                           (error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           )
                        )}
                  </Form.Group>
               </>
            ))}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Collection"
               onClick={() =>
                  setCollection([
                     ...collection,
                     {
                        collectionName: {
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
         <Spacer xAxis size="24px" />
         <Banner id="product-app-collection-create-collection-tunnel-bottom" />
      </>
   )
}

export default CreateCollection
