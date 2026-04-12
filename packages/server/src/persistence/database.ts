import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

export interface RunResult {
  readonly changes: number
}

export interface DatabaseConnection {
  readonly db: SqlJsDatabase
  close(): void
  run(sql: string, params?: unknown[]): RunResult
  get<T>(sql: string, params?: unknown[]): T | undefined
  all<T>(sql: string, params?: unknown[]): T[]
  save(): void
}

export async function createDatabase(dbPath: string): Promise<DatabaseConnection> {
  const dir = dirname(dbPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const SQL = await initSqlJs()

  let db: SqlJsDatabase
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  db.run('PRAGMA journal_mode=MEMORY')
  db.run('PRAGMA foreign_keys=ON')

  const save = (): void => {
    const data = db.export()
    const buffer = Buffer.from(data)
    writeFileSync(dbPath, buffer)
  }

  return {
    db,

    close(): void {
      save()
      db.close()
    },

    run(sql: string, params?: unknown[]): RunResult {
      db.run(sql, params as any[])
      const changes = db.getRowsModified()
      save()
      return { changes }
    },

    get<T>(sql: string, params?: unknown[]): T | undefined {
      const stmt = db.prepare(sql)
      if (params) stmt.bind(params as any[])
      if (stmt.step()) {
        const row = stmt.getAsObject() as T
        stmt.free()
        return row
      }
      stmt.free()
      return undefined
    },

    all<T>(sql: string, params?: unknown[]): T[] {
      const results: T[] = []
      const stmt = db.prepare(sql)
      if (params) stmt.bind(params as any[])
      while (stmt.step()) {
        results.push(stmt.getAsObject() as T)
      }
      stmt.free()
      return results
    },

    save,
  }
}
