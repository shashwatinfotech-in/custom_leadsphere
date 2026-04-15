import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { api } from "@/lib/api";

const fallbackCities = [
  { id: 0, name: "All Cities", is_active: true },
  { id: 1, name: "Mumbai", is_active: true },
  { id: 2, name: "Delhi", is_active: true },
  { id: 3, name: "Bangalore", is_active: true },
  { id: 4, name: "Ahmedabad", is_active: true },
  { id: 5, name: "Pune", is_active: true },
  { id: 6, name: "Chennai", is_active: true },
  { id: 7, name: "Hyderabad", is_active: true },
  { id: 8, name: "Kochi", is_active: true },
  { id: 9, name: "Kolkata", is_active: true },
  { id: 10, name: "Jaipur", is_active: true },
  { id: 11, name: "Lucknow", is_active: true },
  { id: 12, name: "Chandigarh", is_active: true },
  { id: 13, name: "New York", is_active: true },
  { id: 14, name: "London", is_active: true },
  { id: 15, name: "Dubai", is_active: true },
  { id: 16, name: "Singapore", is_active: true },
  { id: 17, name: "Tokyo", is_active: true },
  { id: 18, name: "Sydney", is_active: true },
  { id: 19, name: "San Francisco", is_active: true },
  { id: 20, name: "Toronto", is_active: true },
  { id: 21, name: "Berlin", is_active: true },
  { id: 22, name: "Paris", is_active: true },
];

export interface CityOption {
  id: number | string;
  name: string;
  is_active: boolean;
}

interface CityContextType {
  cities: CityOption[];
  selectedCityId: string;
  selectedCity: string;
  setSelectedCityId: (cityId: string) => void;
  refreshCities: () => Promise<void>;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<CityOption[]>(fallbackCities);
  const [selectedCityId, setSelectedCityId] = useState("all");

  const refreshCities = useCallback(async () => {
    try {
      const data = await api("/cities?include_inactive=false");
      if (Array.isArray(data) && data.length > 0) {
        setCities(data);
      } else {
        setCities(fallbackCities.filter(city => city.id !== 0));
      }
    } catch (err) {
      console.error("Failed to load cities", err);
      setCities(fallbackCities.filter(city => city.id !== 0));
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      refreshCities();
    }
  }, []);

  const selectedCity = useMemo(() => {
    if (selectedCityId === "all") return "All Cities";
    return cities.find(city => String(city.id) === selectedCityId)?.name || "All Cities";
  }, [cities, selectedCityId]);

  return (
    <CityContext.Provider value={useMemo(() => ({
      cities: cities.filter(city => city.id !== 0),
      selectedCityId,
      selectedCity,
      setSelectedCityId,
      refreshCities
    }), [cities, selectedCityId, selectedCity, refreshCities])}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCityContext must be used within CityProvider");
  return ctx;
}
