"use client";

import { useActionState } from "react";
import { updateAnnouncementSettings } from "@/lib/admin/settings-actions";

interface Props {
  settings: Record<string, unknown>;
}

const STYLES = ["info", "warning", "success"] as const;

const STYLE_COLOURS: Record<string, { bg: string; text: string; border: string }> = {
  info: { bg: "bg-kestrel/10", text: "text-kestrel", border: "border-kestrel/20" },
  warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
  success: { bg: "bg-sage/10", text: "text-kestrel", border: "border-sage/30" },
};

export function AnnouncementTab({ settings }: Props) {
  const [state, formAction, isPending] = useActionState(updateAnnouncementSettings, null);

  const enabled = settings.announcement_enabled === true;
  const text = typeof settings.announcement_text === "string" ? settings.announcement_text : "";
  const link = typeof settings.announcement_link === "string" ? settings.announcement_link : "";
  const style = typeof settings.announcement_style === "string" ? settings.announcement_style : "info";

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <div className="bg-surface border border-border-subtle rounded-lg p-6 space-y-5">
        <h2 className="text-lg font-display font-semibold text-ink">
          Announcement Banner
        </h2>
        <p className="text-sm text-text-secondary">
          Display a site-wide announcement banner to all users.
        </p>

        {/* Enabled toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink">Enabled</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="enabled"
              value="true"
              defaultChecked={enabled}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-border rounded-full peer-checked:bg-kestrel peer-focus:ring-2 peer-focus:ring-kestrel/20 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <label htmlFor="announcement-text" className="block text-sm font-medium text-ink">
            Text
          </label>
          <div className="relative">
            <input
              id="announcement-text"
              type="text"
              name="text"
              defaultValue={text}
              maxLength={200}
              placeholder="e.g. We are currently in beta..."
              className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel transition-colors"
            />
            <CharCounter maxLength={200} defaultValue={text} />
          </div>
        </div>

        {/* Link */}
        <div className="space-y-1.5">
          <label htmlFor="announcement-link" className="block text-sm font-medium text-ink">
            Link <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            id="announcement-link"
            type="url"
            name="link"
            defaultValue={link}
            placeholder="https://..."
            className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel transition-colors"
          />
        </div>

        {/* Style selector */}
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-ink">Style</span>
          <StyleSelector defaultValue={style} />
        </div>

        {/* Live preview */}
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-text-secondary">Preview</span>
          <AnnouncementPreview defaultText={text} defaultStyle={style} />
        </div>
      </div>

      {/* Feedback + submit */}
      {state?.error && !state?.success && (
        <p className="text-sm text-error">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-kestrel">Announcement settings saved.</p>
      )}
      {/* Key the form to reset defaults when server data changes */}

      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 text-sm font-medium text-white bg-kestrel hover:bg-kestrel-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CharCounter({ maxLength, defaultValue }: { maxLength: number; defaultValue: string }) {
  return (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted tabular-nums pointer-events-none">
      {defaultValue.length}/{maxLength}
    </span>
  );
}

function StyleSelector({ defaultValue }: { defaultValue: string }) {
  return (
    <div className="flex gap-2">
      {STYLES.map((s) => (
        <label key={s} className="cursor-pointer">
          <input
            type="radio"
            name="style"
            value={s}
            defaultChecked={defaultValue === s}
            className="sr-only peer"
          />
          <span className="inline-block px-3 py-1.5 text-xs font-medium rounded-full border transition-colors peer-checked:bg-kestrel peer-checked:text-white peer-checked:border-kestrel border-border text-text-secondary hover:border-kestrel/40 capitalize">
            {s}
          </span>
        </label>
      ))}
    </div>
  );
}

function AnnouncementPreview({
  defaultText,
  defaultStyle,
}: {
  defaultText: string;
  defaultStyle: string;
}) {
  const colours = STYLE_COLOURS[defaultStyle] ?? STYLE_COLOURS.info;
  const previewText = defaultText || "Your announcement will appear here.";

  return (
    <div
      className={`px-4 py-2.5 text-sm rounded-lg border ${colours.bg} ${colours.text} ${colours.border}`}
    >
      {previewText}
    </div>
  );
}
