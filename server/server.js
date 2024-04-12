import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

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

// app.get("/employees", async function (request, response) {
//   const result = await db.query(`SELECT * FROM employees`);

//   response.json(result.rows);
// });

app.post("/sign-up", async function (request, response) {
  const username = request.body.username;
  const password = request.body.password;

  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    await db.query(
      "INSERT INTO username_password (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    );
  } catch (error) {
    console.log("Username already exists");
  }

  response.json("uploaded");
});

app.post("/login", async function (request, response) {
  const username = request.body.username;
  const password = request.body.password;

  const result = await db.query(
    "SELECT password FROM username_password WHERE username = $1",
    [username]
  );

  if (result.rows.length === 0) {
    console.log("no user exists");
  } else {
    const storedHashedPassword = result.rows[0].password;
    const isMatch = await bcrypt.compare(password, storedHashedPassword);
    if (isMatch) {
      console.log("You have logged in");
    } else {
      console.log("password incorrect");
    }
  }

  response.json("checked");
});

app.listen(8080, function () {
  console.log(`Server is running on port 8080`);
});
