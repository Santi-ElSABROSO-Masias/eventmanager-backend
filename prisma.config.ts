import "dotenv/config";
import { defineConfig } from "prisma/config";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});