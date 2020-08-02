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
const port = process.env.PORT;

// /* multer uploads file */
// const multer = require('multer');
// const upload = multer({
//     dest: 'images' 
// });

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send();
// });

/* If you use arrow functions you can't bind this */
// const test = function () {
//      const user = this;
// }

// /* Without Middleware: new request -> run route handler
// *  With middleware: new request -> do something -> run route handler */
// app.use((req, res, next) => {
//     if (req.method) {
//         res.status(503).send('Site is currently down. Check back soon');
//     } else {
//         next();
//     }
// });

app.use(express.json());

/* Route files */
app.use(userRouter, taskRouter);

// /* Bcryptjs and jwt */
// const jwt = require('jsonwebtoken');

// const myFunction = async () => {
//     const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days'});
//     console.log(token);

//     const data = jwt.verify(token, 'thisismynewcourse');
//     console.log(data);
// }

// myFunction();

// // /* JSON String */
// const pet = {
//     name: 'CatName'
// };

// pet.toJSON = function () {
//     return {};
// };
// console.log(JSON.stringify(pet));

// /* Ref to other table and populate
// * populate is used for populating the data inside the reference */
// const main = async () => {
//     // const task = await Task.findById('5f22a8603d31e832d7de7f41');
//     // await task.populate('owner').execPopulate();
//     // console.log(task.owner);

//     const user = await User.findById('5f22a6b2475bf72fd666d86b');
//     await user.populate('tasks').execPopulate();
//     console.log(user.tasks);
// }
// main();

/* Set up server */
app.listen(port, () => {
    console.log('Server is up on port', port)
});

