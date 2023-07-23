"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const typechat_1 = require("typechat");
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
const port = 4000;
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
dotenv_1.default.config();
const model = (0, typechat_1.createLanguageModel)(process.env);
const schema = fs_1.default.readFileSync(path_1.default.join(__dirname, "coffeOrdersSchema.ts"), "utf8");
const translator = (0, typechat_1.createJsonTranslator)(model, schema, "Cart");
app.post("/api/order-request", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newMessage } = req.body;
    console.log(newMessage);
    if (!newMessage || newMessage === "") {
        console.log("missing order");
        res.json({ error: "missing order" });
        return;
    }
    // query TypeChat to translate this into an intent
    const response = yield translator.translate(newMessage);
    if (!response.success) {
        console.log(response.message);
        res.json({ error: response.message });
        return;
    }
    yield processOrder(response.data);
    res.json({
        items: response.data.items
    });
}));
const processOrder = (cart) => __awaiter(void 0, void 0, void 0, function* () {
    // add this to a queue or any other background process
    console.log(JSON.stringify(cart, undefined, 2));
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running on port 4000`);
});
