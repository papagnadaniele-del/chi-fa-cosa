import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { defaultLayout, isValidLayout } from "@/lib/turno-data";

export const turnoLayoutKey = ["turno-layout"] as const;

export function useTurnoLayout() {
  return useQuery({
    queryKey: turnoLayoutKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "layout")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return defaultLayout();
      if (!isValidLayout(data.value)) throw new Error("Le righe salvate non sono valide.");
      return data.value;
    },
    refetchOnWindowFocus: "always",
    refetchOnMount: "always",
    refetchInterval: 5000,
  });
}