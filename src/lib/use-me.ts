import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("full_name, codice_fiscale").eq("id", u.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.user.id),
      ]);
      const list = (roles ?? []).map((r) => r.role);
      return {
        id: u.user.id,
        name: profile?.full_name ?? "",
        cf: profile?.codice_fiscale ?? "",
        isAdmin: list.includes("admin"),
        roles: list,
      };
    },
  });
}
