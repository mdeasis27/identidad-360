"use client";

import { useState } from "react";
import { RiskBadge } from "@/components/RiskBadge";
import { SourceList } from "@/components/SourceList";
import { Chip } from "@/components/Chip";
import { Alert } from "@/design-system/components/alert";

interface TruoraCheck {
  identity_confirmed: boolean;
  sanctions_hit: boolean;
  pep_hit: boolean;
  judicial_records: boolean;
}

interface Profile360 {
  risk_score: number;
  risk_level: "bajo" | "medio" | "alto";
  summary: string;
  red_flags: string[];
  positive_signals: string[];
  sources: { title: string; url: string }[];
}

interface ApiResponse {
  profile: Profile360;
  truora: TruoraCheck;
  name: string;
  country: string;
}

export default function Home() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          country: country.trim(),
          document_id: documentId.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error desconocido al construir el perfil.");
        return;
      }

      setResult(data as ApiResponse);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Perfiles de Identidad 360°
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Inteligencia de identidad para equipos de riesgo crediticio. Combina
            validación documental con señales públicas web para
            un perfil sintetizado por IA.
          </p>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[var(--radius-md)] bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground"
              >
                Nombre completo <span className="text-danger">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan García López"
                className="mt-1 block w-full rounded-[var(--radius-md)] shadow-[var(--shadow-border-light)] bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-foreground"
              >
                País <span className="text-danger">*</span>
              </label>
              <input
                id="country"
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ej. Colombia"
                className="mt-1 block w-full rounded-[var(--radius-md)] shadow-[var(--shadow-border-light)] bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="document"
                className="block text-sm font-medium text-foreground"
              >
                Documento{" "}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <input
                id="document"
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Cédula, NIT, pasaporte..."
                className="mt-1 block w-full rounded-[var(--radius-md)] shadow-[var(--shadow-border-light)] bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-[var(--radius-md)] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Construyendo perfil..." : "Construir perfil"}
          </button>
        </form>

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-8 space-y-4 animate-pulse">
            <div className="h-8 w-40 rounded-full bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-4/6 rounded bg-muted" />
          </div>
        )}

        {/* Error banner */}
        {error && !loading && (
          <Alert tone="danger" className="mt-6">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {/* Results */}
        {result && !loading && (
          <section className="mt-8 space-y-6">
            {/* Risk badge + name */}
            <div className="flex flex-wrap items-center gap-3">
              <RiskBadge
                level={result.profile.risk_level}
                score={result.profile.risk_score}
              />
              <span className="text-sm text-muted-foreground">
                {result.name} · {result.country}
              </span>
            </div>

            {/* Summary */}
            <div className="rounded-[var(--radius-md)] bg-card p-5 shadow-[var(--shadow-card)]">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Resumen ejecutivo
              </h2>
              <p className="text-sm leading-relaxed text-foreground">
                {result.profile.summary}
              </p>
            </div>

            {/* Red flags */}
            {result.profile.red_flags.length > 0 && (
              <Alert tone="danger" title="Señales de alerta" items={result.profile.red_flags} />
            )}

            {/* Positive signals */}
            {result.profile.positive_signals.length > 0 && (
              <Alert tone="success" title="Señales positivas" items={result.profile.positive_signals} />
            )}

            {/* API de verificación de identidad verification chips */}
            <div className="rounded-[var(--radius-md)] bg-card p-5 shadow-[var(--shadow-card)]">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Verificación de identidad (API de verificación de identidad)
              </h2>
              <div className="flex flex-wrap gap-2">
                <Chip
                  ok={result.truora.identity_confirmed}
                  labelOk="Identidad confirmada"
                  labelFail="Identidad no confirmada"
                />
                <Chip
                  ok={!result.truora.sanctions_hit}
                  labelOk="Sin sanciones"
                  labelFail="Alerta: sanciones"
                />
                <Chip
                  ok={!result.truora.pep_hit}
                  labelOk="No es PEP"
                  labelFail="Alerta: PEP detectado"
                />
                <Chip
                  ok={!result.truora.judicial_records}
                  labelOk="Sin registros judiciales"
                  labelFail="Alerta: registros judiciales"
                />
              </div>
            </div>

            {/* Sources */}
            <div className="rounded-[var(--radius-md)] bg-card p-5 shadow-[var(--shadow-card)]">
              <SourceList sources={result.profile.sources} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
