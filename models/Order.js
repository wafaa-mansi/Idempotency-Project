import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    idempotencyKey: {
        type: String,
        required: true,
        unique: true
    }
});

const Order = mongoose.model(
    "Order",
    orderSchema,
    "orders"
);

export default Order;