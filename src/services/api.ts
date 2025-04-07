
import { toast } from "sonner";
import { parse } from "node-html-parser";

// Clé API fournie
const API_KEY = 'V06SpYv2b/ptbqPxnvvhtg==3F5KAONfyIW0JKVl';

// Interfaces pour les données des matières premières
export interface Commodity {
  symbol: string;
  name: string;
  price: number;
  percentChange: number;
  absoluteChange: number;
  high: number;
  low: number;
  technicalEvaluation: string;
  type: 'gold' | 'silver' | 'copper' | 'aluminum' | 'cobalt' | 'other';
}

/**
 * Récupère les données des matières premières depuis TradingView via l'API Ninja
 */
export async function fetchCommoditiesData(): Promise<Commodity[]> {
  try {
    // Afficher un message de chargement
    console.log("Fetching data from TradingView...");
    
    const response = await fetch('https://api.api-ninjas.com/v1/webscraper?url=https://fr.tradingview.com/markets/futures/quotes-metals/', {
      headers: {
        'X-Api-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw API response:", data);
    
    // Analyse du HTML récupéré pour extraire les données des matières premières
    return parseCommoditiesData(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    toast.error('Erreur lors de la récupération des données');
    throw error; // Propagate the error instead of returning empty array
  }
}

/**
 * Détermine le type de matière première à partir du symbole ou du nom
 */
function getCommodityType(symbol: string, name: string): Commodity['type'] {
  const lowerSymbol = symbol.toLowerCase();
  const lowerName = name.toLowerCase();
  
  if (lowerSymbol.includes('au') || lowerName.includes('gold') || lowerName.includes('or')) {
    return 'gold';
  } else if (lowerSymbol.includes('ag') || lowerName.includes('silver') || lowerName.includes('argent')) {
    return 'silver';
  } else if (lowerSymbol.includes('cu') || lowerName.includes('copper') || lowerName.includes('cuivre')) {
    return 'copper';
  } else if (lowerSymbol.includes('al') || lowerName.includes('alum')) {
    return 'aluminum';
  } else if (lowerSymbol.includes('co') || lowerName.includes('cobalt')) {
    return 'cobalt';
  }
  
  return 'other';
}

/**
 * Analyse les données HTML pour extraire les informations des matières premières
 */
function parseCommoditiesData(data: any): Commodity[] {
  try {
    console.log("Parsing data from API response");
    
    // Vérifier si nous avons des données
    if (!data || !data.data) {
      console.error("Données invalides reçues de l'API");
      throw new Error("Données invalides reçues de l'API");
    }
    
    // Parseage du HTML
    const htmlContent = data.data;
    console.log("HTML content length:", htmlContent.length);
    
    // Utilisation de node-html-parser pour analyser le HTML
    const root = parse(htmlContent);
    
    // Log the full HTML to see its structure
    console.log("HTML structure:", root.toString().substring(0, 1000));
    
    // Essayer différentes sélections pour trouver les données
    // Sélection 1: Tableaux de données
    let commodityRows = root.querySelectorAll('.tv-data-table__row');
    console.log("Data table rows found:", commodityRows.length);
    
    // Sélection 2: Si la sélection 1 ne fonctionne pas, essayer une autre sélection
    if (!commodityRows || commodityRows.length === 0) {
      commodityRows = root.querySelectorAll('tr[data-rowid]');
      console.log("Row data found with tr[data-rowid]:", commodityRows.length);
    }

    // Sélection 3: Essayer une sélection plus générique
    if (!commodityRows || commodityRows.length === 0) {
      commodityRows = root.querySelectorAll('table tr');
      console.log("Generic table rows found:", commodityRows.length);
    }
    
    if (!commodityRows || commodityRows.length === 0) {
      console.error("Aucune ligne de matière première trouvée dans le HTML");
      // Log a sample of the HTML for debugging
      console.log("HTML sample:", htmlContent.substring(0, 1000));
      throw new Error("Échec de l'extraction des données");
    }
    
    const commodities: Commodity[] = [];
    
    commodityRows.forEach((row, index) => {
      try {
        console.log(`Processing row ${index}:`, row.toString().substring(0, 200));
        
        // Extraire les données de chaque cellule
        const cells = row.querySelectorAll('td');
        
        if (!cells || cells.length < 6) {
          console.log(`Row ${index}: Not enough cells (${cells?.length || 0}), skipping`);
          return; // Ligne incomplète, on saute
        }
        
        // Extraire le symbole et le nom
        const firstCell = cells[0];
        console.log(`Row ${index}, First cell:`, firstCell.toString());
        
        let symbol = '';
        let name = '';
        
        // Essayer d'extraire le symbole et le nom avec différentes méthodes
        const symbolElement = firstCell.querySelector('.symbol-name');
        if (symbolElement) {
          symbol = symbolElement.text.trim();
          name = symbolElement.getAttribute('title') || '';
        } else {
          // Autre méthode d'extraction
          const allText = firstCell.text.trim();
          const parts = allText.split(/\s+/);
          symbol = parts[0] || '';
          name = parts.slice(1).join(' ');
        }
        
        if (!symbol) {
          console.log(`Row ${index}: No symbol found, skipping`);
          return;
        }
        
        // Extraire les autres informations
        console.log(`Row ${index}: Processing price from cell 1`);
        const priceText = cells[1]?.text.trim().replace(/[^\d.,]/g, '').replace(',', '.');
        const price = parseFloat(priceText) || 0;
        
        console.log(`Row ${index}: Processing percent change from cell 2`);
        const percentChangeText = cells[2]?.text.trim().replace(/[^-\d.,]/g, '').replace(',', '.');
        const percentChange = parseFloat(percentChangeText) || 0;
        
        console.log(`Row ${index}: Processing absolute change from cell 3`);
        const absoluteChangeText = cells[3]?.text.trim().replace(/[^-\d.,]/g, '').replace(',', '.');
        const absoluteChange = parseFloat(absoluteChangeText) || 0;
        
        console.log(`Row ${index}: Processing high from cell 4`);
        const highText = cells[4]?.text.trim().replace(/[^\d.,]/g, '').replace(',', '.');
        const high = parseFloat(highText) || 0;
        
        console.log(`Row ${index}: Processing low from cell 5`);
        const lowText = cells[5]?.text.trim().replace(/[^\d.,]/g, '').replace(',', '.');
        const low = parseFloat(lowText) || 0;
        
        // Évaluation technique (si disponible)
        console.log(`Row ${index}: Processing evaluation from cell 6`);
        const technicalEvaluation = cells[6]?.text.trim() || 'Neutre';
        
        // Déterminer le type de matière première
        const type = getCommodityType(symbol, name);
        
        commodities.push({
          symbol,
          name,
          price,
          percentChange,
          absoluteChange,
          high,
          low,
          technicalEvaluation,
          type
        });
        
        console.log(`Successfully processed commodity: ${symbol}`);
      } catch (err) {
        console.error(`Erreur lors de l'analyse de la ligne ${index}:`, err);
      }
    });
    
    if (commodities.length === 0) {
      console.error("Aucune matière première n'a pu être extraite");
      throw new Error("Aucune matière première n'a pu être extraite");
    }
    
    console.log(`Successfully extracted ${commodities.length} commodities`);
    return commodities;
  } catch (error) {
    console.error('Erreur lors de l\'analyse des données:', error);
    throw error;
  }
}
