// TODO: recuperar perfil por ID (localStorage / DB) y renderizarlo
// Componentes: ProfileCard, RiskBadge, SourceList

export default function ResultsPage({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">Perfil 360°</h1>
      <p className="mt-2 text-sm text-gray-500">ID: {params.id}</p>
      {/* TODO: mostrar ProfileCard, RiskBadge, SourceList */}
    </main>
  );
}
