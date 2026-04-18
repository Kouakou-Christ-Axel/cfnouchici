"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMotSchema } from "@/lib/validators/mot";
import { z } from "zod";
import Link from "next/link";
import { Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { ShareButton } from "@/components/share/share-button";
import { authClient } from "@/lib/auth-client";

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

  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

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

          {!isAuthenticated && (
            <div className="rounded-lg border border-border bg-muted/50 px-5 py-4 space-y-3 text-left">
              <p className="text-sm font-medium">Suis tes contributions</p>
              <p className="text-sm text-muted-foreground">
                Crée un compte pour être notifié quand ton mot est publié.
              </p>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() =>
                  authClient.signIn.social({ provider: "google", callbackURL: "/" })
                }
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Se connecter avec Google
              </Button>
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
