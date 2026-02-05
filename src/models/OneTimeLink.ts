import mongoose, { Schema, Document } from 'mongoose';

export interface IOneTimeLink extends Document {
    token: string;
    used: boolean;
    usedAt?: Date;
    createdCardId?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const OneTimeLinkSchema = new Schema<IOneTimeLink>({
    token: { type: String, required: true, unique: true },
    used: { type: Boolean, default: false },
    usedAt: { type: Date },
    createdCardId: { type: Schema.Types.ObjectId, ref: 'Card' },
    createdAt: { type: Date, default: Date.now },
});

// Generate a unique token
OneTimeLinkSchema.path('token').default(function () {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${randomStr}`;
});

export default mongoose.models.OneTimeLink || mongoose.model<IOneTimeLink>('OneTimeLink', OneTimeLinkSchema);
