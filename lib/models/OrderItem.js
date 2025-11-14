import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        ref: 'Order',
    },
    productId: {
        type: String,
        required: true,
        ref: 'Product',
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
    collection: 'orderItems'
});

// Composite unique index for orderId + productId
OrderItemSchema.index({ orderId: 1, productId: 1 }, { unique: true });

export default mongoose.models.OrderItem || mongoose.model('OrderItem', OrderItemSchema);
