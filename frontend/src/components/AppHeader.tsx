import { Bell, Search, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { users } from "@/data/sampleData";
import { useCityContext, GLOBAL_CITIES } from "@/contexts/CityContext";

export default function AppHeader() {
  const userStr = localStorage.getItem("user");
  const compStr = localStorage.getItem("company");
  const currentUser = userStr ? JSON.parse(userStr) : { name: "Guest", role: "User" };
  const company = compStr ? JSON.parse(compStr) : { name: "LeadSphere" };
  const { selectedCity, setSelectedCity } = useCityContext();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search leads, campaigns..." className="pl-10 bg-muted/50 border-none h-9 text-sm" />
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[160px] h-9 text-sm border-dashed">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GLOBAL_CITIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {currentUser.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.role} @ {company.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
