import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    cart: {
        type: Object,
        default: {},
    },
}, {
    timestamps: true,
    collection: 'users'
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
