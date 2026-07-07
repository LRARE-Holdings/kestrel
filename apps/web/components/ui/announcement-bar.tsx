import { createClient } from "@kestrel/shared/supabase/server";
import { getAnnouncementSettings } from "@kestrel/shared/supabase/site-settings";

const styleMap = {
  info: "bg-kestrel text-white",
  warning: "bg-warning text-white",
  success: "bg-sage text-white",
} as const;

export async function AnnouncementBar() {
  // Fail closed (render nothing) if the announcement settings cannot be read —
  // e.g. when the Supabase environment is not configured. This keeps the shared
  // layout rendering rather than returning a 500 for the whole site.
  let announcement: Awaited<ReturnType<typeof getAnnouncementSettings>>;
  try {
    const supabase = await createClient();
    announcement = await getAnnouncementSettings(supabase);
  } catch {
    return null;
  }

  if (!announcement.enabled || !announcement.text) return null;

  const colors = styleMap[announcement.style] ?? styleMap.info;

  const inner = (
    <p className="text-sm font-medium text-center py-2.5 px-4 truncate">
      {announcement.text}
      {announcement.link && (
        <span className="ml-2 opacity-75">&rarr;</span>
      )}
    </p>
  );

  if (announcement.link) {
    return (
      <a
        href={announcement.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full ${colors} hover:opacity-90 transition-opacity`}
      >
        {inner}
      </a>
    );
  }

  return <div className={`w-full ${colors}`}>{inner}</div>;
}
