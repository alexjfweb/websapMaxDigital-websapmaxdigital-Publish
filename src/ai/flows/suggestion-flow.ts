

'use server';
/**
 * @fileOverview Flow de IA para generar sugerencias de productos.
 *
 * - getProductSuggestion - Lógica principal para obtener una sugerencia.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { suggestionRuleService, SuggestionRule } from '@/services/suggestion-rules-service';
import { dishService } from '@/services/dish-service';
import type { Dish } from '@/types';


export const SuggestionRequestSchema = z.object({
  companyId: z.string().describe('ID de la compañía para la cual se busca una sugerencia.'),
  initialDishId: z.string().describe('ID del plato que el cliente ha seleccionado.'),
  currentTime: z.string().optional().describe('Hora actual en formato HH:mm para evaluar condiciones.'),
});
export type SuggestionRequest = z.infer<typeof SuggestionRequestSchema>;

export const SuggestionResponseSchema = z.object({
  suggestionType: z.enum(['cross-sell', 'upsell', 'none']).describe('El tipo de sugerencia.'),
  suggestedProduct: z.string().optional().describe('El nombre del producto sugerido.'),
  message: z.string().optional().describe('El mensaje para mostrar al cliente.'),
});
export type SuggestionResponse = z.infer<typeof SuggestionResponseSchema>;


// Función que evalúa las reglas de negocio obtenidas de la base de datos.
async function evaluateRules(request: SuggestionRequest): Promise<SuggestionResponse> {
    const allDishes = await dishService.getDishesByCompany(request.companyId);
    const initialDish = allDishes.find(d => d.id === request.initialDishId);

    if (!initialDish) {
        console.warn(`[Evaluate Rules] Plato inicial con ID ${request.initialDishId} no encontrado.`);
        return { suggestionType: 'none' };
    }

    const rules = await suggestionRuleService.getRulesByCompany(request.companyId);
    
    const applicableRule = rules.find(rule => 
        rule.initialDish.trim().toLowerCase() === initialDish.name.trim().toLowerCase()
    );

    if (!applicableRule) {
        console.log(`[Evaluate Rules] No se encontró una regla para el plato: ${initialDish.name}`);
        return { suggestionType: 'none' };
    }

    const condition = applicableRule.condition;
    let conditionMet = false;

    // Evaluar la condición de horario pico si está activa.
    if (condition.type === 'peakTime' && condition.active && request.currentTime) {
        const startTime = condition.startTime || '00:00';
        const endTime = condition.endTime || '23:59';
        if (request.currentTime >= startTime && request.currentTime <= endTime) {
            conditionMet = true;
        }
    } else if (condition.type !== 'peakTime' || !condition.active) {
        // Si no hay condición de horario pico o no está activa, la condición "verdadero/falso" no se aplica.
        // En este caso, la acción a tomar debería ser la predeterminada o "NO".
        conditionMet = false;
    }
    
    // Seleccionar la acción a tomar basada en si la condición se cumplió o no.
    const action = conditionMet ? applicableRule.actions.yes : applicableRule.actions.no;
    
    // Si la acción para la condición evaluada es 'ninguna' o no tiene producto, no hay sugerencia.
    if (!action || action.type === 'none' || !action.product) {
      // Devolver una acción 'no' válida si la acción 'sí' falla pero la 'no' existe
      if (!conditionMet && applicableRule.actions.no.product) {
         return {
            suggestionType: applicableRule.actions.no.type as 'cross-sell' | 'upsell' | 'none',
            suggestedProduct: applicableRule.actions.no.product,
            message: applicableRule.actions.no.message,
        };
      }
      return { suggestionType: 'none' };
    }

    console.log(`[Evaluate Rules] Regla encontrada para "${initialDish.name}". Condición de hora pico (${conditionMet ? 'SÍ' : 'NO'}). Acción: ${action.type} -> ${action.product}`);

    return {
        suggestionType: action.type as 'cross-sell' | 'upsell' | 'none',
        suggestedProduct: action.product,
        message: action.message,
    };
}

// Esquema de entrada para el prompt de IA
const AISuggestionInputSchema = z.object({
  initialDishName: z.string(),
  availableDishes: z.array(z.string()),
});

// NUEVO: Prompt de Genkit para la sugerencia de IA
const aiSuggestionPrompt = ai.definePrompt({
    name: 'aiProductSuggestion',
    input: { schema: AISuggestionInputSchema },
    output: { schema: SuggestionResponseSchema },
    prompt: `Eres un mesero experto en un restaurante. Un cliente ha añadido "{{initialDishName}}" a su carrito. 
    Tu tarea es recomendar OTRO producto de la lista de platos disponibles que complemente bien su elección.

    Lista de platos disponibles:
    {{#each availableDishes}}
    - {{this}}
    {{/each}}

    Basado en el plato inicial y la lista, elige la mejor recomendación.
    - Si encuentras un buen acompañamiento, responde con "cross-sell".
    - Si encuentras una versión mejor o más grande del mismo plato, responde con "upsell".
    - El nombre del producto sugerido debe ser EXACTAMENTE como aparece en la lista.
    - Crea un mensaje corto y amigable para el cliente animándolo a añadir tu sugerencia.

    Si no encuentras una buena recomendación, responde con "none".`,
});


export async function getProductSuggestion(request: SuggestionRequest): Promise<SuggestionResponse> {
  return productSuggestionFlow(request);
}

// FLUJO PRINCIPAL ACTUALIZADO
const productSuggestionFlow = ai.defineFlow(
  {
    name: 'productSuggestionFlow',
    inputSchema: SuggestionRequestSchema,
    outputSchema: SuggestionResponseSchema,
  },
  async (request) => {
    
    console.log(`[Suggestion Flow] Buscando sugerencia para la compañía ${request.companyId} y el plato ${request.initialDishId}`);

    // 1. Intentar obtener una sugerencia basada en reglas de negocio
    const ruleBasedSuggestion = await evaluateRules(request);

    if (ruleBasedSuggestion.suggestionType !== 'none') {
        console.log('[Suggestion Flow] Se encontró una regla de negocio. Devolviendo sugerencia de regla.');
        return ruleBasedSuggestion;
    }

    // 2. Fallback: Si no hay reglas, usar IA (si está configurada)
    console.log('[Suggestion Flow] Ninguna regla aplicable. Intentando fallback con IA.');
    
    // Obtener todos los platos para que la IA pueda elegir
    const allDishes = await dishService.getDishesByCompany(request.companyId);
    const initialDish = allDishes.find(d => d.id === request.initialDishId);

    if (!initialDish) {
        console.warn('[Suggestion Flow] No se encontró el plato inicial para el fallback de IA.');
        return { suggestionType: 'none' };
    }
    
    // Filtrar para no sugerir el mismo plato y solo los que tienen stock
    const availableDishNames = allDishes
        .filter(d => d.id !== initialDish.id && (d.stock === -1 || d.stock > 0))
        .map(d => d.name);

    if (availableDishNames.length === 0) {
        console.log('[Suggestion Flow] No hay otros platos disponibles para sugerir.');
        return { suggestionType: 'none' };
    }

    try {
        const { output } = await aiSuggestionPrompt({
            initialDishName: initialDish.name,
            availableDishes: availableDishNames,
        });

        if (output && output.suggestionType !== 'none' && output.suggestedProduct) {
             // Verificación robusta: Asegurarse de que el producto sugerido existe en la lista de platos disponibles
            const suggestedProductExists = availableDishNames.some(name => name.toLowerCase() === output.suggestedProduct!.toLowerCase());
            if (suggestedProductExists) {
                console.log(`[Suggestion Flow] IA generó una sugerencia válida: ${output.suggestedProduct}`);
                return output;
            } else {
                 console.warn(`[Suggestion Flow] La IA sugirió un producto no existente: "${output.suggestedProduct}". Se descarta la sugerencia.`);
                return { suggestionType: 'none' };
            }
        } else {
            console.log('[Suggestion Flow] La IA decidió no hacer una sugerencia.');
            return { suggestionType: 'none' };
        }
    } catch (error) {
        console.error("[Suggestion Flow] Error al llamar al modelo de IA. Esto puede deberse a que la API Key no está configurada o es inválida.", error);
        // Devolver 'none' si falla la llamada a la IA para no romper la experiencia.
        return { suggestionType: 'none' };
    }
  }
);
