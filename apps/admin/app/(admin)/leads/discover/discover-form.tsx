"use client";

import { useActionState, useState, useTransition } from "react";
import {
  searchGooglePlaces,
  addPlaceAsLead,
  type PlaceResult,
} from "@/lib/leads/discover-actions";

const RADIUS_OPTIONS = [
  { label: "5 km", value: "5000" },
  { label: "10 km", value: "10000" },
  { label: "25 km", value: "25000" },
  { label: "50 km", value: "50000" },
];

export function DiscoverForm() {
  const [state, searchAction, isSearching] = useActionState(
    searchGooglePlaces,
    null,
  );
  const [addedPlaces, setAddedPlaces] = useState<Set<string>>(new Set());
  const [addingPlace, setAddingPlace] = useState<string | null>(null);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  async function handleAdd(place: PlaceResult) {
    setAddingPlace(place.place_id);
    setAddErrors((prev) => {
      const next = { ...prev };
      delete next[place.place_id];
      return next;
    });

    const formData = new FormData();
    formData.set("name", place.name);
    formData.set("company", place.name);
    formData.set("phone", place.phone ?? "");
    formData.set("website", place.website ?? "");
    formData.set("address", place.address);
    formData.set("place_id", place.place_id);

    startTransition(async () => {
      const result = await addPlaceAsLead(formData);
      if (result.success) {
        setAddedPlaces((prev) => new Set([...prev, place.place_id]));
      } else if (result.error) {
        setAddErrors((prev) => ({
          ...prev,
          [place.place_id]: result.error!,
        }));
      }
      setAddingPlace(null);
    });
  }

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form
        action={searchAction}
        className="bg-surface rounded-xl border border-border p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-1">
            <label
              htmlFor="query"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Business type
            </label>
            <input
              id="query"
              name="query"
              type="text"
              placeholder="e.g. construction company"
              required
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
            />
          </div>
          <div className="sm:col-span-1">
            <label
              htmlFor="location"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="e.g. Newcastle upon Tyne"
              required
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
            />
          </div>
          <div className="sm:col-span-1">
            <label
              htmlFor="radius"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Radius
            </label>
            <select
              id="radius"
              name="radius"
              defaultValue="10000"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
            >
              {RADIUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-kestrel rounded-lg hover:bg-kestrel-hover transition-colors disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {state?.error && (
        <div className="rounded-lg bg-error/5 border border-error/20 px-4 py-3 text-sm text-error">
          {state.error}
        </div>
      )}

      {/* Results */}
      {state?.results && state.results.length === 0 && (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <p className="text-text-muted text-sm">
            No businesses found. Try a different search query or location.
          </p>
        </div>
      )}

      {state?.results && state.results.length > 0 && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-stone/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Reviews
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {state.results.map((place) => {
                  const isAdded = addedPlaces.has(place.place_id);
                  const isAdding = addingPlace === place.place_id;
                  const addError = addErrors[place.place_id];

                  return (
                    <tr
                      key={place.place_id}
                      className="hover:bg-cream/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-ink">
                        {place.name}
                      </td>
                      <td className="px-4 py-3 text-text-secondary max-w-xs truncate">
                        {place.address}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {place.phone ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {place.website ? (
                          <a
                            href={place.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-kestrel hover:underline truncate block max-w-[160px]"
                          >
                            {place.website.replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {place.rating !== null ? (
                          <span>
                            {place.rating.toFixed(1)}{" "}
                            <span className="text-warning">&#9733;</span>
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {place.review_count > 0
                          ? place.review_count.toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isAdded ? (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-sage bg-sage/10 rounded-lg">
                            Added
                          </span>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleAdd(place)}
                              disabled={isAdding || isPending}
                              className="px-3 py-1 text-xs font-medium text-white bg-sage rounded-lg hover:bg-sage/80 transition-colors disabled:opacity-50"
                            >
                              {isAdding ? "Adding..." : "Add"}
                            </button>
                            {addError && (
                              <span className="text-[10px] text-error max-w-[140px] text-right">
                                {addError}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
