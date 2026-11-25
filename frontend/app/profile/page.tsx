import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ProfileView } from "@/components/community/profile-view";
import { SAMPLE_MOVIES } from "@/lib/movies/sample-movies";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Your taste, your likes, your saved movies and your Co-Stars.",
};

export default function ProfilePage() {
  return (
    <Container className="py-12 sm:py-16">
      <ProfileView movies={SAMPLE_MOVIES} />
    </Container>
  );
}