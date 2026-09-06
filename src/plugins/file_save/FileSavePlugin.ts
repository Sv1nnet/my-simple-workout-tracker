import { registerPlugin } from '@capacitor/core'

export type SaveTextFilePluginOptions = {
  data: string
  fileName: string
  mimeType?: string
}

export interface IFileSavePlugin {
  saveTextFile(options: SaveTextFilePluginOptions): Promise<void>
}

const FileSavePlugin = registerPlugin<IFileSavePlugin>('FileSave')

export default FileSavePlugin
