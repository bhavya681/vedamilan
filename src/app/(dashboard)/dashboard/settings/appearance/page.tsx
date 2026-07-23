import { AppearanceSettingsPanel } from "@/features/appearance/appearance-settings";

export const metadata = { title: "Appearance" };

export default function AppearanceSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <AppearanceSettingsPanel />
    </div>
  );
}
