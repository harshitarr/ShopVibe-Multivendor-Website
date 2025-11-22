import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    forNewUser: {
        type: Boolean,
        required: true,
    },
    forMember: {
        type: Boolean,
        default: false,
    },
    isPublic: {
        type: Boolean,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usageLimit: {
        type: Number,
        default: null, // null means unlimited
    },
    usageCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    collection: 'coupons'
});

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
