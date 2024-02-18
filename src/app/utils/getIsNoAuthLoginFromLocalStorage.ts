export const getIsNoAuthLoginFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('isNoAuthLogin'))
  } catch {
    return false
  }
}