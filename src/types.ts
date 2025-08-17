
export type Note = {
  id: string
  title: string
  body: string
  tags: string[]
  starred: boolean
  pinned: boolean
  trashed: boolean
  createdAt: number
  updatedAt: number
  reminderAt?: number | null
}
