const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./db/mongoose');
require('./db/mongoose');

/* Routes */
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const Task = require('./models/task');
const User = require('./models/user');

const app = express();
/* Connect to DB */
connectDB();

app.use(express.json());

/* Route files */
app.use(userRouter, taskRouter);

module.exports = app;