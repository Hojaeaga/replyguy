import 'dotenv/config';
import app from "./configs/app.config.js";
const PORT = process.env.port || process.env.PORT || 4002;
app.listen(PORT, () => console.log("Server started on port:", PORT));
