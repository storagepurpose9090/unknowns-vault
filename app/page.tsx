import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const { data: mods } = await supabase
    .from("mods")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-black text-white px-10">
      {/* HERO */}
      <section className="text-center py-24">
        <h1 className="text-6xl font-bold text-purple-500">
          Unknowns Vault
        </h1>
        <p className="mt-4 text-xl text-gray-400">
          Enjoy free mods
        </p>
      </section>

      {/* MOD LIST */}
      <section className="grid md:grid-cols-3 gap-6 pb-24">
        {mods?.map((mod) => (
          <div
            key={mod.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-purple-500 transition"
          >
            <h2 className="text-xl font-semibold">{mod.name}</h2>
            <p className="text-sm text-gray-400">
              MC Version: {mod.version || "N/A"}
            </p>

            <a
              href={mod.file_url}
              target="_blank"
              className="inline-block mt-4 text-purple-400 hover:underline"
            >
              Download
            </a>
          </div>
        ))}

        {mods?.length === 0 && (
          <p className="text-gray-500 col-span-full text-center">
            No mods uploaded yet
          </p>
        )}
      </section>

      <footer className="text-center text-gray-500 text-sm pb-6">
        Not affiliated with Mojang or Microsoft
      </footer>
    </main>
  );
}

