import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NotFound() {
  return (
    <Container className="py-20 sm:py-28">
      <SectionHeading
        as="h1"
        eyebrow="404"
        title="This scene was cut."
        description="The page you were looking for does not exist or has moved."
      />
      <ButtonLink href="/" className="mt-8">
        Back to the start
      </ButtonLink>
    </Container>
  );
}
