import type { DatabaseConnection } from '../database.js'

export interface HistoryRecord {
  readonly id: number
  readonly entity_id: string
  readonly state: string
  readonly attributes: Readonly<Record<string, unknown>>
  readonly timestamp: string
}

export interface HistoryQueryOptions {
  readonly limit?: number
  readonly start?: string
  readonly end?: string
}

interface RawHistoryRow {
  readonly id: number
  readonly entity_id: string
  readonly state: string
  readonly attributes: string
  readonly timestamp: string
}

interface CountRow {
  readonly total: number
}

function toHistoryRecord(row: RawHistoryRow): HistoryRecord {
  return {
    id: row.id,
    entity_id: row.entity_id,
    state: row.state,
    attributes: JSON.parse(row.attributes) as Record<string, unknown>,
    timestamp: row.timestamp,
  }
}

export class HistoryRepository {
  private readonly db: DatabaseConnection

  constructor(db: DatabaseConnection) {
    this.db = db
  }

  record(entityId: string, state: string, attributes: Readonly<Record<string, unknown>>): void {
    const timestamp = new Date().toISOString()
    this.db.run(
      'INSERT INTO state_history (entity_id, state, attributes, timestamp) VALUES (?, ?, ?, ?)',
      [entityId, state, JSON.stringify(attributes), timestamp],
    )
  }

  query(entityId: string, options: HistoryQueryOptions = {}): HistoryRecord[] {
    const clauses: string[] = ['entity_id = ?']
    const params: unknown[] = [entityId]

    if (options.start !== undefined) {
      clauses.push('timestamp >= ?')
      params.push(options.start)
    }

    if (options.end !== undefined) {
      clauses.push('timestamp <= ?')
      params.push(options.end)
    }

    const where = clauses.join(' AND ')
    const limit = options.limit !== undefined ? ' LIMIT ?' : ''

    if (options.limit !== undefined) {
      params.push(options.limit)
    }

    const rows = this.db.all<RawHistoryRow>(
      `SELECT id, entity_id, state, attributes, timestamp FROM state_history WHERE ${where} ORDER BY timestamp DESC${limit}`,
      params,
    )

    return rows.map(toHistoryRecord)
  }

  prune(maxAgeMs: number): number {
    const cutoff = new Date(Date.now() - maxAgeMs).toISOString()
    const result = this.db.run(
      'DELETE FROM state_history WHERE timestamp < ?',
      [cutoff],
    )
    return result.changes
  }

  count(entityId?: string): number {
    if (entityId !== undefined) {
      const row = this.db.get<CountRow>(
        'SELECT COUNT(*) AS total FROM state_history WHERE entity_id = ?',
        [entityId],
      )
      return row?.total ?? 0
    }

    const row = this.db.get<CountRow>(
      'SELECT COUNT(*) AS total FROM state_history',
    )
    return row?.total ?? 0
  }
}
