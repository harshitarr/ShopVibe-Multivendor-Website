import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    mrp: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    images: [{
        type: String,
    }],
    category: {
        type: String,
        required: true,
    },
    inStock: {
        type: Boolean,
        default: true,
    },
    storeId: {
        type: String,
        required: true,
        ref: 'Store',
    },

    // ⭐ Added according to Prisma relation: rating Rating[]
    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating'
    }],

}, {
    timestamps: true,
    collection: 'products'
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
