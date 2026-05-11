"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";

function formatCurrency(value: number) {
  return `\u20B9${value.toFixed(2)}`;
}

function groupByMonth(bills: any[]) {
  const grouped: Record<string, { totalAmount: number; totalPaid: number }> = {};

  for (const bill of bills) {
    const monthKey = bill.dateStart ? bill.dateStart.substring(0, 7) : "unknown";
    if (!grouped[monthKey]) {
      grouped[monthKey] = { totalAmount: 0, totalPaid: 0 };
    }
    grouped[monthKey].totalAmount += Number(bill.totalAmount) || 0;
    grouped[monthKey].totalPaid += Number(bill.totalPaid) || 0;
  }

  return Object.entries(grouped)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-lg text-sm">
      <p className="font-semibold text-slate-900 mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

const COLORS = {
  indigo: "#6366f1",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
};

export function DashboardCharts({ bills, tenantCount }: { bills: any[]; tenantCount: number }) {
  const monthlyData = groupByMonth(bills);

  const paidCount = bills.filter((b) => b.isPaid === true).length;
  const unpaidCount = bills.filter((b) => b.isPaid === false).length;
  const partialCount = bills.filter(
    (b) => b.isPaid === false && Number(b.totalPaid) > 0 && Number(b.totalPaid) < Number(b.totalAmount),
  ).length;

  const statusData = [
    { name: "Paid", value: paidCount, color: COLORS.emerald },
    {
      name: "Partial",
      value: Math.max(0, partialCount),
      color: COLORS.amber,
    },
    {
      name: "Unpaid",
      value: Math.max(0, unpaidCount - partialCount),
      color: COLORS.red,
    },
  ].filter((d) => d.value > 0);

  const collectionRateData = monthlyData.map((d) => ({
    month: d.month,
    rate: d.totalAmount > 0 ? Number(((d.totalPaid / d.totalAmount) * 100).toFixed(1)) : 0,
  }));

  const categoryData = (() => {
    const rent = bills.reduce((sum, b) => sum + (Number(b.rentAmount) || 0), 0);
    const water = bills.reduce((sum, b) => sum + (Number(b.waterAmount) || 0), 0);
    const electricity = bills.reduce((sum, b) => sum + (Number(b.electricityAmount) || 0), 0);
    return [
      { name: "Rent", amount: rent, color: COLORS.indigo },
      { name: "Water", amount: water, color: COLORS.emerald },
      { name: "Electricity", amount: electricity, color: COLORS.amber },
    ];
  })();

  const topTenantsData = (() => {
    const grouped: Record<string, number> = {};
    for (const bill of bills) {
      const key = bill.tenantName || `Tenant #${bill.tenantId}`;
      grouped[key] = (grouped[key] || 0) + (Number(bill.totalAmount) || 0);
    }
    return Object.entries(grouped)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  })();

  const totalBills = bills.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Analytics and insights for your rental properties.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Overview</h3>
          {monthlyData.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No revenue data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalAmount" name="Total Amount" fill={COLORS.indigo} radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalPaid" name="Total Paid" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Status</h3>
          {statusData.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No bills yet.</p>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{totalBills}</p>
                  <p className="text-xs text-slate-500">Total Bills</p>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-600">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collection Rate Trend - Full Width */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Collection Rate</h3>
        {collectionRateData.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">No collection data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={collectionRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  return (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-lg text-sm">
                      <p className="font-semibold text-slate-900 mb-1">{label}</p>
                      <p className="font-medium text-indigo-600">Collection: {payload[0].value}%</p>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={100}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: "Target",
                  position: "right",
                  fill: "#10b981",
                  fontSize: 12,
                }}
              />
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="rate"
                stroke={COLORS.indigo}
                strokeWidth={2}
                fill="url(#colorRate)"
                dot={{ fill: COLORS.indigo, r: 4 }}
                activeDot={{ r: 6, fill: COLORS.indigo }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={COLORS.indigo}
                strokeWidth={2}
                dot={{ fill: COLORS.indigo, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Breakdown</h3>
          {categoryData.every((d) => d.amount === 0) ? (
            <p className="text-slate-400 text-sm py-8 text-center">No revenue data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 13, fill: "#334155" }}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const val = typeof payload[0].value === "number" ? payload[0].value : 0;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-lg text-sm">
                        <p className="font-semibold text-slate-900 mb-1">{label}</p>
                        <p className="font-medium" style={{ color: payload[0].color }}>
                          {formatCurrency(val)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Tenants by Total Due */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top Tenants by Total Due</h3>
          {topTenantsData.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No tenant data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTenantsData} layout="vertical" margin={{ left: 10, right: 40, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#334155" }}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const val = typeof payload[0].value === "number" ? payload[0].value : 0;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-lg text-sm">
                        <p className="font-semibold text-slate-900 mb-1">{label}</p>
                        <p className="font-medium text-indigo-600">Total Due: {formatCurrency(val)}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="total" name="Total Due" fill={COLORS.indigo} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
