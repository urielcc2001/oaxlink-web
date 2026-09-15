"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { PuntoSerie } from "@/lib/eventos";

const NOMBRES: Record<string, string> = {
  scans: "Escaneos",
  google: "Google",
  wa: "WhatsApp"
};

export function GraficaSerie({ datos }: { datos: PuntoSerie[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={datos} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid stroke="#1e2a40" strokeDasharray="3 3" />
        <XAxis
          dataKey="fecha"
          stroke="#8b93a7"
          tick={{ fontSize: 12 }}
          tickFormatter={(fecha: string) => fecha.slice(5)}
        />
        <YAxis stroke="#8b93a7" tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#121c2e",
            border: "1px solid #2e8b77",
            borderRadius: 8,
            color: "#e7e9ee"
          }}
          labelStyle={{ color: "#d9a441" }}
        />
        <Legend
          verticalAlign="top"
          align="left"
          height={36}
          iconType="line"
          formatter={(value: string) => (
            <span style={{ color: "#8b93a7", fontSize: 12 }}>{NOMBRES[value] ?? value}</span>
          )}
        />
        <Line
          type="monotone"
          dataKey="scans"
          name="scans"
          stroke="#d9a441"
          strokeWidth={2}
          dot={{ r: 3, fill: "#d9a441", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="google"
          name="google"
          stroke="#2e8b77"
          strokeWidth={2}
          dot={{ r: 3, fill: "#2e8b77", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="wa"
          name="wa"
          stroke="#6c8ef5"
          strokeWidth={2}
          dot={{ r: 3, fill: "#6c8ef5", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
