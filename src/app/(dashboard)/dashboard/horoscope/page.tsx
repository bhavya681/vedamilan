"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline } from "@/components/ui/vedic";
import { PageHeader } from "@/components/layout/page-shell";
import { mockDasha, mockDoshas, mockPlanets, mockYogas, mockTransits } from "@/lib/mock/vedamilan";
import {
  NorthIndianKundli,
  SouthIndianKundli,
  EastIndianKundli,
} from "@/features/horoscope/components/kundli-charts";

export default function HoroscopePage() {
  const [style, setStyle] = useState<"north" | "south" | "east">("north");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vedic"
        title="Horoscope studio"
        description="Interactive kundli styles with realistic planetary mock data."
        actions={
          <Button type="button" variant="outline">
            <Download className="h-4 w-4" />
            Download report
          </Button>
        }
      />

      <Tabs defaultValue="chart">
        <TabsList>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="planets">Planets</TabsTrigger>
          <TabsTrigger value="yogas">Yogas & doshas</TabsTrigger>
          <TabsTrigger value="dasha">Dasha</TabsTrigger>
          <TabsTrigger value="transits">Transits</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["north", "North Indian"],
                ["south", "South Indian"],
                ["east", "East Indian"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={style === key ? "default" : "outline"}
                onClick={() => setStyle(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          <Card className="glass-panel">
            <CardContent className="flex justify-center p-6">
              {style === "north" ? <NorthIndianKundli /> : null}
              {style === "south" ? <SouthIndianKundli /> : null}
              {style === "east" ? <EastIndianKundli /> : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planets">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mockPlanets.map((planet) => (
              <Card key={planet.name} className="glass-panel">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-xl">{planet.name}</CardTitle>
                  <CardDescription>
                    {planet.sign} · House {planet.house}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm">
                  <span>{planet.degree}</span>
                  <Badge variant="secondary">{planet.dignity}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="yogas" className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Yogas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockYogas.map((yoga) => (
                <div key={yoga.name} className="border-border/60 rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{yoga.name}</p>
                    <Badge>{yoga.strength}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">{yoga.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Doshas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockDoshas.map((dosha) => (
                <div key={dosha.name} className="border-border/60 rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{dosha.name}</p>
                    <Badge variant={dosha.status === "Absent" ? "secondary" : "destructive"}>
                      {dosha.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">{dosha.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dasha">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Vimshottari timeline</CardTitle>
              <CardDescription>Mahadasha sequence with active emphasis</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline
                items={mockDasha.map((d) => ({
                  title: d.planet,
                  subtitle: d.theme,
                  meta: `${d.start} → ${d.end}`,
                  active: d.active,
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transits">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Current transits</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {mockTransits.map((item) => (
                <div key={item.planet + item.date} className="bg-muted/50 rounded-xl p-4 text-sm">
                  <p className="font-medium">
                    {item.planet}: {item.from} → {item.to}
                  </p>
                  <p className="text-muted-foreground mt-1">{item.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
