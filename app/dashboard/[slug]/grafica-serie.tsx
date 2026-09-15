"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { PuntoSerie } from "@/lib/eventos";

export function GraficaSerie({ datos }: { datos: PuntoSerie[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={datos} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid stroke="#1e2a40" strokeDasharray="3 3" />
        <XAxis
          dataKey="fecha"
          stroke="#8fa1bd"
          tick={{ fontSize: 12 }}
          tickFormatter={(fecha: string) => fecha.slice(5)}
        />
        <YAxis stroke="#8fa1bd" tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#121c2e",
            border: "1px solid #2e8b77",
            borderRadius: 8,
            color: "#e7ecf3"
          }}
          labelStyle={{ color: "#d9a441" }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#2e8b77"
          strokeWidth={2}
          dot={{ r: 3, fill: "#d9a441", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
