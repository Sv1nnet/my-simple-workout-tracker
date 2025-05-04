export type Mods = Record<string, boolean | string>

const classNames = (cls: string, modsOrAdditional: Mods | string[] = {}, additional: string[] = []): string => {
  if (Array.isArray(modsOrAdditional)) {
    return [
      cls,
      ...modsOrAdditional.filter(Boolean),
      ...additional.filter(Boolean),
    ].join(' ')
  }

  return [
    cls,
    ...Object
      .entries(modsOrAdditional)
      .filter(([ , value ]) => Boolean(value))
      .map(([ _cls ]) => _cls),
    ...additional.filter(Boolean),
  ].join(' ')
}

export default classNames