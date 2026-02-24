import Link from "next/link";

type CloseGamePageProps = {
  params: Promise<{
    accessCode: string;
  }>;
};

export default async function CloseGamePage({ params }: CloseGamePageProps) {
  const { accessCode } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Game Closed</h1>
      <p className="text-sm text-zinc-700">
        Thank you for playing. Access code: {accessCode}
      </p>
      {/* TODO: replace URL with real business solutions page */}
      <Link className="underline" href="https://example.com/business-solutions">
        Business Solutions
      </Link>
    </main>
  );
}
