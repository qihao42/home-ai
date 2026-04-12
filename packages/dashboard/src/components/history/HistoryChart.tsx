import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { HistoryEntry } from '../../types'
import { formatTime } from '../../utils/format-value'

interface HistoryChartProps {
  entries: HistoryEntry[]
  entityName: string
}

interface ChartDataPoint {
  time: string
  timestamp: number
  value: number
  raw: string
}

export function HistoryChart({ entries, entityName }: HistoryChartProps) {
  const data: ChartDataPoint[] = entries
    .map((entry) => {
      const numValue = parseFloat(entry.state)
      return {
        time: formatTime(entry.timestamp),
        timestamp: new Date(entry.timestamp).getTime(),
        value: isNaN(numValue) ? 0 : numValue,
        raw: entry.state,
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp)

  const isNumeric = entries.some((e) => !isNaN(parseFloat(e.state)))

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed
        border-slate-600 text-slate-500">
        No history data available
      </div>
    )
  }

  if (!isNumeric) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-[var(--bg-card)] p-4">
        <h4 className="mb-4 text-sm font-medium text-slate-300">{entityName}</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {data.map((point, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2"
            >
              <span className="text-sm text-slate-300 capitalize">{point.raw}</span>
              <span className="text-xs text-slate-500">{point.time}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-[var(--bg-card)] p-4">
      <h4 className="mb-4 text-sm font-medium text-slate-300">{entityName}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="time"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1e293b', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
