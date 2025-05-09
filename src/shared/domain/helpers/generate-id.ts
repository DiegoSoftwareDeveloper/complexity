import { v4 } from 'uuid'
import { createHash } from 'crypto'

export function generateHashedName() {
  const genUUID = v4()
  return createHash('sha256').update(genUUID).digest('hex')
}
