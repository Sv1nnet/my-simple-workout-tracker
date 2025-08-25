import { registerPlugin } from '@capacitor/core'
import { Lang } from 'app/store/slices/settings/types'

export type Settings = {
  isVibration?: boolean;
  isSound?: boolean;
  lang?: Lang;
}

export interface SettingsServicePlugin {
  initSettings(options: Required<Settings>): Promise<void>;
  getSettings(): Promise<{ settings: Settings }>;
  setSettings(settings: Settings): Promise<void>;
  updateSettings(settings: Settings): Promise<void>;
}

const SettingsService = registerPlugin<SettingsServicePlugin>('SettingsService')
export default SettingsService
