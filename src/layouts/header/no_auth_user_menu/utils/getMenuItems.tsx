import { IIntlContextValue } from 'app/contexts/intl/IntContextProvider'
import browserDBLoader from 'app/store/utils/BrowserDB/browserDB.loader'
import { IndexedDBTable } from 'app/utils/IndexedDBUtils'
import parseImportedDataFile, { BaseParsedDataEntity } from 'app/utils/parseImportedData'
import { Button, notification } from 'antd'
import { logoutWithNoAuth } from 'app/store/slices/auth'
import { resetListState as resetExerciseListState } from 'app/store/slices/exercise'
import { resetListState as resetWorkoutListState } from 'app/store/slices/workout'
import { resetListState as resetActivityListState } from 'app/store/slices/activity'
import { LogoutButton } from '../components'

const getMenuItems = (dispatch, {
  closeMenu,
  closeMenuImmediately,
  openImportMenu,
  intl,
  onFileChange,
  onImportFinished,
}: {
  closeMenu: () => void
  closeMenuImmediately: () => void
  openImportMenu: () => void
  intl: IIntlContextValue['intl']
  onFileChange: (file: File) => void,
  onImportFinished?: (data: {
    data: { exercises: BaseParsedDataEntity[], workouts: BaseParsedDataEntity[], activities: BaseParsedDataEntity[] },
    isSuccess: boolean,
    error: Error | Event | null,
  }) => void
}) => {
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

      const { exercises, workouts, activities } = await parseImportedDataFile(file)
      const browserDb = await browserDBLoader.get() 
      const tables = browserDb.getTables()
      const db = browserDb.db

      const setDataToDB = async (table: IndexedDBTable<string>, data: BaseParsedDataEntity[]) => {
        for (const entity of data) {
          if (typeof entity.id === 'string') {
            await db.set(table, entity.id, JSON.stringify(entity))
          }
        }
      }

      await setDataToDB(tables.exercisesTable, exercises)
      await setDataToDB(tables.workoutsTable, workouts)
      await setDataToDB(tables.activitiesTable, activities)

      onImportFinished?.({
        data: { exercises, workouts, activities },
        isSuccess: true,
        error: null,
      })
    } catch (error) {
      showErrorNotification(error.message === 'No file selected' ? intl.header.import_options_modal.error.no_file_selected : null)
      onImportFinished?.({
        data: { exercises: [], workouts: [], activities: [] },
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
      data: { exercises: [], workouts: [], activities: [] },
      isSuccess: false,
      error: error as Event,
    })
    console.warn(error)
  }

  const navigateToLoginPage = async () => {
    const db = await browserDBLoader.get()
    db.disconnect()

    dispatch(logoutWithNoAuth())
    dispatch(resetExerciseListState())
    dispatch(resetWorkoutListState())
    dispatch(resetActivityListState())
  }

  const importData = () => {
    fileInput.click()
    closeMenu()
    closeMenuImmediately()
  }

  const exportData = () => {
    closeMenu()
    openImportMenu()
    closeMenuImmediately()
  }

  return [
    {
      key: 'login',
      label: (
        <Button type="link" block onClick={navigateToLoginPage}>
          {intl.header.login}
        </Button>
      ),
    },
    {
      key: 'import',
      label: (
        <Button type="link" block onClick={importData}>
          {intl.header.import}
        </Button>
      ),
    },
    {
      key: 'export',
      label: (
        <Button type="link" block onClick={exportData}>
          {intl.header.export}
        </Button>
      ),
    },
    {
      key: 'logout',
      label: <LogoutButton onClick={closeMenu} />,
    },
  ]
}

export default getMenuItems
