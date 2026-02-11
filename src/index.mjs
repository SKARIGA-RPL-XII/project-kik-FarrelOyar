import express from "express";
import userRoutes from "./routes/users.routes.js";
import itemRoutes from "./routes/items.routes.js";
import authRoutes from "./routes/auth.routes.js";
import appointmentsRoutes from "./routes/appointments.routes.js";
import invoicesRoutes from "./routes/invoices.routes.js";
import db from "./config/db.js";
import cors from "cors";


const app = express();
const PORT = process.env.PORT || 3000;



app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  })
);
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// routes
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api",authRoutes );
app.use("/api/appointments",appointmentsRoutes );
app.use("/api/invoices",invoicesRoutes );






app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json({
      success: true,
      message: "Database connected",
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});



app.listen(PORT, () => {
  console.log("Running port:", PORT);
});
