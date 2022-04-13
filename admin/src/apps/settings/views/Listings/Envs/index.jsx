
import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { Text, Loader, Flex } from '@dailykit/ui'
import { Input } from 'antd'
import { ENVS } from '../../../graphql'
import { CloseIcon } from '../../../../brands/assets/icons'
import { Child, CollapsibleWrapper, Styles } from './styled'
import { SettingsCard } from './SettingsCard'

const EnvsList = () => {
    const [allSettings, setAllSettings] = React.useState([])
    const [active, setActive] = React.useState('')
    const [searchResult, setSearchResult] = React.useState([])
    const [isChangeSaved, setIsSavedChange] = React.useState(true)
    const [mode, setMode] = React.useState('saved')
    const [saveAllSettings, setSaveAllSettings] = React.useState({})
    const [componentIsOnView, setIsComponentIsOnView] = React.useState([])
    const [alertShow, setAlertShow] = React.useState(false)
    const { Search } = Input

    const { loading: loadingSettings, error } = useSubscription(ENVS.LIST, {
        onSubscriptionData: ({
            subscriptionData: {
                data: { settings_env = [] } = {},
            } = {},
        }) => {
            setAllSettings(settings_env)

        },
    })

    if (error) {
        toast.error('Something went wrong')
    }

    console.log({ allSettings })
    if (loadingSettings) return <Loader />

    //for searching brandSettings
    const onSearch = value => {
        const lowerCaseValue = value.toLowerCase()
        setSearchResult(
            allSettings.filter(item => {
                return item.title
                    .toLowerCase()
                    .includes(lowerCaseValue)
            })
        )
    }
    console.log("saveAllSettings", saveAllSettings, "isChangeSaved", isChangeSaved, "mode", mode)
    return (
        <>
            <Styles.Wrapper>
                {/* navigation bar */}
                <Styles.SettingsWrapper>
                    {/* heading */}
                    <Flex>
                        <Text as="h3">
                            Envs&nbsp;
                        </Text>
                        <Search
                            placeholder="search settings"
                            onSearch={onSearch}
                            enterButton
                        />
                    </Flex>

                    {/* (Navigation) types and identifiers */}
                    <div className="settings_wrapper">
                        {searchResult.length < 1 ? (
                            <NavComponent

                            >
                                {allSettings.map(item => {
                                    return (
                                        <div key={item.id}>
                                            <a
                                                href={`#${item?.title}`}
                                            >
                                                <Child
                                                    key={item?.id}
                                                    onClick={() =>
                                                        setActive(
                                                            item
                                                                ?.title
                                                        )
                                                    }
                                                >
                                                    <div
                                                        tabindex="1"
                                                        className={
                                                            active == item?.title ||
                                                                componentIsOnView.includes(
                                                                    item?.title
                                                                )
                                                                ? 'active-link identifier_name'
                                                                : 'identifier_name'
                                                        }
                                                    >
                                                        {item?.title || ''}
                                                    </div>
                                                </Child>
                                            </a>
                                        </div>
                                    )
                                })}
                            </NavComponent>
                        ) : (
                            <NavComponent
                                heading={'Search Results'}
                                setSearchResult={setSearchResult}
                                searchResult={searchResult}
                            >
                                {searchResult.map(item => {
                                    return (
                                        <div key={item.id}>
                                            <a href={`#${item?.title}`}>
                                                <Child
                                                    key={item?.id}
                                                    onClick={() =>
                                                        setActive(
                                                            item?.title
                                                        )
                                                    }
                                                >
                                                    <div
                                                        tabindex="1"
                                                        className={
                                                            active ==
                                                                item?.title ||
                                                                componentIsOnView.includes(
                                                                    item?.title
                                                                )
                                                                ? 'active-link identifier_name'
                                                                : 'identifier_name'
                                                        }
                                                    >
                                                        {item?.title || ''}
                                                    </div>
                                                </Child>
                                            </a>
                                        </div>
                                    )
                                })}
                            </NavComponent>
                        )}
                    </div>
                </Styles.SettingsWrapper>

                {/* contain all settings middle-segment */}
                <Styles.SettingWrapper>
                    <Flex>
                        {allSettings.map(setting => {
                            return (
                                <div key={setting.id}>
                                    <a
                                        name={setting?.title}
                                    ></a>
                                    <SettingsCard
                                        setting={setting}
                                        key={setting?.id}
                                        title={setting?.title}
                                        isChangeSaved={isChangeSaved}
                                        setIsSavedChange={setIsSavedChange}
                                        setIsComponentIsOnView={
                                            setIsComponentIsOnView
                                        }
                                        componentIsOnView={componentIsOnView}
                                        mode={mode}
                                        setMode={setMode}
                                        saveAllSettings={saveAllSettings}
                                        setSaveAllSettings={setSaveAllSettings}
                                        alertShow={alertShow}
                                        setAlertShow={setAlertShow}
                                    />
                                </div>
                            )
                        })}
                    </Flex>
                </Styles.SettingWrapper>
            </Styles.Wrapper>
        </>
    )
}
export default EnvsList

const NavComponent = ({ children, heading, setSearchResult, searchResult }) => (
    <CollapsibleWrapper>
        <Flex
            margin="10px 0"
            container
            alignItems="center"
            width="100%"
            className="collapsible_head"
            justifyContent="space-between"
        >
            {searchResult?.length >= 1 && (
                <>
                    <Text as="title" style={{ color: '#555B6E', padding: '8px' }}>
                        {heading}
                    </Text>
                    <button
                        title={'clear'}
                        onClick={() => setSearchResult([])}
                        style={{
                            cursor: 'pointer',
                            border: 'none',
                            marginTop: '0.5rem',
                        }}
                    >
                        <CloseIcon color="#000" size="24" />
                    </button>
                </>
            )}
        </Flex>
        <Flex
            margin="10px 0"
            container
            flexDirection="column"
            className="nav_child"
        >
            {children}
        </Flex>
    </CollapsibleWrapper>
)
