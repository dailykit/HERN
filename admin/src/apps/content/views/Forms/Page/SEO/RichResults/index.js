import React from 'react'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useMutation } from '@apollo/react-hooks'
import { UPSERT_BRANDS_SEO } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'
import LocalBusiness from "./localBusiness"
import { StyledWrapper } from './styled'
import { Card, Typography } from 'antd'

const RichResults = () => {
    const params = useParams()
    const { pageId } = useParams()
    const brandPageId = React.useMemo(() => parseInt(pageId), [])
    //updates facebookPixel and googleAnalytics id
    const [upsertSEODetails] = useMutation(UPSERT_BRANDS_SEO, {
        onCompleted: () => {
            toast.success('Updated!')
        },
        onError: error => {
            toast.error('Something went wrong with UPSERT_BRANDS_SEO')
            console.log(error)
            logger(error)
        },
    })


    //passing id and value from localBuisness component for updating

    const update = ({ id, value: jsonData }) => {
        console.log({
            object: {
                brandPageId: brandPageId,
                brandPageSettingId: id,
                value: jsonData,
            }
        })
        upsertSEODetails({
            variables: {
                object: {
                    brandPageId: brandPageId,
                    brandPageSettingId: id,
                    value: jsonData,
                },
            },
        })
    }

    return (
        <StyledWrapper>
            <Card style={{ width: '100%' }}>
                <Typography.Title level={4}>RichResults</Typography.Title>
                <LocalBusiness update={update} />
                {/* <GoogleAnalyticsId update={update} /> */}
            </Card>
        </StyledWrapper>
    )
}

export default RichResults
