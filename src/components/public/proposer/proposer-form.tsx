"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMotSchema } from "@/lib/validators/mot";
import { z } from "zod";
import Link from "next/link";
import { Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { ShareButton } from "@/components/share/share-button";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
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

import { ProposerPreview } from "@/components/public/proposer/proposer-preview";

type FormValues = z.output<typeof createMotSchema>;

const CATEGORIES = [
  { value: "NOM", label: "Nom" },
  { value: "VERBE", label: "Verbe" },
  { value: "ADJECTIF", label: "Adjectif" },
  { value: "EXPRESSION", label: "Expression" },
  { value: "ADVERBE", label: "Adverbe" },
];

export function ProposerForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null);
  const [submittedMot, setSubmittedMot] = useState<string | null>(null);

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createMotSchema) as any,
    defaultValues: { mot: "", definition: "", exemples: [""] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exemples" as never,
  });

  const watched = form.watch();

  async function onSubmit(data: FormValues) {
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/mots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 409) {
        setStatus("error");
        setErrorMessage("Ce mot existe déjà dans le dictionnaire.");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        setErrorMessage("Une erreur est survenue. Réessaie plus tard.");
        return;
      }
      const created = await res.json();
      setSubmittedSlug(created.slug);
      setSubmittedMot(created.mot);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Erreur de connexion. Vérifie ta connexion internet.");
    }
  }

  if (status === "success") {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle className="size-12 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-semibold">Mot soumis avec succès !</h2>
          <p className="text-muted-foreground">
            Ton mot sera examiné par un modérateur avant d&apos;être publié. En attendant, partage-le pour que la communauté puisse voter !
          </p>
          {submittedSlug && submittedMot && (
            <div className="flex justify-center pt-2">
              <ShareButton mot={submittedMot} slug={submittedSlug} variant="default" />
            </div>
          )}
          <div className="flex justify-center gap-3">
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/mots">Voir le dictionnaire</Link>
            </Button>
            <Button
              onClick={() => {
                form.reset();
                setStatus("idle");
                setSubmittedSlug(null);
                setSubmittedMot(null);
              }}
              className="rounded-full"
            >
              Proposer un autre mot
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: goumin" {...field} />
                    </FormControl>
                    <FormDescription>Le mot tel qu&apos;il se prononce.</FormDescription>
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
                          <SelectValue placeholder="Sélectionne une catégorie" />
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
            </div>

            <FormField
              control={form.control}
              name="definition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Définition *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décris le sens du mot en français simple..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Sois clair et concis. Une phrase suffit.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Exemples d&apos;utilisation</FormLabel>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder={
                        index === 0
                          ? "Écris une phrase où ce mot est utilisé..."
                          : "Un autre exemple (facultatif)..."
                      }
                      {...form.register(`exemples.${index}` as const)}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        aria-label="Supprimer cet exemple"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-dashed gap-1 mt-1"
                onClick={() => append("" as never)}
              >
                <Plus className="size-3.5" />
                Ajouter un exemple
              </Button>
            </div>

            <ProposerPreview
              mot={watched.mot ?? ""}
              definition={watched.definition ?? ""}
              categorie={watched.categorie}
              exemples={(watched.exemples as string[] | undefined) ?? []}
            />

            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            <Separator />

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" asChild className="rounded-full">
                <Link href="/">Annuler</Link>
              </Button>
              <Button
                type="submit"
                disabled={status === "loading"}
                className="rounded-full"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  "Soumettre le mot"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
