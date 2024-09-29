export const getLocalStorageItem = (key: string) => {
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    return null
  }
}

export const setLocalStorageItem = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(error)
  }
}

export const removeLocalStorageItem = (key: string) => {
  try {
    window.localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
