import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pg from "pg";

// Connecting to database and setting up express server

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const dbConnectionString = process.env.DATABASE_URL;

const db = new pg.Pool({ connectionString: dbConnectionString });

// end point to insert username & hashed password into database

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

// endpoint to check if credentials correct to see if user can login

app.post("/login", async function (request, response) {
  const username = request.body.username;
  const password = request.body.password;

  const result = await db.query(
    "SELECT password FROM username_password WHERE username = $1",
    [username]
  );

  if (result.rows.length === 0) {
    response.json({ message: "Username/Password Incorrect" });
  } else {
    const storedHashedPassword = result.rows[0].password;
    const isMatch = await bcrypt.compare(password, storedHashedPassword);
    if (isMatch) {
      response.json({ message: "" });
    } else {
      response.json({ message: "Username/Password Incorrect" });
    }
  }
});

// endpoint to insert people/organisation data in database

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

  const formatOrganizationName = (string) => {
    let cleanedString = string.replace(/\'s/gi, "s").trim();

    return (
      cleanedString.charAt(0).toUpperCase() +
      cleanedString.slice(1).toLowerCase()
    );
  };
  const organisations = [
    organisation1,
    organisation2,
    organisation3,
    organisation4,
  ]
    .filter((org) => org && org.trim() !== "")
    .map((org) => formatOrganizationName(org.trim()));

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

// endpoint to provide all organisations with people that work for them

app.get("/", async function (request, response) {
  try {
    const result = await db.query(`
    SELECT 
    o.organisation_name, 
    o.organisationid,
    json_agg(json_build_object('id', p.personid, 'name', p.person_name, 'country_code', p.country_code, 'phone', p.phone, 'email', p.email, 'account', 
    p.account_number, 'ethnicity', p.ethnicity)) 
    AS people_details
FROM 
    organisations o
JOIN 
    organisation_people op ON o.organisationid = op.organisationid
JOIN 
    people p ON op.personid = p.personid
GROUP BY 
    o.organisation_name, o.organisationid

      `);
    response.json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    response.status(500).json({ message: "Error fetching data from database" });
  }
});

// end point to delete data from organisations

app.post("/delete", async function (request, response) {
  const deleteData = request.body.delete;
  const id = request.body.data.id;
  const orgid = request.body.orgid;
  const org = request.body.org;
  let orgDeleted = "";

  try {
    const linkCheck = await db.query(
      "SELECT COUNT(*) AS count FROM organisation_people WHERE personid = $1",
      [id]
    );

    const res = await db.query(
      "DELETE FROM organisation_people WHERE personid = $1 AND organisationid = $2",
      [id, orgid]
    );

    if (linkCheck.rows[0].count == 1) {
      await db.query("DELETE FROM people WHERE personid = $1", [id]);
    }

    if (deleteData == "delete") {
      orgDeleted = "yes";
      await db.query("DELETE FROM organisations WHERE organisation_name = $1", [
        org,
      ]);
    }
    if (res.rowCount === 0) {
      response.status(404).json({ message: "Entry not found" });
    } else {
      response.json({ message: "", orgDeleted: orgDeleted, orgName: org });
    }
  } catch (error) {
    console.error("Delete operation failed:", error);
    response.status(500).json({ message: "Failed to delete the entry" });
  }
});

// test

app.get("/data2", async function (request, response) {
  response.json({ message: "Hello Connor" });
});

// server running

app.listen(8080, function () {
  console.log(`Server is running on port 8080`);
});
