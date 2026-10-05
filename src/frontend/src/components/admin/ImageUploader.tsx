import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  loadConfig,
  useInternetIdentity,
} from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import { ImagePlus, Loader2 } from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";

interface ImageUploaderProps {
  /** Product name, used for the accessible label and the stored filename. */
  productName: string;
  /** Called with the object-storage key once the upload succeeds. */
  onUploaded: (imageKey: string) => void;
  /** Called when the upload fails, with a human-readable message. */
  onError: (message: string) => void;
  /** Disable the control while another save is in flight. */
  disabled?: boolean;
}

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,image/gif";

/**
 * Per-product photo replacement control.
 *
 * Uploads the chosen file to platform object storage with visible progress and
 * hands the returned storage key back to the caller, which persists it through
 * `useSetProductImage`. Image bytes never touch canister state.
 */
export function ImageUploader({
  productName,
  onUploaded,
  onError,
  disabled = false,
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { identity } = useInternetIdentity();
  const [progress, setProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset the input so choosing the same file again still fires a change.
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("Please choose an image file (PNG, JPG, WEBP, or GIF).");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    try {
      const config = await loadConfig();
      const agent = new HttpAgent({
        identity,
        host: config.backend_host,
      });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => undefined);
      }

      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );

      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(
        bytes,
        (percentage) => setProgress(percentage),
        file.type,
        file.name,
      );

      onUploaded(hash);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed. Please retry.";
      onError(message);
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES}
        className="sr-only"
        onChange={handleFile}
        disabled={disabled || isUploading}
        data-ocid="admin.image_input"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
        data-ocid="admin.upload_button"
        className="rounded-full"
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ImagePlus className="size-4" aria-hidden="true" />
        )}
        {isUploading ? "Uploading…" : "Replace photo"}
      </Button>
      <span className="sr-only" aria-live="polite">
        {isUploading
          ? `Uploading a new photo for ${productName}`
          : "No upload in progress"}
      </span>
      {progress != null ? (
        <div
          className="flex items-center gap-2"
          data-ocid="admin.upload_progress"
        >
          <Progress
            value={progress}
            aria-label={`Upload progress for ${productName}`}
            className="h-1.5"
          />
          <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      ) : null}
    </div>
  );
}
