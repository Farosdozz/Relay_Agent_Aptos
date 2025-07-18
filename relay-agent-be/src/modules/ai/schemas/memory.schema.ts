import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { BaseSchema } from 'src/common/schema/base.schema';

export type MemoryDocument = Memory & Document;

@Schema({ 
  timestamps: true
})
export class Memory extends BaseSchema {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  sessionId: string;

  @Prop({ required: true, enum: ['system', 'user', 'assistant', 'tool'] })
  role: string;

  @Prop({ required: true, default: false })
  synced: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  content: {
    text: string;
    attachments?: any[];
    source?: string;
    inReplyTo?: string;
  };

  @Prop({ type: [Number], sparse: true })
  embedding?: number[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>; // For additional data like tool calls, session metadata
}

export const MemorySchema = SchemaFactory.createForClass(Memory);

// Add indexes for efficient queries
MemorySchema.index({ userId: 1, sessionId: 1 });
MemorySchema.index({ sessionId: 1, createdAt: 1 });
MemorySchema.index({ userId: 1, sessionId: 1, createdAt: -1 });
MemorySchema.index({ 'metadata.isSessionMetadata': 1 });
// Compound index for session listing with pagination
MemorySchema.index({
  userId: 1,
  'metadata.isSessionMetadata': 1,
  createdAt: -1,
});