/** Auth fields accepted by `issueSignedToken`, `del`, etc. (`BlobCommandOptions` is not public-exported). */
export type BlobAuthOptions = {
  token?: string;
  oidcToken?: string;
  storeId?: string;
};

/** Vercel may inject `ME_BLOB_*` from the store link; manual copies use `BLOB_*`. */
export function getBlobStoreId(): string | undefined {
  return process.env.BLOB_STORE_ID ?? process.env.ME_BLOB_STORE_ID;
}

export function getBlobWebhookPublicKey(): string | undefined {
  return (
    process.env.BLOB_WEBHOOK_PUBLIC_KEY ??
    process.env.ME_BLOB_WEBHOOK_PUBLIC_KEY
  );
}

export function getBlobCommandOptions(): BlobAuthOptions {
  const readWrite = process.env.BLOB_READ_WRITE_TOKEN;
  if (readWrite) {
    return { token: readWrite };
  }

  const storeId = getBlobStoreId();
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;
  if (storeId && oidcToken) {
    return { storeId, oidcToken };
  }

  if (storeId) {
    return { storeId };
  }

  return {};
}

export function getBlobEnvDiagnostics() {
  return {
    vercelEnv: process.env.VERCEL_ENV ?? "unknown",
    hasBlobStoreId: Boolean(process.env.BLOB_STORE_ID),
    hasMeBlobStoreId: Boolean(process.env.ME_BLOB_STORE_ID),
    hasResolvedStoreId: Boolean(getBlobStoreId()),
    hasOidc: Boolean(process.env.VERCEL_OIDC_TOKEN),
    hasReadWriteToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    hasWebhookKey: Boolean(getBlobWebhookPublicKey()),
  };
}
