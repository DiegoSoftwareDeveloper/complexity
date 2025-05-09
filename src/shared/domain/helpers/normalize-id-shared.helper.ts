import { Types } from 'mongoose'

export const transformIdToString = ({ value }) => {
  if (!value) {
    return
  }

  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Types.UUID) {
    return value.toString()
  }

  const buffer = Buffer.from(value.data)

  return [
    buffer.toString('hex', 0, 4),
    buffer.toString('hex', 4, 6),
    buffer.toString('hex', 6, 8),
    buffer.toString('hex', 8, 10),
    buffer.toString('hex', 10, 16),
  ].join('-')
}

export const transformIdToStringArray = ({ value }: { value: any[] }) => {
  if (!value || !Array.isArray(value)) return []

  return value.map((item) => {
    if (typeof item === 'string' && /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(item)) {
      return item
    }

    if (item?.type === 'Buffer' && Array.isArray(item.data)) {
      const buffer = Buffer.from(item.data)
      return [
        buffer.toString('hex', 0, 4),
        buffer.toString('hex', 4, 6),
        buffer.toString('hex', 6, 8),
        buffer.toString('hex', 8, 10),
        buffer.toString('hex', 10, 16),
      ].join('-')
    }

    if (item instanceof Types.UUID) {
      return item.toString()
    }

    return item?.toString()
  })
}
