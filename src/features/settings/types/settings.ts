export type SettingKey = 'theme'

export interface SettingRow {
  key: SettingKey
  value: string
}

export type Settings = Partial<Record<SettingKey, string>>
