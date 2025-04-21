import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SEEDERS_DIR = path.join(__dirname, 'seeders');
const TEMPLATE = `import { db } from "@/db/db";
import { Seeder } from "../SeederInterface";

export class $NAME implements Seeder {
  async seed(): Promise<void> {
    // Implement your seeding logic here
    console.log('$NAME seeding logic not implemented yet');
  }
}
`;

if (!fs.existsSync(SEEDERS_DIR)) {
  fs.mkdirSync(SEEDERS_DIR, { recursive: true });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(capitalize)
    .join('');
}

function createSeeder(name: string): void {
  const className = `${pascalCase(name)}Seeder`;
  
  const filePath = path.join(SEEDERS_DIR, `${name.toLowerCase()}Seeder.ts`);
  
  if (fs.existsSync(filePath)) {
    console.error(`Seeder ${filePath} already exists!`);
    process.exit(1);
  }
  
  const content = TEMPLATE.replace(/\$NAME/g, className);
  fs.writeFileSync(filePath, content);
  
  console.log(`Created seeder: ${filePath}`);
  
  console.log(`
Don't forget to update seedRunner.ts to include your new seeder:

1. Import the seeder:
   import { ${className} } from "./seeders/${name.toLowerCase()}Seeder";

2. Add it to the seedersMap:
   const seedersMap = {
     // ... existing seeders
     "${name.toLowerCase()}": ${className},
   };
  `);
}

const nameArg = process.argv[2];
if (nameArg) {
  createSeeder(nameArg);
  process.exit(0);
}

rl.question('Enter the name for the new seeder (without "Seeder" suffix): ', (name) => {
  if (!name) {
    console.error('Name is required!');
    process.exit(1);
  }
  
  createSeeder(name);
  rl.close();
}); 