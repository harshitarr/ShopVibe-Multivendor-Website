import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'pending',
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    logo: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    collection: 'stores'
});

export default mongoose.models.Store || mongoose.model('Store', StoreSchema);
