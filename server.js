import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/Order.js";

dotenv.config();

const app = express();

app.use(express.json());

app.post("/orders", async function(req, res) {

    const idempotencyKey =
        req.get("Idempotency-Key");

    if (!idempotencyKey) {
        return res.status(400).json({
            message: "Idempotency-Key is required"
        });
    }

    try {

        const existingOrder =
            await Order.findOne({
                idempotencyKey: idempotencyKey
            });

        if (existingOrder) {
            return res.status(200).json({
                message: "Existing order returned",
                order: existingOrder
            });
        }

        const {
            product,
            quantity,
            price
        } = req.body;

        if (!product || !quantity || price === undefined) {
            return res.status(400).json({
                message: "Product, quantity and price are required"
            });
        }

        try {

            const newOrder =
                await Order.create({
                    product,
                    quantity,
                    price,
                    idempotencyKey
                });

            return res.status(201).json({
                message: "Order created",
                order: newOrder
            });

        } catch (error) {

            if (error.code === 11000) {

                const existingOrder =
                    await Order.findOne({
                        idempotencyKey: idempotencyKey
                    });

                return res.status(200).json({
                    message: "Existing order returned",
                    order: existingOrder
                });
            }

            throw error;
        }

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/orders", async function(req, res) {

    try {

        const orders =
            await Order.find();

        res.status(200).json(orders);

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(function() {

        console.log("Connected to MongoDB");

        app.listen(3000, function() {
            console.log(
                "Server running on http://localhost:3000"
            );
        });

    })
    .catch(function(error) {
        console.log(error);
    });