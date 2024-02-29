const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 3000

const authRouter = require("./routes/routes");
app.use(express.json());
app.use("/api", authRouter);

mongoose.set("strictQuery", false)
mongoose.connect('mongodb+srv://root:Root_123@devapi.itgv8de.mongodb.net/?retryWrites=true&w=majority&appName=DevAPI')
.then(() => {
    app.listen(port, () => {
        console.log(`Node API is working on PORT ${port}`)
    });
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.log(error);
})
