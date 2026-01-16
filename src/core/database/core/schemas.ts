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
  },
  flashcards: {
    keyPath: 'id',
    indexes: [
      { name: 'category', keyPath: 'category', unique: false },
      { name: 'difficulty', keyPath: 'difficulty', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false }
    ]
  },
  quiz: {
    keyPath: 'id',
    indexes: [
      { name: 'category', keyPath: 'category', unique: false },
      { name: 'difficulty', keyPath: 'difficulty', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false }
    ]
  },
  stats: {
    keyPath: 'id',
    indexes: [{ name: 'date', keyPath: 'date', unique: false }]
  }
}
