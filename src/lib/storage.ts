import { getCloudflareContext } from "@opennextjs/cloudflare";

type StorageEnv = {
  STORAGE?: {
    put: (
      key: string,
      value: ArrayBuffer,
      options: { httpMetadata: { contentType: string } },
    ) => Promise<void>;
  };
};

export async function uploadFileToStorage(file: File, prefix: string) {
  let env: StorageEnv | undefined;

  try {
    const ctx = getCloudflareContext();
    env = ctx.env as unknown as StorageEnv;
  } catch {
    env = undefined;
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${prefix}/${Date.now()}-${safeName}`;

  if (env && env.STORAGE) {
    const arrayBuffer = await file.arrayBuffer();
    await env.STORAGE.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    return {
      key,
      url: `/api/assets/${encodeURIComponent(key)}`,
    };
  }

  return {
    key,
    url: `/mock-upload-${safeName}`,
  };
}
