import { useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Form, notification, Select, Checkbox, Button } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { CustomBaseQueryError } from 'store/utils/baseQueryWithReauth'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { settingsApi } from 'app/store/slices/settings/api'
import { changeTimers, changeUnits, selectSettings } from 'app/store/slices/settings'
import { changeLang } from 'app/store/slices/settings'
import { Lang, Unit } from 'app/store/slices/settings/types'
import { CheckboxGroupProps } from 'antd/lib/checkbox'
import { TranslationOutlined } from '@ant-design/icons'
import { useThemeContext } from 'app/contexts/theme/ThemeContextProvider'
import { ThemeSwitch } from 'app/components'

const FormWrapper = styled(Form)`
  padding: 12px;
  display: flex;
  height: 100%;
  flex-direction: column;
`

const TimersThemeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;

  .ant-form-item {
    flex-grow: 1;

    &:first-child {
      flex-basis: auto;
      flex-grow: 0;
    }

    &:last-child {
      .ant-row.ant-form-item-row {
        align-items: center;
      }
    }
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-grow: 1;
  justify-content: flex-end;
`

const Settings = () => {
  const { styles, theme, changeTheme } = useThemeContext()
  const { intl } = useIntlContext()
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const [ form ] = useForm()

  const [ updateSettings, { isLoading: isUpdatingSettings, isError: isUpdateSettingsError, error: updateSettingsError, isSuccess: isUpdateSettingsSuccess } ] = settingsApi.useLazyUpdateQuery()
  const initialValues = useMemo(() => ({ ...settings, timers: [ settings.timers.vibration ? 'vibration' : null, settings.timers.sound ? 'sound' : null ].filter(Boolean) }), [ settings ])

  const handleSubmit = async (values) => {
    try {
      updateSettings({ settings: values })
    } catch (err) {
      console.warn('Changing profile info error', err.message)
    }
  }

  const handleLangChange = (_lang: Lang) => {
    dispatch(changeLang(_lang))
  }

  const handleUnitsChange = (_units: Unit) => {
    dispatch(changeUnits(_units))
  }

  const handleTimersChange: CheckboxGroupProps['onChange'] = (_timers) => {
    dispatch(changeTimers({
      vibration: _timers.includes('vibration'),
      sound: _timers.includes('sound'),
    }))
  }

  const handleRestoreExercises = () => {
    console.log('restore exercises')
  }

  const handleRestoreWorkouts = () => {
    console.log('restore workouts')
  }

  const handleThemeSwitch = (isLightTheme: boolean) => {
    changeTheme(isLightTheme ? 'light' : 'dark')
  }

  useEffect(() => {
    if (isUpdateSettingsError && updateSettingsError) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: intl.modal.common.title.error, description: intl.pages.profile.error.message })

      const errorMessages = Object
        .entries<string>((updateSettingsError as CustomBaseQueryError)?.data?.error?.message.validation)
        .map<{ name: string, errors: string[] }>(([ field, message ]) => ({ name: field, errors: [ message ] }))
      
      form.setFields(errorMessages)
    }
  }, [
    isUpdateSettingsError,
    (updateSettingsError as CustomBaseQueryError)?.data?.error?.message?.validation,
  ])

  useEffect(() => {
    form.setFieldsValue(initialValues)
  }, [ initialValues ])

  useEffect(() => {
    if (!isUpdatingSettings && isUpdateSettingsSuccess) {
      const openNotification = ({ message, description }) => {
        notification.success({
          message,
          description,
        })
      }
      openNotification({ message: intl.pages.profile.success.message, description: intl.pages.profile.success.description })
    }
  }, [ isUpdatingSettings, isUpdateSettingsError ])

  return (
    <FormWrapper
      initialValues={initialValues}
      form={form}
      name="settings"
      onFinish={handleSubmit}
      layout="vertical"
      scrollToFirstError
    >
      <Form.Item
        label={<>
          <TranslationOutlined style={{ fontSize: 18, marginRight: 6, color: styles.textColor }} />
          {intl.pages.settings.input_labels.lang}
        </>}
        name="lang"
      >
        <Select onChange={handleLangChange}>
          <Select.Option value="eng">English</Select.Option>
          <Select.Option value="ru">Русский</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={intl.pages.settings.input_labels.units}
        name="units"
      >
        <Select onChange={handleUnitsChange}>
          <Select.Option value="kg">{intl.pages.settings.input_options.units.kg}</Select.Option>
          <Select.Option value="lb">{intl.pages.settings.input_options.units.lb}</Select.Option>
        </Select>
      </Form.Item>

      <TimersThemeContainer>
        <Form.Item
          label={intl.pages.settings.input_labels.timers}
          name="timers"
        >
          <Checkbox.Group onChange={handleTimersChange}>
            <Checkbox value="vibration">{intl.pages.settings.input_options.timers.vibration}</Checkbox>
            <Checkbox value="sound">{intl.pages.settings.input_options.timers.sound}</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item
          label={intl.pages.settings.input_labels.theme}
          name="theme"
          labelAlign="right"
        >
          <ThemeSwitch onChange={handleThemeSwitch} isLightTheme={theme === 'light'} />
        </Form.Item>
      </TimersThemeContainer>

      <ButtonsContainer>
        <Form.Item>
          <Button block>
            Восстановить упражнения
          </Button>
        </Form.Item>

        <Button block>
          Восстановить тренировки
        </Button>
      </ButtonsContainer>
    </FormWrapper>
  )
}

export default Settings
