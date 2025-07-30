import { IIntlContextValue } from 'app/contexts/intl/IntContextProvider'
import browserDBLoader from 'app/store/utils/BrowserDB/browserDB.loader'
import { IndexedDBTable } from 'app/utils/IndexedDBUtils'
import parseImportedDataFile, { BaseParsedDataEntity } from 'app/utils/parseImportedData'
import { Button, MenuProps, notification } from 'antd'
import { LogoutButton } from '../components'
import { BASE_ROUTES } from 'src/router'
import { NavigateFunction } from 'react-router'
import style from '../NoAuthUserMenu.module.scss'
import { SwitchChangeEventHandler } from 'antd/lib/switch'
import { ThemeSwitch } from 'app/components'
import { isString } from 'app/utils/typeCheckers'
import { DownloadOutlined, SettingOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons'
import styled from 'styled-components'

const StyledButton = styled(Button)`
  text-align: left;
`

const StyledThemeSwitch = styled(ThemeSwitch)`
  justify-content: flex-start;
  padding-left: 22px;
  margin-top: 6px;
`

const getMenuItems = ({
  navigate,
  closeMenu,
  openImportMenu,
  intl,
  isLightTheme,
  onFileChange,
  onThemeSwitch,
  onImportFinished,
}: {
  navigate: NavigateFunction
  closeMenu: () => void
  openImportMenu: () => void
  intl: IIntlContextValue['intl']
  isLightTheme?: boolean,
  onThemeSwitch?: SwitchChangeEventHandler,
  onFileChange: (file: File) => void,
  onImportFinished?: (data: {
    data: {
      exercises: BaseParsedDataEntity[],
      workouts: BaseParsedDataEntity[],
      activities: BaseParsedDataEntity[],
      muscleGroups: BaseParsedDataEntity[]
    },
    isSuccess: boolean,
    error: Error | Event | null,
  }) => void
}): MenuProps['items'] => {
  const showErrorNotification = (description?: string) => {
    notification.error({
      message: 'Ошибка',
      description: description ?? 'Ошибка при чтении файла. Некоторые данные могли быть не импортированы', 
    })
  }

  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = '.txt'
  fileInput.multiple = false

  const onchange = async (e: Event) => {
    try {
      const file = (e.target as HTMLInputElement).files[0]
      
      onFileChange(file)

      if (!file) throw new Error('No file selected')

      const { exercises, workouts, activities, muscleGroups } = await parseImportedDataFile(file)
      const browserDb = await browserDBLoader.get() 
      const tables = browserDb.getTables()
      const db = browserDb.db

      const setDataToDB = async (table: IndexedDBTable<string>, data: BaseParsedDataEntity[]) => {
        for (const entity of data) {
          if (isString(entity.id)) {
            await db.set(table, entity.id, entity)
          }
        }
      }

      await setDataToDB(tables.muscleGroupsTable, muscleGroups)
      await setDataToDB(tables.exercisesTable, exercises)
      await setDataToDB(tables.workoutsTable, workouts)
      await setDataToDB(tables.activitiesTable, activities)

      onImportFinished?.({
        data: { exercises, workouts, activities, muscleGroups },
        isSuccess: true,
        error: null,
      })
    } catch (error) {
      showErrorNotification(error.message === 'No file selected' ? intl.header.import_options_modal.error.no_file_selected : null)
      onImportFinished?.({
        data: { exercises: [], workouts: [], activities: [], muscleGroups: [] },
        isSuccess: false,
        error,
      })
      console.warn(error)
    } finally {
      fileInput.onchange = null
      fileInput.value = ''
      fileInput.onchange = onchange
    }
  }

  fileInput.onchange = onchange

  fileInput.onerror = (error) => {
    showErrorNotification()
    onImportFinished?.({
      data: { exercises: [], workouts: [], activities: [], muscleGroups: [] },
      isSuccess: false,
      error: error as Event,
    })
    console.warn(error)
  }

  const openProfilePage = async () => {
    navigate(BASE_ROUTES.PROFILE)
    closeMenu()
  }

  const importData = () => {
    fileInput.click()
    closeMenu()
  }

  const exportData = () => {
    closeMenu()
    openImportMenu()
  }

  const openSettingsPage = () => {
    navigate(BASE_ROUTES.SETTINGS)
    closeMenu()
  }

  return [
    {
      key: 'profile',
      label: (
        <StyledButton type="link" block onClick={openProfilePage}>
          <UserOutlined />
          {intl.header.profile}
        </StyledButton>
      ),
    },
    {
      key: 'import',
      label: (
        <StyledButton type="link" block onClick={importData}>
          <UploadOutlined />
          {intl.header.import}
        </StyledButton>
      ),
    },
    {
      key: 'export',
      label: (
        <StyledButton type="link" block onClick={exportData}>
          <DownloadOutlined />
          {intl.header.export}
        </StyledButton>
      ),
    },
    {
      key: 'settings',
      label: (
        <StyledButton type="link" block onClick={openSettingsPage}>
          <SettingOutlined />
          {intl.header.settings}
        </StyledButton>
      ),
    },
    {
      key: 'themeSwitch',
      className: style['user-menu-dropdown__theme-switch'],
      label: (
        <StyledThemeSwitch onChange={onThemeSwitch} isLightTheme={isLightTheme} />
      ),
    },
    {
      key: 'logout',
      className: style['user-menu-dropdown__logout-button'],
      label: <LogoutButton onClick={closeMenu} />,
    },
  ]
}

export default getMenuItems
