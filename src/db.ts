import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'seedbank'
const STORE = 'images'

let dbp: Promise<IDBPDatabase> | null = null

function db(): Promise<IDBPDatabase> {
  if (!dbp) {
    dbp = openDB(DB_NAME, 1, {
      upgrade(d) {
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE)
      },
    })
  }
  return dbp
}

export async function putImage(id: string, blob: Blob): Promise<void> {
  const d = await db()
  await d.put(STORE, blob, id)
}

export async function getImage(id: string): Promise<Blob | undefined> {
  const d = await db()
  return d.get(STORE, id)
}

export async function delImage(id: string): Promise<void> {
  const d = await db()
  await d.delete(STORE, id)
}

export async function listImages(): Promise<{ id: string; blob: Blob }[]> {
  const d = await db()
  const keys = (await d.getAllKeys(STORE)) as string[]
  const out: { id: string; blob: Blob }[] = []
  for (const k of keys) {
    const blob = (await d.get(STORE, k)) as Blob | undefined
    if (blob) out.push({ id: k, blob })
  }
  return out
}
