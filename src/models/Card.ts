import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  name1: string;
  name2: string;
  images: string[]; // 6 image URLs for collage screen
  letterImages: string[]; // 3 image URLs for letter screen
  letterMessage: {
    greeting: string;
    content: string;
  };
  createdAt: Date;
  slug: string;
}

const CardSchema = new Schema<ICard>({
  name1: { type: String, required: true },
  name2: { type: String, required: true },
  images: { type: [String], required: true, validate: [(v: string[]) => v.length === 6, 'Must have exactly 6 images'] },
  letterImages: { type: [String], default: [] },
  letterMessage: {
    type: new Schema({
      greeting: { type: String, default: 'Dear em iu ,' },
      content: { type: String, default: '' }
    }, { _id: false }),
    default: { greeting: 'Dear em iu ,', content: '' }
  },
  createdAt: { type: Date, default: Date.now },
  slug: { type: String, unique: true },
});

// Create a URL-friendly slug from names and timestamp - using default function
CardSchema.path('slug').default(function(this: ICard) {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${this.name1.toLowerCase()}-${this.name2.toLowerCase()}-${timestamp}-${randomStr}`;
});

// Delete cached model to ensure schema updates are applied
if (mongoose.models.Card) {
  delete mongoose.models.Card;
}

export default mongoose.model<ICard>('Card', CardSchema);
