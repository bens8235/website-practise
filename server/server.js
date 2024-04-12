import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config(); // allow us to use the environment variables (like the DATABASE_URL)
const app = express();
app.use(express.json());
app.use(cors());

// connect to your database
import pg from "pg";
const dbConnectionString = process.env.DATABASE_URL;

const db = new pg.Pool({ connectionString: dbConnectionString });

app.get("/", function (request, response) {
  response.json("You are looking at my server");
});

app.get("/employees", async function (request, response) {
  const result = await db.query(`SELECT * FROM employees`);

  response.json(result.rows);
});

app.listen(8080, function () {
  console.log(`Server is running on port 8080`);
});
