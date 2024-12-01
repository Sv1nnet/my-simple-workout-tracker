export {}

declare global {
  interface Window {
    opera: string;
  }
}

export type Tag = { label: string, value: string, key: string, disabled?: boolean, title?: string }
