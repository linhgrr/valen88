import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  name1: string;
  name2: string;
  images: string[]; // 6 image URLs
  createdAt: Date;
  slug: string;
}

const CardSchema = new Schema<ICard>({
  name1: { type: String, required: true },
  name2: { type: String, required: true },
  images: { type: [String], required: true, validate: [(v: string[]) => v.length === 6, 'Must have exactly 6 images'] },
  createdAt: { type: Date, default: Date.now },
  slug: { type: String, unique: true },
});

// Create a URL-friendly slug from names and timestamp - using default function
CardSchema.path('slug').default(function() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${this.name1.toLowerCase()}-${this.name2.toLowerCase()}-${timestamp}-${randomStr}`;
});

export default mongoose.models.Card || mongoose.model<ICard>('Card', CardSchema);
