import { execFileSync } from "node:child_process";

const baseline = "20200101000000_existing_database_baseline";

try {
  execFileSync("npx", ["--no-install", "prisma", "migrate", "resolve", "--applied", baseline], {
    encoding: "utf8",
  });
} catch (error) {
  const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}\n${error.message ?? ""}`;
  // P3008 signifie que le baseline est déjà enregistré : état idempotent.
  if (output.includes("P3008")) process.exit(0);
  process.stderr.write(output);
  process.exit(error.status || 1);
}
