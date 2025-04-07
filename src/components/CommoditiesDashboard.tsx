
import { useEffect, useState } from "react";
import { Commodity, fetchCommoditiesData } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommoditiesTable from "./CommoditiesTable";
import CommodityCard from "./CommodityCard";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommoditiesDashboard() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCommoditiesData();
      setCommodities(data);
      setLastUpdated(new Date());
      
      if (data.length === 0) {
        setError("Aucune donnée n'a été trouvée");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setError("Erreur lors du chargement des données");
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Rafraîchissement des données toutes les 5 minutes
    const interval = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Filtrer les commodités par types
  const goldCommodities = commodities.filter(c => c.type === 'gold');
  const silverCommodities = commodities.filter(c => c.type === 'silver');
  const copperCommodities = commodities.filter(c => c.type === 'copper');
  const aluminumCommodities = commodities.filter(c => c.type === 'aluminum');
  const cobaltCommodities = commodities.filter(c => c.type === 'cobalt');

  // Composant de chargement pour un groupe de cartes
  const LoadingCards = ({ count = 4 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden h-full border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex flex-col gap-1 w-full">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex justify-between items-end mt-3">
              <div className="flex-1">
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div>
                <Skeleton className="h-3 w-14 mb-1" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord des matières premières</h1>
          <p className="text-muted-foreground">
            Suivez les prix et les tendances des métaux précieux et industriels
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin mr-2" : "mr-2"} />
            Actualiser
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 p-4 rounded-md flex items-center gap-2 text-destructive">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="precious">Métaux précieux</TabsTrigger>
          <TabsTrigger value="industrial">Métaux industriels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {loading ? (
            <Skeleton className="h-[300px] w-full rounded-md" />
          ) : (
            <CommoditiesTable commodities={commodities} />
          )}
          
          {loading ? (
            <LoadingCards count={4} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {commodities.slice(0, 4).map(commodity => (
                <CommodityCard key={commodity.symbol} commodity={commodity} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="precious" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Or</CardTitle>
                <CardDescription>Tendance actuelle des contrats à terme sur l'or</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-[100px] w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {goldCommodities.map(commodity => (
                      <CommodityCard key={commodity.symbol} commodity={commodity} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Argent</CardTitle>
                <CardDescription>Tendance actuelle des contrats à terme sur l'argent</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-[100px] w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {silverCommodities.map(commodity => (
                      <CommodityCard key={commodity.symbol} commodity={commodity} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="industrial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cuivre</CardTitle>
                <CardDescription>Tendance actuelle des contrats à terme sur le cuivre</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-[100px] w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {copperCommodities.map(commodity => (
                      <CommodityCard key={commodity.symbol} commodity={commodity} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Aluminium</CardTitle>
                <CardDescription>Tendance actuelle des contrats à terme sur l'aluminium</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-[100px] w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {aluminumCommodities.slice(0, 3).map(commodity => (
                      <CommodityCard key={commodity.symbol} commodity={commodity} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cobalt</CardTitle>
                <CardDescription>Tendance actuelle des contrats à terme sur le cobalt</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-[100px] w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {cobaltCommodities.map(commodity => (
                      <CommodityCard key={commodity.symbol} commodity={commodity} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
