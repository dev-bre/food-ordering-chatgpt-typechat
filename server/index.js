"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 4000;
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/api/order-request", (req, res) => {
    res.json({
        message: "Hello world",
    });
});
app.post("/api/order-request", (req, res) => {
    const { messages } = req.body;
    console.log(messages);
    res.json({
        message: "Food ordering chatbot",
    });
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running on port 4000`);
});
