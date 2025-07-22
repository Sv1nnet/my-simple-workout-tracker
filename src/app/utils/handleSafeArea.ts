
import { SafeAreaInsets } from 'capacitor-plugin-safe-area'
import { SafeArea } from 'capacitor-plugin-safe-area'

export type ChangeSafeAreaHandler = (insets: SafeAreaInsets['insets']) => void

const handleSafeArea = async ({ onInit, onChange }: { onInit?: ChangeSafeAreaHandler, onChange?: ChangeSafeAreaHandler }) => {
  const setInsets = (insets: SafeAreaInsets['insets']) => {
    for (const [ key, value ] of Object.entries(insets)) {
      document.documentElement.style.setProperty(
        `--safe-area-inset-${key}`,
        `${value}px`,
      )
    }
  }

  SafeArea.getSafeAreaInsets().then(({ insets }) => {
    setInsets(insets)
    onInit?.(insets)
  })
  
  await SafeArea.removeAllListeners()
  await SafeArea.addListener('safeAreaChanged', ({ insets }) => {
    setInsets(insets)
    onChange?.(insets)
  })
}

export default handleSafeArea
