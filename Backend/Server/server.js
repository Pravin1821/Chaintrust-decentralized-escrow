const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
app = express();
app.use(express.json());
dotenv.config();
const PORT = process.env.PORT;
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));
const authRouter = require('./Routers/AuthRouter');
app.use('/api/auth', authRouter);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});