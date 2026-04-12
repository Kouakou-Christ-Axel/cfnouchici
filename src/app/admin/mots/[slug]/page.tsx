import { redirect } from "next/navigation";

export default async function AdminMotSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/dashboard/moderation/${slug}`);
}
