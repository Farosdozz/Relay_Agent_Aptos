import { Prop } from '@nestjs/mongoose';

export class BaseSchema {
  _id?: string;

  @Prop({ default: Date.now, index: true })
  createdAt?: Date;

  updatedAt?: Date;

  @Prop({ required: false, type: Date, index: true })
  deletedAt?: Date;
}
