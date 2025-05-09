import { Document, Schema as MongooseSchema } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IProductEntity } from '../../../domain/entities/product.entity'

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'products',
})
export class ProductSchemaBaseMongoose extends Document implements IProductEntity {
  @Prop({
    type: MongooseSchema.Types.UUID,
    auto: true,
  })
  _id: string

  @Prop({
    required: true,
    trim: true,
  })
  name: string

  @Prop({
    required: false,
    trim: true,
  })
  description?: string

  @Prop({
    required: true,
    trim: true,
  })
  category: string

  @Prop({
    required: true,
  })
  price: number

  @Prop({
    required: true,
  })
  stock: number

  @Prop({
    required: true,
    trim: true,
  })
  location: string
}

export const ProductSchemaMongoose = SchemaFactory.createForClass(ProductSchemaBaseMongoose)
