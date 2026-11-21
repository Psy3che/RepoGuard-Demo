"use client"

import { useMemo } from "react"
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClothingItem } from "@/lib/wardrobe-data"
import { categories } from "@/lib/wardrobe-data"
import { TrendingUp, TrendingDown } from "lucide-react"

interface WardrobeAnalyticsProps {
  items: ClothingItem[]
}

const CHART_COLORS = ["#2563eb","#dc2626","#16a34a","#ca8a04","#9333ea","#ea580c","#0891b2","#be185d"]

const COLOR_HEX: Record<string, string> = {
  "黑色":"#1a1a1a","白色":"#e5e5e5","灰色":"#6b7280","米色":"#d4c5a9",
  "棕色":"#92400e","卡其色":"#a3a38c","红色":"#dc2626","粉色":"#f472b6",
  "橙色":"#f97316","黄色":"#eab308","蓝色":"#2563eb","藏青色":"#1e3a5f",
  "绿色":"#16a34a","军绿色":"#4d7c0f",
}

const SEASON_COLOR: Record<string, string> = {
  "春":"#22c55e","夏":"#f59e0b","秋":"#f97316","冬":"#3b82f6","全年":"#8b5cf6",
}

// 自定义 Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-sm">
      {label && <p className="font-medium text-foreground mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }} className="text-xs">
          {p.name || p.dataKey}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// 饼图自定义 label
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  if (percent < 0.06) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function WardrobeAnalytics({ items }: WardrobeAnalyticsProps) {
  // 分类分布
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    items.forEach(item => {
      const label = categories.find(c => c.id === item.category)?.label || item.category
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [items])

  // 颜色分布
  const colorData = useMemo(() => {
    const counts: Record<string, number> = {}
    items.forEach(item => { counts[item.color] = (counts[item.color] || 0) + 1 })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, fill: COLOR_HEX[name] || "#9ca3af" }))
      .sort((a, b) => b.value - a.value)
  }, [items])

  // 品牌分布（前8）
  const brandData = useMemo(() => {
    const counts: Record<string, number> = {}
    items.forEach(item => { if (item.brand && item.brand !== "未设置") counts[item.brand] = (counts[item.brand] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8)
  }, [items])

  // 季节分布
  const seasonData = useMemo(() => {
    const counts: Record<string, number> = {}
    items.forEach(item => item.season.forEach(s => { counts[s] = (counts[s] || 0) + 1 }))
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, fill: SEASON_COLOR[name] || "#9ca3af" }))
      .sort((a, b) => b.value - a.value)
  }, [items])

  // 穿着频率分布
  const wearFreqData = useMemo(() => [
    { name: "0次",    value: items.filter(i => i.wearCount === 0).length,              fill: "#ef4444" },
    { name: "1-5次",  value: items.filter(i => i.wearCount >= 1  && i.wearCount <= 5).length,  fill: "#f97316" },
    { name: "6-10次", value: items.filter(i => i.wearCount >= 6  && i.wearCount <= 10).length, fill: "#eab308" },
    { name: "11-20次",value: items.filter(i => i.wearCount >= 11 && i.wearCount <= 20).length, fill: "#22c55e" },
    { name: "20次+",  value: items.filter(i => i.wearCount > 20).length,               fill: "#2563eb" },
  ], [items])

  // 排行榜
  const mostWorn  = useMemo(() => [...items].sort((a, b) => b.wearCount - a.wearCount).slice(0, 5), [items])
  const neverWorn = useMemo(() =>
    [...items].filter(i => i.wearCount === 0)
      .sort((a, b) => new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime())
      .slice(0, 5),
    [items]
  )

  // 概览统计
  const totalWears   = useMemo(() => items.reduce((s, i) => s + i.wearCount, 0), [items])
  const avgWears     = items.length ? (totalWears / items.length).toFixed(1) : "0"
  const neverWornPct = items.length ? Math.round(items.filter(i => i.wearCount === 0).length / items.length * 100) : 0

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">添加一些衣物后查看衣柜分析</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 概览卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "衣物总数", value: items.length, unit: "件" },
          { label: "总穿着次数", value: totalWears, unit: "次" },
          { label: "平均穿着", value: avgWears, unit: "次/件" },
          { label: "从未穿过", value: `${neverWornPct}%`, unit: "的衣物" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.unit}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 分类 & 颜色饼图 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">分类分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={2} dataKey="value" labelLine={false} label={renderPieLabel}>
                  {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
              {categoryData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">颜色分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={colorData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={2} dataKey="value" labelLine={false} label={renderPieLabel}>
                  {colorData.map((d, i) => <Cell key={i} fill={d.fill} stroke="#fff" strokeWidth={1} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
              {colorData.slice(0, 8).map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full border border-border/50" style={{ backgroundColor: d.fill }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 品牌 & 季节条形图 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">品牌分布</CardTitle>
          </CardHeader>
          <CardContent>
            {brandData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={brandData} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="件数" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center">
                <p className="text-sm text-muted-foreground">暂无品牌数据</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">季节分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={seasonData} margin={{ top: 16, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="件数" radius={[4, 4, 0, 0]}>
                  {seasonData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 穿着频率分布 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">穿着频率分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={wearFreqData} margin={{ top: 16, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="件数" radius={[4, 4, 0, 0]}>
                {wearFreqData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 穿着排行榜 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              最常穿的衣物
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostWorn.filter(i => i.wearCount > 0).length > 0 ? (
              <div className="space-y-3">
                {mostWorn.filter(i => i.wearCount > 0).map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                      idx === 0 ? "bg-yellow-500" : idx === 1 ? "bg-gray-400" : idx === 2 ? "bg-amber-600" : "bg-primary"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">{item.wearCount}次</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">暂无穿着记录</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              从未穿过的衣物
            </CardTitle>
          </CardHeader>
          <CardContent>
            {neverWorn.length > 0 ? (
              <div className="space-y-3">
                {neverWorn.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(item.addedDate).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}入库
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm font-medium text-green-600">太棒了！</p>
                <p className="text-xs text-muted-foreground mt-1">所有衣物都穿过了</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
