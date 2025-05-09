import { Schema, Types } from 'mongoose'

export interface GeneralEntity {
  _id?: string | Types.ObjectId | Schema.Types.ObjectId
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
  isDeleted?: boolean
}
