const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            /* Disappear all advertisments of deprecated */
            useFindAndModify: false
        });
        console.log('DB Connected');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
 
}

module.exports = connectDB;