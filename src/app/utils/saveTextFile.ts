import { Capacitor } from '@capacitor/core'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import downloadFile from 'js-file-download'
import { FileSavePlugin } from 'src/plugins'

export type SaveTextFileOptions = {
  data: string
  fileName: string
  mimeType?: string
  dialogTitle?: string
}

const isSaveCanceled = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /cancel/i.test(message)
}

const saveTextFileWithPicker = async ({ data, fileName }: SaveTextFileOptions) => {
  try {
    await FileSavePlugin.saveTextFile({
      data,
      fileName,
      mimeType: 'text/plain',
    })
  } catch (error) {
    if (!isSaveCanceled(error)) {
      throw error
    }
  }
}

const saveTextFileWithShare = async ({ data, fileName, dialogTitle }: SaveTextFileOptions) => {
  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  })

  try {
    await Share.share({
      title: fileName,
      files: [ uri ],
      dialogTitle: dialogTitle ?? fileName,
    })
  } catch (error) {
    if (!isSaveCanceled(error)) {
      throw error
    }
  }
}

const saveTextFile = async ({
  data,
  fileName,
  mimeType = 'plain/text',
  dialogTitle,
}: SaveTextFileOptions) => {
  if (Capacitor.getPlatform() === 'android') {
    await saveTextFileWithPicker({ data, fileName, dialogTitle })
    return
  }

  if (Capacitor.isNativePlatform()) {
    await saveTextFileWithShare({ data, fileName, dialogTitle })
    return
  }

  downloadFile(data, fileName, mimeType)
}

export default saveTextFile
