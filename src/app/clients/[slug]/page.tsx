import { getClientBySlug, SAMPLE_CLIENTS } from "@/lib/data/clients";
import { ClientWorkspaceView } from "@/components/workspace/ClientWorkspaceView";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return SAMPLE_CLIENTS.map((client) => ({
    slug: client.slug,
  }));
}

export default async function ClientWorkspaceDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = getClientBySlug(slug);

  if (!client) {
    notFound();
  }

  return (
    <ClientWorkspaceView
      client={client}
      allClients={SAMPLE_CLIENTS}
    />
  );
}
