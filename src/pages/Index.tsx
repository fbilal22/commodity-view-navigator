
import { useState, useEffect } from "react";
import CommoditiesDashboard from "@/components/CommoditiesDashboard";
import ApiKeyForm from "@/components/ApiKeyForm";
import { validateApiKey, updateApiKey } from "@/services/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Check if we have a stored API key
  useEffect(() => {
    const checkStoredKey = async () => {
      const storedKey = localStorage.getItem("ninjaApiKey");
      
      if (storedKey) {
        try {
          const isValid = await validateApiKey(storedKey);
          
          if (isValid) {
            updateApiKey(storedKey);
            setIsKeyValid(true);
          } else {
            // Key is invalid, clear it
            localStorage.removeItem("ninjaApiKey");
          }
        } catch (error) {
          console.error("Error validating stored API key:", error);
        }
      }
      
      setIsChecking(false);
    };
    
    checkStoredKey();
  }, []);

  const handleValidKey = (key: string) => {
    setIsKeyValid(true);
    setShowForm(false);
  };

  const handleChangeKey = () => {
    setShowForm(true);
  };

  if (isChecking) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {isKeyValid && !showForm ? (
        <>
          <div className="mb-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleChangeKey}>
              <KeyRound className="mr-2 h-4 w-4" />
              Change API Key
            </Button>
          </div>
          <CommoditiesDashboard />
        </>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {!showForm && !isKeyValid && (
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                You need to configure your API key to access the commodities dashboard.
              </AlertDescription>
            </Alert>
          )}
          <ApiKeyForm onValidKey={handleValidKey} defaultKey="" />
        </div>
      )}
    </div>
  );
}

export default Index;
