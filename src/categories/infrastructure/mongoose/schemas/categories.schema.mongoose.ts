import { Document, Schema as MongooseSchema } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ICategoryEntity } from '../../../domain/entities/category.entity'

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'categories',
})
export class CategorySchemaBaseMongoose extends Document implements ICategoryEntity {
  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
  })
  _id: string

  @Prop({
    required: true,
    trim: true,
  })
  name: string

  @Prop({
    required: true,
    trim: true,
  })
  normalizedName: string

  @Prop({
    required: false,
    trim: true,
  })
  description?: string
}

export const CategorySchemaMongoose = SchemaFactory.createForClass(CategorySchemaBaseMongoose)
