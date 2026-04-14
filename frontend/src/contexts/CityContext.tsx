import { createContext, useContext, useState, ReactNode } from "react";

export const GLOBAL_CITIES = [
  "All Cities",
  "Mumbai", "Delhi", "Bangalore", "Ahmedabad", "Pune", "Chennai",
  "Hyderabad", "Kochi", "Kolkata", "Jaipur", "Lucknow", "Chandigarh",
  "New York", "London", "Dubai", "Singapore", "Tokyo", "Sydney",
  "San Francisco", "Toronto", "Berlin", "Paris",
];

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCityContext must be used within CityProvider");
  return ctx;
}
