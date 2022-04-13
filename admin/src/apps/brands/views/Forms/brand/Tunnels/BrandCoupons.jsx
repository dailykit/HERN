import { useMutation, useSubscription } from '@apollo/react-hooks'
import { List, ListHeader, ListItem, ListOptions, ListSearch, Tag, TagGroup, TunnelHeader, useMultiList } from '@dailykit/ui'
import React from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { InlineLoader } from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import { BRAND_COUPONS } from '../../../../graphql'

export const BrandCouponsTunnel = ({ close, brandId }) => {
    const [coupons, setCoupons] = React.useState([])
    const [search, setSearch] = React.useState('')
    const params = useParams()

    //subscription
    const { loading: loadingList, error } = useSubscription(BRAND_COUPONS.TUNNEL_LIST, {
        variables: {
            brandId: brandId
        },
        onSubscriptionData: data => {
            const result = data.subscriptionData.data.coupons.map(
                eachCoupons => {
                    return {
                        id: eachCoupons.id,
                        code: eachCoupons.code,
                        title: eachCoupons.metaDetails !== null ? [eachCoupons.metaDetails.title] : [],
                        image: eachCoupons.metaDetails !== null ? eachCoupons.metaDetails.image : ''

                    }
                }
            )
            setCoupons(result)
        },
    })
    // console.log('Coupon code:::', coupons)

    //multi select list
    const [list, selected, selectOption] = useMultiList(coupons)
    // console.log([selected]);

    //mutation
    const [updateLinkedBrands, { loading: inFlight }] = useMutation(
        BRAND_COUPONS.UPSERT_BRAND_COUPONS,

        {
            onCompleted: () => {
                toast.success('Coupons added successfully!')
                close(1)
            },
            onError: error => {
                logger(error)
                toast.error('Error adding Coupons!')
                close(1)
            },
        }
    )

    const save = () => {
        if (inFlight || !selected.length) return
        const objects = selected.map(coupon => ({
            brandId: params.id,
            couponId: coupon.id,
        }))
        updateLinkedBrands({
            variables: {
                objects,
            },
        })
    }

    if (loadingList) return <InlineLoader />
    return (
        <>
            <TunnelHeader
                title={'Add Coupons'}
                close={() => close(1)}
                right={{
                    action: save,
                    title: inFlight ? 'Adding...' : 'Add',
                }}
            />
            <List style={{ padding: '0 1rem' }}>
                <ListSearch
                    onChange={value => setSearch(value)}
                    placeholder="type what you’re looking for..."
                />
                {selected.length > 0 && (
                    <TagGroup style={{ margin: '8px 0' }}>
                        {selected.map(option => (
                            <Tag
                                key={option.id}
                                title={option.code}
                                onClick={() => selectOption('id', option.id)}
                            >
                                {option.code}
                            </Tag>
                        ))}
                    </TagGroup>
                )}
                <ListHeader type="MSL31" label="Coupons" />
                <ListOptions>
                    {list
                        .filter(option => option.code.toLowerCase().includes(search))
                        .map(option => (
                            <ListItem
                                key={`${option.id}-${option.code}`}
                                type="MSL31"
                                content={{
                                    img: option.image,
                                    title: option.code,
                                    field: [
                                        {
                                            //this title is coupon code title
                                            fieldName: 'Title',
                                            fieldValue: option.title,
                                        },
                                    ],
                                }}
                                onClick={() => selectOption('id', option.id)}
                                isActive={selected.find(item => item.id === option.id)}
                            />
                        ))}
                </ListOptions>
            </List>
        </>
    )
}