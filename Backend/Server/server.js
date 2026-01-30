const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
app = express();
app.use(express.json());
dotenv.config();
// Default to 5000 if PORT is not set
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
const authRouter = require("./Routers/AuthRouter");
const contractRouter = require("./Routers/ContractRouter");
const freelancerRouter = require("./Routers/freelancerRouter");
const disputeRouter = require("./Routers/DisputeRoutes");
app.use("/api/auth", authRouter);
app.use("/api/contracts", contractRouter);
app.use("/api/freelancer", freelancerRouter);
app.use("/api/disputes", disputeRouter);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
