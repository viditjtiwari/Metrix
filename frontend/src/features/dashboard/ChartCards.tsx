"use client";

import React from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";

export const CHART_PALETTE = [
  "#10b981", "#3b82f6", "#6366f1", "#f59e0b",
  "#ec4899", "#8b5cf6", "#06b6d4", "#14b8a6", "#f97316"
];

interface BarCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  data: { name: string; value: number }[];
  barColor?: string;
  barName?: string;
}

export const DynamicBarCard: React.FC<BarCardProps> = ({
  title, subtitle, icon, data, barColor = "#10b981", barName = "Count"
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-slate-50 text-slate-700">{icon}</div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Total: {data.reduce((a, b) => a + b.value, 0)}</span>
      </div>

      <div className="h-60 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "11px", border: "none" }} />
              <Bar dataKey="value" name={barName} fill={barColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

interface DonutCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  data: { name: string; value: number; color?: string }[];
}

export const DynamicDonutCard: React.FC<DonutCardProps> = ({
  title, subtitle, icon, data
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3">
        <div className="p-1.5 rounded-lg bg-slate-50 text-slate-700">{icon}</div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
      </div>

      <div className="h-56 w-full flex flex-col items-center justify-center">
        {total === 0 ? (
          <div className="text-xs text-slate-400">No data recorded yet</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={72} paddingAngle={4} dataKey="value">
                  {data.map((item, idx) => (
                    <Cell key={`cell-${idx}`} fill={item.color || CHART_PALETTE[idx % CHART_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "11px", border: "none" }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-2 flex flex-wrap justify-center gap-1.5 max-h-16 overflow-y-auto w-full">
              {data.map((item, idx) => (
                <span key={item.name} className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color || CHART_PALETTE[idx % CHART_PALETTE.length] }} />
                  {item.name}: <strong className="text-slate-800">{item.value}</strong>
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
