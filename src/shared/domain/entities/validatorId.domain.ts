// an exception import infrastructure for domain
import { Types } from 'mongoose'

export function isValidObjectIdDomain(id: string) {
  if (Types.ObjectId.isValid(id)) {
    if (String(new Types.ObjectId(id)) === id) return true
    return false
  }
  return false
}
