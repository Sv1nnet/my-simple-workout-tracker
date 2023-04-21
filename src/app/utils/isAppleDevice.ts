export function isIOS() {
  try {
    if (/iPad|iPhone|iPod/.test(navigator.platform)) {
      return true
    } else {
      return navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        /MacIntel/.test(navigator.platform)
    }
  } catch {
    return false
  }
}

export function isIpadOS() {
  try {
    return navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2 &&
      /MacIntel/.test(navigator.platform)
  } catch {
    return false
  }
}