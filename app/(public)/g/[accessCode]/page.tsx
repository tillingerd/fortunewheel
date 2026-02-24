import Link from "next/link";

type PublicGamePageProps = {
  params: Promise<{
    accessCode: string;
  }>;
};

export default async function PublicGamePage({ params }: PublicGamePageProps) {
  const { accessCode } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Public Game</h1>
      <p className="text-sm text-zinc-700">Access code: {accessCode}</p>

      <section className="rounded border p-4 text-sm">
        {/* TODO: implement registration form (first name, last name, email, terms) */}
        <p>Registration step placeholder</p>
      </section>

      <section className="rounded border p-4 text-sm">
        {/* TODO: implement quiz flow with restart on wrong answer */}
        <p>Quiz step placeholder</p>
      </section>

      <section className="rounded border p-4 text-sm">
        {/* TODO: implement wheel spin and result modal */}
        <p>Spin step placeholder</p>
      </section>

      <Link className="underline" href={`/g/${accessCode}/close`}>
        Go to close game page
      </Link>
    </main>
  );
}
