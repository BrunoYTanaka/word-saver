export const schemas = {
  words: {
    keyPath: 'id',
    indexes: [
      { name: 'contextId', keyPath: 'contextId', unique: false },
      { name: 'word', keyPath: 'word', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false }
    ]
  },
  contexts: {
    keyPath: 'id',
    indexes: [{ name: 'name', keyPath: 'name', unique: true }]
  },
  alerts: {
    keyPath: 'id',
    indexes: [{ name: 'isActive', keyPath: 'isActive', unique: false }]
  },
  settings: {
    keyPath: 'key',
    indexes: []
  }
}
