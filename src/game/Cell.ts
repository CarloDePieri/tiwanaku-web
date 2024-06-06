export type Cell = Readonly<{
  groupId: number | undefined
  coordinates: Coord
  field: Field | undefined
  crop: Crop | undefined
  hiddenField: boolean
  hiddenCrop: boolean
}>
