import express from 'express';
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();

//! Connecting to mongoDB
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL , { useNewUrlParser: true , useUnifiedTopology: true });
        console.log("Database Connected Successfully");
    } catch (error) {
        throw error;
    }  
};

mongoose.connection.on('disconnected',()=>{
    console.log("Database got Disconnected");
})
mongoose.connection.on('connected',()=>{
    console.log("Database got Connected");
})
mongoose.connection.on('error',()=>{
    console.log("Error Occured");
})

connect();


//! Creating a Schema
const todoSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: {
        type: Boolean,
        default: false
      },
});


//! Creating a Model
const Todo = mongoose.model("Todo", todoSchema);



//! Creating a Document
app.post("/api/todo", async (req, res) => {
    try {
        const todo = await Todo.create(req.body);
        return res.status(201).json({ todo });
        res.send(todo);
        const checkBoolean = req.body.status;
        if (checkBoolean !== true || checkBoolean !== false) {
            return res.status(400).send("Invalid Status");
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get("/", (req, res) => {
    res.send("Backend is working");
});



//! Getting all the Documents
app.get("/api/todo", async (req, res) => {
    try {
        const todos = await Todo.find();
        return res.status(200).json({ todos });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


//! Getting a Single Document by ID

app.get("/api/todo/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await Todo.findById(id).exec();
        if (!todo) {
            res.status(404).send("Todo Not Found");
        } else {
            res.status(200).json({ todo });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});



//! Updating a Single Document by ID
app.put("/api/todo/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const todo = await Todo.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true }
        );

        if (!todo) {
            return res.status(404).send({
                message: "Todo not found",
            });
        }

        return res.send({ todo });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


//! Deleting a Single Document by ID
app.delete("/api/todo/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const todo = await Todo.findByIdAndDelete(id);

        if (!todo) {
            return res.status(404).send({
                message: "Todo not found",
            });
        }

        return res.send({ message: "Todo deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.all("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
});



const port = 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
