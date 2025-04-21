import { db } from "@/server/db/db";
import AdminService from "@/server/services/adminService";

import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createAdmin() {
  console.log("Create Admin User");
  console.log("=================");

  const username = await promptQuestion("Username: ");
  const password = await promptQuestion("Password: ");
  const name = await promptQuestion("Full Name: ");
  const email = await promptQuestion("Email Address: ");

  try {
    console.log("Creating admin user...");
    const result = await AdminService.createAdmin(username, password, name, email);

    if (result) {
      console.log("Admin user created successfully!");
    } else {
      console.error("Failed to create admin user.");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    rl.close();

    // Close the database connection
    // Check if $client exists (which is how db client is typically exposed in Drizzle)
    if (db.$client && typeof db.$client.end === "function") {
      await db.$client.end();
    }

    // Exit process after closing connections
    process.exit(0);
  }
}

function promptQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

createAdmin().catch(console.error);
