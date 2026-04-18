interface ShareParams {
  mot: string;
  slug: string;
  baseUrl?: string;
}

export function getShareUrl({ slug, baseUrl }: Pick<ShareParams, "slug" | "baseUrl">): string {
  const base = baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "https://nouchi.ci");
  return `${base}/mots/${slug}?utm_source=share&utm_medium=link`;
}

export function getWhatsAppShareUrl({ mot, slug, baseUrl }: ShareParams): string {
  const url = getShareUrl({ slug, baseUrl });
  const text = `Tu connais "${mot}" ? Découvres-le → ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getTwitterShareUrl({ mot, slug, baseUrl }: ShareParams): string {
  const url = getShareUrl({ slug, baseUrl });
  const text = `"${mot}" en Nouchi 🇨🇮 → ${url}`;
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export async function nativeShare({ mot, slug }: ShareParams): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  const url = getShareUrl({ slug });
  try {
    await navigator.share({
      title: `Tu connais "${mot}" en Nouchi ?`,
      text: `Découvre la définition de "${mot}" — le dictionnaire du Nouchi`,
      url,
    });
    return true;
  } catch {
    return false;
  }
}

export async function copyShareLink({ slug }: Pick<ShareParams, "slug">): Promise<boolean> {
  const url = getShareUrl({ slug });
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
