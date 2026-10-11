import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules/flag-icons/flags/4x3");
const license = join(root, "node_modules/flag-icons/LICENSE");
const destination = join(root, "public/flags/4x3");

if (!existsSync(source) || !existsSync(license)) {
  console.error("flag-icons is not installed; run yarn install before copying flags.");
  process.exit(1);
}

mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true });
cpSync(license, join(root, "public/flags/LICENSE"));
console.log("Copied flag-icons 4x3 SVGs and MIT license to public/flags.");
