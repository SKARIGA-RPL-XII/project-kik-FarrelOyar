import express from "express";
import userRoutes from "./routes/users.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());

// routes
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

app.listen(PORT, () => {
  console.log("Running port:", PORT);
});
