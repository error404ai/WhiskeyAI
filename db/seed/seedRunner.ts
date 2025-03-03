import { freshDb } from "./freshDb";
import { FunctionsSeeder } from "./seeders/functionSeeder";
import { RoleSeeder } from "./seeders/roleSeeder";
import { UserSeeder } from "./seeders/userSeeder";

const args = process.argv;
const isFresh = args.includes("--fresh");

const seederClasses = [RoleSeeder, UserSeeder, FunctionsSeeder];
const seeders = seederClasses.map((SeederClass) => new SeederClass());

async function runSeeders() {
  console.log("seeders are", seeders);
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  if (isFresh) {
    await freshDb();
  }

  for (const seeder of seeders) {
    await seeder.seed();
    console.log(`${seeder.constructor.name} seeder finished seeding successfully`);
  }

  console.log("Database seeded successfully");
}

runSeeders()
  .catch((err) => {
    console.error("Error seeding database", err);
  })
  .finally(() => {
    process.exit(0);
  });
