"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MotPreview } from "@/components/admin/mot-preview";
import { ModerationLogs } from "@/components/admin/moderation-logs";
import { Plus, Trash2, Loader2, CheckCircle, XCircle, Save } from "lucide-react";

const CATEGORIES = [
  { value: "NOM", label: "Nom" },
  { value: "VERBE", label: "Verbe" },
  { value: "ADJECTIF", label: "Adjectif" },
  { value: "EXPRESSION", label: "Expression" },
  { value: "ADVERBE", label: "Adverbe" },
];

const editSchema = z.object({
  mot: z.string().min(1, "Requis"),
  definition: z.string().min(1, "Requis"),
  categorie: z.enum(["NOM", "VERBE", "ADJECTIF", "EXPRESSION", "ADVERBE"]).optional(),
  exemples: z.array(z.object({ value: z.string() })).default([]),
});

type EditFormValues = z.infer<typeof editSchema>;

interface MotData {
  id: string;
  slug: string;
  mot: string;
  definition: string;
  categorie: string | null;
  statut: string;
  exemples: { id: string; contenu: string }[];
  soumisPar: { id: string; name: string; image: string | null } | null;
}

interface VoteSummary {
  totalVotes: number;
  connaissance: { OUI_UTILISE: number; CONNAIS: number; JAMAIS_ENTENDU: number };
  exactitude: { EXACTE: number; APPROXIMATIVE: number; FAUSSE: number };
}

interface LogEntry {
  id: string;
  action: "VALIDE" | "REJETE" | "EDITE";
  motif?: string | null;
  createdAt: string;
  moderateur: { id: string; name: string };
}

interface MotEditFormProps {
  mot: MotData;
  votes: VoteSummary;
  logs: LogEntry[];
}

export function MotEditForm({ mot, votes, logs }: MotEditFormProps) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [motif, setMotif] = useState("");
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm<EditFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editSchema) as any,
    defaultValues: {
      mot: mot.mot,
      definition: mot.definition,
      categorie: (mot.categorie as EditFormValues["categorie"]) ?? undefined,
      exemples: mot.exemples.map((e) => ({ value: e.contenu })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exemples",
  });

  const watched = form.watch();

  async function handleSave(data: EditFormValues) {
    setSaving(true);
    setMessage(null);
    try {
      const body = {
        mot: data.mot,
        definition: data.definition,
        ...(data.categorie ? { categorie: data.categorie } : {}),
        exemples: data.exemples.map((e) => e.value).filter(Boolean),
      };
      const res = await fetch(`/api/admin/mots/${mot.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setMessage({ type: "error", text: "Erreur lors de la sauvegarde." });
      } else {
        setMessage({ type: "success", text: "Mot sauvegardé avec succès." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion." });
    } finally {
      setSaving(false);
    }
  }

  async function handleValider() {
    setValidating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/mots/${mot.slug}/valider`, { method: "POST" });
      if (res.ok) {
        router.push("/admin");
      } else {
        setMessage({ type: "error", text: "Erreur lors de la validation." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion." });
    } finally {
      setValidating(false);
    }
  }

  async function handleRejeter() {
    if (!motif.trim()) {
      setMessage({ type: "error", text: "Le motif est requis." });
      return;
    }
    setRejecting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/mots/${mot.slug}/rejeter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motif }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        setMessage({ type: "error", text: "Erreur lors du rejet." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion." });
    } finally {
      setRejecting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form — 2/3 */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Modifier le mot</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="mot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="definition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Définition *</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categorie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Exemples</FormLabel>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        placeholder={`Exemple ${index + 1}...`}
                        {...form.register(`exemples.${index}.value`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => append({ value: "" })}
                  >
                    <Plus className="size-3.5" />
                    Ajouter un exemple
                  </Button>
                </div>

                {message && (
                  <p className={`text-sm ${message.type === "error" ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                    {message.text}
                  </p>
                )}

                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Sauvegarder
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Moderation actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions de modération</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleValider}
                disabled={validating || mot.statut === "VALIDE"}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {validating ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                Valider
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectOpen((o) => !o)}
                disabled={rejecting || mot.statut === "REJETE"}
                className="gap-2"
              >
                <XCircle className="size-4" />
                Rejeter
              </Button>
            </div>

            {rejectOpen && (
              <div className="space-y-3 pt-2">
                <Textarea
                  placeholder="Motif du rejet..."
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleRejeter}
                    disabled={rejecting}
                    className="gap-2"
                  >
                    {rejecting ? <Loader2 className="size-4 animate-spin" /> : null}
                    Confirmer le rejet
                  </Button>
                  <Button variant="outline" onClick={() => setRejectOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vote summary */}
        <Card>
          <CardHeader>
            <CardTitle>Votes de la communauté ({votes.totalVotes})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Connaissance</p>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="border rounded-lg p-2">
                  <p className="font-bold text-lg">{votes.connaissance.OUI_UTILISE}</p>
                  <p className="text-xs text-muted-foreground">J&apos;utilise</p>
                </div>
                <div className="border rounded-lg p-2">
                  <p className="font-bold text-lg">{votes.connaissance.CONNAIS}</p>
                  <p className="text-xs text-muted-foreground">Je connais</p>
                </div>
                <div className="border rounded-lg p-2">
                  <p className="font-bold text-lg">{votes.connaissance.JAMAIS_ENTENDU}</p>
                  <p className="text-xs text-muted-foreground">Jamais entendu</p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Exactitude</p>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="border rounded-lg p-2">
                  <p className="font-bold text-lg">{votes.exactitude.EXACTE}</p>
                  <p className="text-xs text-muted-foreground">Exacte</p>
                </div>
                <div className="border rounded-lg p-2">
                  <p className="font-bold text-lg">{votes.exactitude.APPROXIMATIVE}</p>
                  <p className="text-xs text-muted-foreground">Approx.</p>
                </div>
                <div className="border rounded-lg p-2">
                  <p className="font-bold text-lg">{votes.exactitude.FAUSSE}</p>
                  <p className="text-xs text-muted-foreground">Fausse</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Historique de modération</CardTitle>
          </CardHeader>
          <CardContent>
            <ModerationLogs logs={logs} />
          </CardContent>
        </Card>
      </div>

      {/* Preview — 1/3 */}
      <div className="lg:col-span-1">
        <MotPreview
          mot={watched.mot ?? ""}
          definition={watched.definition ?? ""}
          categorie={watched.categorie}
          exemples={watched.exemples?.map((e) => e.value) ?? []}
        />
      </div>
    </div>
  );
}
