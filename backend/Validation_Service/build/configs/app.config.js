import taskController from "../src/task.controller.js";
import express from "express";
import cors from 'cors';
const app = express();
app.use(express.json());
app.use(cors());
app.use("/task", taskController);
export default app;
