"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMotSchema } from "@/lib/validators/mot";
import { z } from "zod";

type FormValues = z.output<typeof createMotSchema>;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

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

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createMotSchema) as any,
    defaultValues: {
      mot: "",
      definition: "",
      exemples: [""],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exemples" as never,
  });

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
          <CheckCircle className="size-12 text-green-500 mx-auto" />
          <h2 className="text-xl font-semibold">Mot soumis avec succès !</h2>
          <p className="text-muted-foreground">
            Ton mot sera examiné par un modérateur avant d&apos;être publié.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/mots">Voir le dictionnaire</Link>
            </Button>
            <Button onClick={() => { form.reset(); setStatus("idle"); }}>
              Proposer un autre mot
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mot"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: goumin, enjailler..." {...field} />
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
                <Textarea
                  placeholder="Décris le sens du mot..."
                  rows={3}
                  {...field}
                />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <div className="space-y-3">
          <FormLabel>Exemples</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                placeholder={`Exemple ${index + 1}...`}
                {...form.register(`exemples.${index}` as const)}
              />
              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => append("" as never)}
          >
            <Plus className="size-3.5" />
            Ajouter un exemple
          </Button>
        </div>

        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        <Button type="submit" disabled={status === "loading"} className="w-full">
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Envoi en cours...
            </>
          ) : (
            "Soumettre le mot"
          )}
        </Button>
      </form>
    </Form>
  );
}
