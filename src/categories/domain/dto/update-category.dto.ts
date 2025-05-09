import { OmitType } from '@nestjs/swagger'
import { CreateCategoryDto } from './create-category.dto'

export class UpdateCategoryDto extends OmitType(CreateCategoryDto, ['_id'] as const) {}
