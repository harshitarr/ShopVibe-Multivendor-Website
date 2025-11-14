import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    review: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
        ref: 'User',
    },
    productId: {
        type: String,
        required: true,
        ref: 'Product',
    },
    orderId: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    collection: 'ratings'
});

// Unique constraint: one rating per user per product per order
RatingSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model('Rating', RatingSchema);
