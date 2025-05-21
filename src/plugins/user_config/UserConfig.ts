import { registerPlugin } from '@capacitor/core'
import { Lang, Theme, Unit } from 'app/store/slices/config/types';

export interface UserConfigPlugin {
  // saveThemeSettings(options: { type: string, statusBar: string, navigationBar: string }): Promise<void>;
  setUserConfig(options: { theme?: Theme, lang?: Lang, units?: Unit }): Promise<void>;
  getUserConfig(): Promise<{ theme: Theme, lang: Lang, units: Unit }>;
}

const UserConfig = registerPlugin<UserConfigPlugin>('UserConfig')
export default UserConfig
