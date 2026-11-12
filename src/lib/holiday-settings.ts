import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { emptyHolidaySettings, isHolidaySettings, type HolidaySettings } from "@/lib/holidays";

const key = ["holiday-settings"] as const;

export function useHolidaySettings() {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("value").eq("key", "holidays").maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return emptyHolidaySettings;
      if (!isHolidaySettings(data.value)) throw new Error("Festività salvate non valide.");
      return data.value;
    },
    refetchOnWindowFocus: "always",
    refetchInterval: 5000,
  });
}

export function useSaveHolidaySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (value: HolidaySettings) => {
      const { data, error } = await supabase.from("app_settings")
        .upsert({ key: "holidays", value }).select("value").single();
      if (error) throw new Error(error.message);
      if (!isHolidaySettings(data.value)) throw new Error("Festività salvate non valide.");
      return data.value;
    },
    onSuccess: async (value) => {
      qc.setQueryData(key, value);
      await qc.invalidateQueries({ queryKey: key });
    },
  });
}