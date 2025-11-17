'use server';
/**
 * @fileOverview Flow de IA para generar sugerencias de productos.
 *
 * - getProductSuggestion - Lógica principal para obtener una sugerencia.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { suggestionRuleService, SuggestionRule } from '@/services/suggestion-rules-service';

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


// Placeholder para la lógica de evaluación de reglas
async function evaluateRules(request: SuggestionRequest): Promise<SuggestionResponse> {
    const rules = await suggestionRuleService.getRulesByCompany(request.companyId);
    const initialDishRule = rules.find(rule => rule.initialDish.toLowerCase() === 'hamburguesa clásica'); // Mockup: buscar una regla específica

    if (initialDishRule) {
        const condition = initialDishRule.condition;
        let conditionMet = false;

        if (condition.type === 'peakTime' && condition.active && request.currentTime) {
            if (request.currentTime >= (condition.startTime || '00:00') && request.currentTime <= (condition.endTime || '23:59')) {
                conditionMet = true;
            }
        }
        
        const action = conditionMet ? initialDishRule.actions.yes : initialDishRule.actions.no;

        return {
            suggestionType: action.type,
            suggestedProduct: action.product,
            message: action.message,
        };
    }

    return { suggestionType: 'none' };
}


export async function getProductSuggestion(request: SuggestionRequest): Promise<SuggestionResponse> {
  return productSuggestionFlow(request);
}

const productSuggestionFlow = ai.defineFlow(
  {
    name: 'productSuggestionFlow',
    inputSchema: SuggestionRequestSchema,
    outputSchema: SuggestionResponseSchema,
  },
  async (request) => {
    
    // Aquí es donde en el futuro se llamaría al modelo de IA configurado.
    // Por ahora, usamos la lógica de reglas simple.
    
    console.log(`[Suggestion Flow] Buscando sugerencia para la compañía ${request.companyId} y el plato ${request.initialDishId}`);

    const ruleBasedSuggestion = await evaluateRules(request);

    if (ruleBasedSuggestion.suggestionType !== 'none') {
        return ruleBasedSuggestion;
    }

    // Fallback: si ninguna regla coincide, se podría llamar a un LLM para una sugerencia genérica.
    // (Lógica futura)

    return { suggestionType: 'none', message: 'No hay sugerencias por ahora.' };
  }
);
