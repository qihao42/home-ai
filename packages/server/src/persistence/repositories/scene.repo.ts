import type { Scene, SceneEntityState } from '@smarthome/shared'
import type { DatabaseConnection } from '../database.js'

interface SceneRow {
  readonly id: string
  readonly name: string
  readonly icon: string
  readonly entities: string
  readonly created_at: string | null
  readonly updated_at: string | null
}

function toScene(row: SceneRow): Scene {
  const entities = JSON.parse(row.entities) as readonly SceneEntityState[]
  return Object.freeze({
    id: row.id,
    name: row.name,
    icon: row.icon,
    entities: Object.freeze(entities.map((e) => Object.freeze({ ...e }))),
  })
}

function entitiesToJson(scene: Scene): string {
  return JSON.stringify(scene.entities)
}

export class SceneRepository {
  private readonly db: DatabaseConnection

  constructor(db: DatabaseConnection) {
    this.db = db
  }

  findAll(): Scene[] {
    const rows = this.db.all<SceneRow>(
      'SELECT id, name, icon, entities, created_at, updated_at FROM scenes ORDER BY created_at ASC',
    )
    return rows.map(toScene)
  }

  findById(id: string): Scene | null {
    const row = this.db.get<SceneRow>(
      'SELECT id, name, icon, entities, created_at, updated_at FROM scenes WHERE id = ?',
      [id],
    )
    return row !== undefined ? toScene(row) : null
  }

  upsert(scene: Scene): Scene {
    const now = new Date().toISOString()
    const existing = this.findById(scene.id)
    if (existing === null) {
      this.db.run(
        'INSERT INTO scenes (id, name, icon, entities, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [scene.id, scene.name, scene.icon, entitiesToJson(scene), now, now],
      )
    } else {
      this.db.run(
        'UPDATE scenes SET name = ?, icon = ?, entities = ?, updated_at = ? WHERE id = ?',
        [scene.name, scene.icon, entitiesToJson(scene), now, scene.id],
      )
    }
    return scene
  }

  delete(id: string): boolean {
    const result = this.db.run('DELETE FROM scenes WHERE id = ?', [id])
    return result.changes > 0
  }

  count(): number {
    const row = this.db.get<{ readonly c: number }>(
      'SELECT COUNT(*) as c FROM scenes',
    )
    return row?.c ?? 0
  }
}
