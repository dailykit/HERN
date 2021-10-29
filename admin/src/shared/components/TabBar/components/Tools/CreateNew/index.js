import React from 'react'

import { useTabs } from '../../../../../providers'
import Styles from './styled'
import BackButton from '../BackButton'

const CreateNew = ({
   setOpen,
   setIsMenuOpen,
   openCreateBrandTunnel,
   openCreateProductTunnel,
   openCreateRecipeTunnel,
   openCreateIngredientTunnel,
   openCreateSupplierTunnel,
   openCreateItemTunnel,
   openCollectionTunnel,
}) => {
   const { addTab } = useTabs()

   const handleCreate = cb => {
      setOpen(null)
      setIsMenuOpen(false)
      cb()
   }

   return (
      <Styles.CreateNewWrapper>
         <BackButton setIsMenuOpen={setIsMenuOpen} setOpen={setOpen} />
         <span>Create new</span>
         <CreateNewBtn
            title="Brands"
            onClick={() => handleCreate(() => openCreateBrandTunnel(1))}
         />
         <CreateNewBtn
            title="Collection"
            onClick={() => handleCreate(() => openCollectionTunnel(1))}
         />
         <CreateNewBtn
            title="Products"
            onClick={() => handleCreate(() => openCreateProductTunnel(3))}
         />
         <CreateNewBtn
            title="Recipe"
            onClick={() => handleCreate(() => openCreateRecipeTunnel(1))}
         />
         <CreateNewBtn
            title="Ingredient"
            onClick={() => handleCreate(() => openCreateIngredientTunnel(1))}
         />
         <CreateNewBtn
            title="Supplier Item"
            onClick={() => handleCreate(() => openCreateItemTunnel(1))}
         />
         <CreateNewBtn
            title="Supplier"
            onClick={() => handleCreate(() => openCreateSupplierTunnel(1))}
         />
      </Styles.CreateNewWrapper>
   )
}

const CreateNewBtn = ({ title, onClick }) => (
   <Styles.CreateNewItem onClick={onClick}>
      <span style={{ padding: '6px 0px' }}>{title}</span>
   </Styles.CreateNewItem>
)

export default CreateNew
