import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="text-7xl font-black text-green-600">404</p>
      <h1 className="mt-4 text-2xl font-black text-neutral-900">
        Page introuvable
      </h1>
      <p className="mt-2 text-neutral-500">
        La page que vous recherchez n&apos;est plus disponible ou a été
        déplacée.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/touba-infos"
          className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/touba-infos/fil-info"
          className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
        >
          Voir les dernières actualités
        </Link>
      </div>
    </div>
  );
}
