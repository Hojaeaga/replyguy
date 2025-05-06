import 'dotenv/config';
import taskController from "./task.controller.js"
import express from "express"
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(cors())
app.use("/task", taskController)

const PORT = process.env.port || process.env.PORT || 4002

app.listen(PORT, () => console.log("Server started on port:", PORT))