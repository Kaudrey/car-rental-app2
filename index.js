const express = require("express");
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const { Client } = require('pg');

const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const swaggerUi = require('swagger-ui-express');
const swaggerJson = require('./swagger.json');

dotenv.config({ path: './.env' });

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerJson));

const client = new Client({
  host: process.env.HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME, 
});

client.connect()
  .then(() => console.log("Connected to the database successfully"))
  .catch(err => console.error("Error connecting to the database:", err));

let PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
