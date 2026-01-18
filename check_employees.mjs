import { drizzle } from "drizzle-orm/mysql2";
import { eq, inArray } from "drizzle-orm";
import { mysqlTable, int, varchar, mysqlEnum, timestamp, text } from "drizzle-orm/mysql-core";

const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  positionLevel: varchar("positionLevel", { length: 50 }).notNull(),
  entityId: int("entityId").notNull(),
});

const businessEntities = mysqlTable("business_entities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

async function main() {
  const db = drizzle(process.env.DATABASE_URL);
  
  // Get family members
  const familyMembers = await db.select({
    id: employees.id,
    firstName: employees.firstName,
    lastName: employees.lastName,
    jobTitle: employees.jobTitle,
    positionLevel: employees.positionLevel,
    entityId: employees.entityId,
  })
  .from(employees)
  .where(inArray(employees.firstName, ['Shanna', 'LaShanna', 'Craig', 'Cornelius', 'Amber', 'Essence', 'Amandes']));
  
  console.log("Family Members:");
  console.log(JSON.stringify(familyMembers, null, 2));
  
  // Get all entities
  const entities = await db.select().from(businessEntities);
  console.log("\nBusiness Entities:");
  console.log(JSON.stringify(entities, null, 2));
  
  process.exit(0);
}

main().catch(console.error);
