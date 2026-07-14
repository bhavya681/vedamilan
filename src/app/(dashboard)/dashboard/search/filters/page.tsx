"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routes } from "@/lib/constants/routes";

export default function FiltersPage() {
  const router = useRouter();
  const [minAge, setMinAge] = useState("21");
  const [maxAge, setMaxAge] = useState("40");
  const [minHeightCm, setMinHeightCm] = useState("");
  const [maxHeightCm, setMaxHeightCm] = useState("");
  const [city, setCity] = useState("all");
  const [education, setEducation] = useState("");
  const [manglik, setManglik] = useState("ANY");
  const [religion, setReligion] = useState("");

  function apply(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (minAge) params.set("minAge", minAge);
    if (maxAge) params.set("maxAge", maxAge);
    if (minHeightCm) params.set("minHeightCm", minHeightCm);
    if (maxHeightCm) params.set("maxHeightCm", maxHeightCm);
    if (city && city !== "all") params.set("city", city);
    if (education.trim()) params.set("education", education.trim());
    if (manglik && manglik !== "ANY") params.set("manglik", manglik);
    if (religion.trim()) params.set("religion", religion.trim());
    router.push(`${routes.search}?${params.toString()}`);
  }

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="Advanced Filters"
        description="Precision discovery controls"
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.search}>Back to search</Link>
          </Button>
        }
      />

      <GlassCard>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={apply}>
          <div>
            <Label htmlFor="minAge">Age range (min)</Label>
            <Input
              id="minAge"
              className="mt-1"
              type="number"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="maxAge">Age range (max)</Label>
            <Input
              id="maxAge"
              className="mt-1"
              type="number"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="minHeight">Height min (cm)</Label>
            <Input
              id="minHeight"
              className="mt-1"
              type="number"
              value={minHeightCm}
              onChange={(e) => setMinHeightCm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="maxHeight">Height max (cm)</Label>
            <Input
              id="maxHeight"
              className="mt-1"
              type="number"
              value={maxHeightCm}
              onChange={(e) => setMaxHeightCm(e.target.value)}
            />
          </div>
          <div>
            <Label>City</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Chennai">Chennai</SelectItem>
                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              className="mt-1"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. IIT"
            />
          </div>
          <div>
            <Label>Manglik</Label>
            <Select value={manglik} onValueChange={setManglik}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Manglik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">Any</SelectItem>
                <SelectItem value="NON_MANGLIK">Non-Manglik</SelectItem>
                <SelectItem value="MANGLIK">Manglik</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="religion">Religion</Label>
            <Input
              id="religion"
              className="mt-1"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              placeholder="e.g. Hindu"
            />
          </div>
          <Button type="submit" className="md:col-span-2">
            Apply filters
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
