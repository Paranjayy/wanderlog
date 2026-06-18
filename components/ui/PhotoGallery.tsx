"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface PhotoGalleryProps {
  placeId?: Id<"places">;
  tripId?: Id<"trips">;
  userId: Id<"users">;
}

export function PhotoGallery({ placeId, tripId, userId }: PhotoGalleryProps) {
  const photos = placeId
    ? useQuery(api.photos.getByPlace, { placeId })
    : useQuery(api.photos.getByUser, { userId });

  const createPhoto = useMutation(api.photos.create);
  const deletePhoto = useMutation(api.photos.remove);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = URL.createObjectURL(file);

      await createPhoto({
        userId,
        placeId,
        tripId,
        url,
        caption: file.name,
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Photos</h3>
        <label className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">
          {uploading ? "Uploading..." : "Add Photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {(!photos || photos.length === 0) && (
        <p className="text-sm text-gray-500">No photos yet. Add one!</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {photos?.map((photo) => (
          <div
            key={photo._id}
            className="group relative cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setSelectedPhoto(photo.url)}
          >
            <img
              src={photo.url}
              alt={photo.caption || "Photo"}
              className="aspect-square w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePhoto({ photoId: photo._id });
                }}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-4 top-4 text-4xl text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
