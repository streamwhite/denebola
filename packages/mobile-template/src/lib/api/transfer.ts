export type UploadFile = { uri: string; name: string; type: string };

export type UploadProgress = { loaded: number; total: number; ratio: number };

export function toFormData(fields: Record<string, string>, files: Record<string, UploadFile | UploadFile[]>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  for (const [key, value] of Object.entries(files)) {
    for (const file of Array.isArray(value) ? value : [value]) {
      // React Native's FormData accepts the { uri, name, type } file shape.
      form.append(key, file as unknown as Blob);
    }
  }
  return form;
}

export function uploadRatio(loaded: number, total: number): UploadProgress {
  return { loaded, total, ratio: total > 0 ? Math.min(1, loaded / total) : 0 };
}

// fetch does not expose upload progress; XHR does. This wraps XHR behind the same auth/abort contract.
export function uploadWithProgress(options: {
  url: string;
  method?: "POST" | "PUT" | "PATCH";
  form: FormData;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onProgress?: (progress: UploadProgress) => void;
}): Promise<{ status: number; responseText: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method ?? "POST", options.url);
    for (const [key, value] of Object.entries(options.headers ?? {})) xhr.setRequestHeader(key, value);
    xhr.upload.onprogress = (event) => options.onProgress?.(uploadRatio(event.loaded, event.total || 0));
    xhr.onload = () => resolve({ status: xhr.status, responseText: xhr.responseText });
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onabort = () => reject(new Error("Upload aborted"));
    options.signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(options.form);
  });
}

export function downloadBlob(url: string, signal?: AbortSignal): Promise<Blob> {
  return fetch(url, { signal }).then((response) => {
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    return response.blob();
  });
}
