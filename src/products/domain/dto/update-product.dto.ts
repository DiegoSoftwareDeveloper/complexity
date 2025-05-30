import { OmitType } from '@nestjs/swagger'
import { CreateProductDto } from './create-product.dto'

export class UpdateProductDto extends OmitType(CreateProductDto, ['_id'] as const) {}
