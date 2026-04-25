import { promises as fs } from "node:fs";
import path from "node:path";

type SimpleRecord = {
  id: number;
  name: string;
  createdAt: string;
};

const dbPath = path.join(process.cwd(), "data", "simple-db.json");

async function ensureDbFile() {
  const dir = path.dirname(dbPath);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, "[]", "utf-8");
  }
}

export async function readSimpleData(): Promise<SimpleRecord[]> {
  await ensureDbFile();
  const raw = await fs.readFile(dbPath, "utf-8");

  try {
    const parsed = JSON.parse(raw) as SimpleRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addSimpleData(name: string): Promise<SimpleRecord> {
  const data = await readSimpleData();
  const next: SimpleRecord = {
    id: Date.now(),
    name,
    createdAt: new Date().toISOString(),
  };

  data.push(next);
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");

  return next;
}
