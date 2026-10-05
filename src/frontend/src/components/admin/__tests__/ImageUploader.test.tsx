import { ImageUploader } from "@/components/admin/ImageUploader";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** The file input is visually hidden and has no label; reach it by type. */
function fileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("file input not found");
  return input;
}

/**
 * Set a file on a hidden input and fire `change`. `userEvent.upload` skips
 * `sr-only` inputs, so drive the DOM event directly.
 */
function chooseFile(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [file],
  });
  fireEvent.change(input);
}

/**
 * The uploader talks to platform object storage. `StorageClient` is mocked at
 * the module seam so the test can drive progress callbacks and assert the
 * observable upload feedback without any network access.
 */

const putFile = vi.fn();

vi.mock("@caffeineai/object-storage", () => ({
  StorageClient: class {
    putFile = putFile;
  },
}));

// The uploader builds a real HttpAgent before uploading. Mock it so the test
// never touches the network or the local replica root key.
vi.mock("@icp-sdk/core/agent", () => ({
  HttpAgent: class {
    fetchRootKey = vi.fn(async () => undefined);
  },
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  loadConfig: vi.fn(async () => ({
    backend_host: "https://icp-api.io",
    backend_canister_id: "aaaaa-aa",
    storage_gateway_url: "https://storage.example",
    bucket_name: "bucket",
    project_id: "project",
  })),
  useInternetIdentity: () => ({
    isAuthenticated: true,
    identity: undefined,
    login: vi.fn(),
    clear: vi.fn(),
    isLoggingIn: false,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function imageFile(name = "photo.png") {
  const file = new File([new Uint8Array([1, 2, 3])], name, {
    type: "image/png",
  });
  // jsdom's File does not implement `arrayBuffer`, which the uploader awaits.
  Object.defineProperty(file, "arrayBuffer", {
    configurable: true,
    value: async () => new Uint8Array([1, 2, 3]).buffer,
  });
  return file;
}

describe("ImageUploader", () => {
  it("uploads a chosen image and reports the returned storage key", async () => {
    const onUploaded = vi.fn();
    const onError = vi.fn();
    putFile.mockImplementation(
      async (_bytes: Uint8Array, onProgress?: (percentage: number) => void) => {
        onProgress?.(50);
        onProgress?.(100);
        return { hash: "uploaded-key.png" };
      },
    );

    const { container } = render(
      <ImageUploader
        productName="Marigold Gajra"
        onUploaded={onUploaded}
        onError={onError}
      />,
    );

    chooseFile(fileInput(container), imageFile());

    await waitFor(() => {
      expect(onUploaded).toHaveBeenCalledWith("uploaded-key.png");
    });
    expect(onError).not.toHaveBeenCalled();
    expect(putFile).toHaveBeenCalledTimes(1);
  });

  it("shows progress feedback while the upload is in flight", async () => {
    let release: (() => void) | undefined;
    putFile.mockImplementation(
      async (_bytes: Uint8Array, onProgress?: (percentage: number) => void) => {
        onProgress?.(42);
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        return { hash: "uploaded-key.png" };
      },
    );

    const { container } = render(
      <ImageUploader
        productName="Marigold Gajra"
        onUploaded={vi.fn()}
        onError={vi.fn()}
      />,
    );

    chooseFile(fileInput(container), imageFile());

    // The progress bar and its percentage are visible during the upload.
    expect(await screen.findByText("42%")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", {
        name: "Upload progress for Marigold Gajra",
      }),
    ).toBeInTheDocument();

    release?.();
    await waitFor(() => {
      expect(screen.queryByText("42%")).toBeNull();
    });
  });

  it("rejects a non-image file without uploading", async () => {
    const onUploaded = vi.fn();
    const onError = vi.fn();

    const { container } = render(
      <ImageUploader
        productName="Marigold Gajra"
        onUploaded={onUploaded}
        onError={onError}
      />,
    );

    // The component's own type check rejects the file, not the input's
    // `accept` filter.
    chooseFile(
      fileInput(container),
      new File(["not an image"], "notes.txt", { type: "text/plain" }),
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        "Please choose an image file (PNG, JPG, WEBP, or GIF).",
      );
    });
    expect(putFile).not.toHaveBeenCalled();
    expect(onUploaded).not.toHaveBeenCalled();
  });
});
