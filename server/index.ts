import express, { Express } from 'express';
import cors from "cors";
import fs from "fs";
import path from "path";
import { createLanguageModel, createJsonTranslator, processRequests, Result } from "typechat";
import { Cart } from "./coffeOrdersSchema";
import dotenv from "dotenv";

const app: Express = express();
const port = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
dotenv.config();

const model = createLanguageModel(process.env);
const schema = fs.readFileSync(path.join(__dirname, "coffeOrdersSchema.ts"), "utf8");
const translator = createJsonTranslator<Cart>(model, schema, "Cart");

app.post("/api/order-request", async (req, res) => {
    const { newMessage } = req.body;
    console.log(newMessage);

    if (!newMessage || newMessage === "") {
        console.log("missing order");
        res.json({error: "missing order"});
        return;
    }

    // query TypeChat to translate this into an intent
    const response: Result<Cart> = await translator.translate(newMessage as string);

    if (!response.success) {
        console.log(response.message);
        res.json({error: response.message});
        return;
    }

    await processOrder(response.data);

    res.json({
        items: response.data.items
    });
});

const processOrder = async (cart: Cart) => {
    // add this to a queue or any other background process
    console.log(JSON.stringify(cart, undefined, 2));
};

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running on port 4000`);
});


