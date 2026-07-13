"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-2">Profile and privacy preferences (UI mock).</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" defaultValue="Aryan Mehta" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              defaultValue="Seeking a thoughtful partnership rooted in shared values."
            />
          </div>
          <Button type="button">Save changes</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Control what others can see</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ["Show online status", true],
            ["Allow AI matching", true],
            ["Show horoscope to connections only", true],
          ].map(([label, checked]) => (
            <div key={String(label)} className="flex items-center justify-between gap-3">
              <Label>{label}</Label>
              <Switch defaultChecked={Boolean(checked)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
