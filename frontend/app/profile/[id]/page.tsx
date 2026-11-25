import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { PublicProfile } from "@/components/community/public-profile";
import { SAMPLE_MOVIES } from "@/lib/movies/sample-movies";

export const metadata: Metadata = {
  title: "Profile",
  description: "A cinephile profile on N-Finder.",
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Container className="py-12 sm:py-16">
      <Suspense fallback={<div className="mt-10 min-h-40" aria-hidden="true" />}>
        <ProfileContent params={params} />
      </Suspense>
    </Container>
  );
}

async function ProfileContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicProfile id={id} movies={SAMPLE_MOVIES} />;
}