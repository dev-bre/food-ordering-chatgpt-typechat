import express, { Express } from 'express';
import cors from "cors"; 

const app: Express = express();
const port = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.post("/api/order-request", (req, res) => {
      const { messages } = req.body;
      console.log(messages);

    // query TypeChat to translate this into an intent
    


    res.json({
        message: "Food ordering chatbot",
    });
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running on port 4000`);
});


