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
    response.json({ message: "" });
  } catch (error) {
    response.json({ message: "Username already exists" });
  }
});

app.post("/login", async function (request, response) {
  const username = request.body.username;
  const password = request.body.password;

  const result = await db.query(
    "SELECT password FROM username_password WHERE username = $1",
    [username]
  );

  if (result.rows.length === 0) {
    response.json({ message: "No user exists" });
  } else {
    const storedHashedPassword = result.rows[0].password;
    const isMatch = await bcrypt.compare(password, storedHashedPassword);
    if (isMatch) {
      response.json({ message: "" });
    } else {
      response.json({ message: "password incorrect" });
    }
  }
});

app.post("/data", async function (request, response) {
  const person = request.body.person;
  const countryCode = request.body.countryCode;
  const number = request.body.number;
  const email = request.body.email;
  const account = request.body.account;
  const ethnicGroup = request.body.ethnicGroup;
  const organisation1 = request.body.organisation1;
  const organisation2 = request.body.organisation2;
  const organisation3 = request.body.organisation3;
  const organisation4 = request.body.organisation4;

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const organisations = [
    organisation1,
    organisation2,
    organisation3,
    organisation4,
  ]
    .filter((org) => org && org.trim() !== "")
    .map((org) => capitalizeFirstLetter(org.trim()));

  try {
    const peopleResult = await db.query(
      "INSERT INTO people (person_name, country_code, phone, email, account_number, ethnicity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING personid",
      [person, countryCode, number, email, account, ethnicGroup]
    );

    const personId = peopleResult.rows[0].personid;

    const organisationIds = [];

    for (const orgName of organisations) {
      const orgResult = await db.query(
        `INSERT INTO organisations (organisation_name) VALUES ($1)
        ON CONFLICT (organisation_name) DO UPDATE SET organisation_name=EXCLUDED.organisation_name
        RETURNING organisationid`,
        [orgName]
      );
      organisationIds.push(orgResult.rows[0].organisationid); // Get existing or new org ID
    }

    for (let orgId of organisationIds) {
      await db.query(
        "INSERT INTO organisation_people (personid, organisationid) VALUES ($1, $2)",
        [personId, orgId]
      );
    }
    response.json({ message: "" });
  } catch (error) {
    response.json({ message: "User already exists in database" });
  }
});

app.listen(8080, function () {
  console.log(`Server is running on port 8080`);
});
