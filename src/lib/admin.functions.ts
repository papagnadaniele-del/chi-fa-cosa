import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CF_REGEX, cfToEmail, normalizeCf } from "./cf";

const roleSchema = z.array(z.enum(["admin", "user"])).min(1, "Seleziona almeno un ruolo");

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Operazione riservata agli amministratori");
}

/** Crea il primo amministratore solo se non ne esiste nessuno. */
export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  if ((count ?? 0) > 0) return { created: false };
  const cf = "PPGMHL71A06H926W";
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: cfToEmail(cf),
    password: process.env["BOOTSTRAP_ADMIN_PASSWORD"]!,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  const id = data.user.id;
  await supabaseAdmin.from("profiles").insert({ id, codice_fiscale: cf, full_name: "Papagna Daniele" });
  await supabaseAdmin.from("user_roles").insert([
    { user_id: id, role: "admin" },
    { user_id: id, role: "user" },
  ]);
  return { created: true };
});

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      context.supabase.from("profiles").select("id, codice_fiscale, full_name").order("full_name"),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    return (profiles ?? []).map((p) => ({
      ...p,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as "admin" | "user"),
    }));
  });

export const createAppUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        codice_fiscale: z.string().transform(normalizeCf).refine((v) => CF_REGEX.test(v), "Codice fiscale non valido"),
        full_name: z.string().trim().min(1, "Nome obbligatorio").max(100),
        password: z.string().min(8, "Password di almeno 8 caratteri").max(72),
        roles: roleSchema,
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: cfToEmail(data.codice_fiscale),
      password: data.password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message.includes("already") ? "Codice fiscale già registrato" : error.message);
    const id = created.user.id;
    await supabaseAdmin.from("profiles").insert({ id, codice_fiscale: data.codice_fiscale, full_name: data.full_name });
    await supabaseAdmin.from("user_roles").insert(data.roles.map((role) => ({ user_id: id, role })));
    return { ok: true };
  });

export const setUserRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), roles: roleSchema }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id === context.userId && !data.roles.includes("admin"))
      throw new Error("Non puoi togliere a te stesso il ruolo Amministratore");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id);
    await supabaseAdmin.from("user_roles").insert(data.roles.map((role) => ({ user_id: data.id, role })));
    return { ok: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), password: z.string().min(8, "Password di almeno 8 caratteri").max(72) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.id, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAppUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id === context.userId) throw new Error("Non puoi eliminare il tuo account");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id);
    await supabaseAdmin.from("profiles").delete().eq("id", data.id);
    await supabaseAdmin.auth.admin.deleteUser(data.id);
    return { ok: true };
  });
