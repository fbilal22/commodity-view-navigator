
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { validateApiKey, updateApiKey } from "@/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Loader2 } from "lucide-react";

// Validation schema for the API key
const apiKeySchema = z.object({
  apiKey: z.string().min(10, "API key must be at least 10 characters")
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

interface ApiKeyFormProps {
  onValidKey: (key: string) => void;
  defaultKey?: string;
}

export default function ApiKeyForm({ onValidKey, defaultKey = "" }: ApiKeyFormProps) {
  const [isValidating, setIsValidating] = useState(false);
  
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: defaultKey
    }
  });

  const onSubmit = async (data: ApiKeyFormValues) => {
    setIsValidating(true);
    
    try {
      const isValid = await validateApiKey(data.apiKey);
      
      if (isValid) {
        updateApiKey(data.apiKey);
        toast.success("Valid API key! Loading data...");
        onValidKey(data.apiKey);
        
        // Store in localStorage for future use
        localStorage.setItem("ninjaApiKey", data.apiKey);
      } else {
        toast.error("Invalid API key. Please check your key and try again.");
      }
    } catch (error) {
      toast.error("Error validating API key");
      console.error("API key validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          API Configuration
        </CardTitle>
        <CardDescription>
          Please enter your Ninja API key to access the commodities data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ninja API Key</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your API key..." 
                      {...field} 
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate API Key"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Your API key is stored locally and never shared.</p>
      </CardFooter>
    </Card>
  );
}
