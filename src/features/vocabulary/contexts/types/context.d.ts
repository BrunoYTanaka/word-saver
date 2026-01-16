export interface Context {
  name: string
  color: string
  icon: string
}

export interface FullContext extends Context {
  id: string
  createdAt: string
  wordCount: number
}
