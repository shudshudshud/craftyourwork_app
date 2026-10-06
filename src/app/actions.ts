// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Irsyad Ramthan

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseQuickAdd, slug, todayIn } from "@/lib/quick-add";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return supabase;
}

// Quick add: "Draft SIC booth plan #sustig ^2026-10-20"
// #tag picks a project (created if it doesn't exist); ^date sets a due date.
export async function addTask(formData: FormData) {
  const supabase = await requireUser();
  const raw = String(formData.get("title") ?? "");
  const chosenProject = String(formData.get("project_id") ?? "") || null;

  const { title, tag, due } = parseQuickAdd(raw, todayIn());
  if (!title) return;

  let projectId = chosenProject;
  if (tag) {
    const { data: projects } = await supabase.from("projects").select("id, name");
    const match = projects?.find((p) => slug(p.name) === slug(tag));
    if (match) {
      projectId = match.id;
    } else {
      const { data: created } = await supabase
        .from("projects")
        .insert({ name: tag })
        .select("id")
        .single();
      projectId = created?.id ?? projectId;
    }
  }

  await supabase.from("tasks").insert({ title, project_id: projectId, due_date: due });
  revalidatePath("/", "layout");
}

export async function completeTask(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id"));
  const outcome = String(formData.get("outcome") ?? "").trim() || null;

  await supabase
    .from("tasks")
    .update({ status: "done", done_at: new Date().toISOString(), outcome })
    .eq("id", id);
  revalidatePath("/", "layout");
}

export async function reopenTask(formData: FormData) {
  const supabase = await requireUser();
  await supabase
    .from("tasks")
    .update({ status: "todo", done_at: null })
    .eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
}

export async function updateOutcome(formData: FormData) {
  const supabase = await requireUser();
  const outcome = String(formData.get("outcome") ?? "").trim() || null;
  await supabase.from("tasks").update({ outcome }).eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
}

export async function deleteTask(formData: FormData) {
  const supabase = await requireUser();
  await supabase.from("tasks").delete().eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
}

export async function addProject(formData: FormData) {
  const supabase = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("projects").insert({ name });
  revalidatePath("/", "layout");
}

export async function setProjectStatus(formData: FormData) {
  const supabase = await requireUser();
  const status = String(formData.get("status"));
  if (!["active", "paused", "done"].includes(status)) return;
  await supabase.from("projects").update({ status }).eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
