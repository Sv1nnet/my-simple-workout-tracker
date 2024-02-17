export const getIsNoCredsLoginFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('isNoCredsLogin'))
  } catch {
    return false
  }
}