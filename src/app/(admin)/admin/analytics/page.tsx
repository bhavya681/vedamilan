"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { day: "Mon", signups: 420, paid: 38 },
  { day: "Tue", signups: 510, paid: 44 },
  { day: "Wed", signups: 480, paid: 41 },
  { day: "Thu", signups: 560, paid: 52 },
  { day: "Fri", signups: 610, paid: 57 },
  { day: "Sat", signups: 700, paid: 63 },
  { day: "Sun", signups: 640, paid: 59 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Weekly acquisition</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="signups" fill="#D61F69" radius={6} />
              <Bar dataKey="paid" fill="#D4AF37" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
