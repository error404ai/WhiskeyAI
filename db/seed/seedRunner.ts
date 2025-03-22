import { freshDb } from "./freshDb";
import { FunctionsSeeder } from "./seeders/functionSeeder";
import { RoleSeeder } from "./seeders/roleSeeder";
import { UserSeeder } from "./seeders/userSeeder";
import { Seeder } from "./SeederInterface";

// Parse command line arguments
const args = process.argv.slice(2);
const isFresh = args.includes("--fresh");

// Map of all available seeders
const seedersMap: Record<string, new () => Seeder> = {
  "roles": RoleSeeder,
  "users": UserSeeder,
  "functions": FunctionsSeeder,
};

// Determine which seeders to run
let seedersToRun: Seeder[] = [];

// If specific seeders are specified, run only those
const specifiedSeeders = args.filter(arg => !arg.startsWith("--"));
if (specifiedSeeders.length > 0) {
  for (const seederName of specifiedSeeders) {
    const SeederClass = seedersMap[seederName];
    if (SeederClass) {
      seedersToRun.push(new SeederClass());
    } else {
      console.error(`Seeder "${seederName}" not found. Available seeders: ${Object.keys(seedersMap).join(", ")}`);
      process.exit(1);
    }
  }
} else {
  // Run all seeders if none specified
  seedersToRun = Object.values(seedersMap).map(SeederClass => new SeederClass());
}

async function runSeeders() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  if (isFresh) {
    console.log("Refreshing database...");
    await freshDb();
  }

  console.log(`Running ${seedersToRun.length} seeder(s)...`);
  
  for (const seeder of seedersToRun) {
    const seederName = seeder.constructor.name;
    console.log(`Running ${seederName}...`);
    await seeder.seed();
    console.log(`✓ ${seederName} completed successfully`);
  }

  console.log("Database seeding completed");
}

runSeeders()
  .catch((err) => {
    console.error("Error seeding database", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
