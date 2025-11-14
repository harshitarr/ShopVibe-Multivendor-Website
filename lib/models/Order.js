import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        default: 'ORDER_PLACED',
    },
    userId: {
        type: String,
        required: true,
        ref: 'User',
    },
    storeId: {
        type: String,
        required: true,
        ref: 'Store',
    },
    addressId: {
        type: String,
        required: true,
        ref: 'Address',
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'STRIPE'],
        required: true,
    },
    isCouponUsed: {
        type: Boolean,
        default: false,
    },
    coupon: {
        type: Object,
        default: {},
    },
}, {
    timestamps: true,
    collection: 'orders'
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
