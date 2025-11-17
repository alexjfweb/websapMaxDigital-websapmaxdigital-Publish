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
    
    // Buscar la regla que coincida con el nombre del plato inicial.
    // Esto podría mejorarse para usar IDs en el futuro, pero por ahora usamos el nombre.
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
    } else {
        // Si no hay condición de hora, o no está activa, se podría definir un comportamiento por defecto.
        // Por ahora, si no hay condición de hora, se considera como NO cumplida.
        conditionMet = false;
    }
    
    // Seleccionar la acción a tomar basada en si la condición se cumplió o no.
    const action = conditionMet ? applicableRule.actions.yes : applicableRule.actions.no;

    console.log(`[Evaluate Rules] Regla encontrada para "${initialDish.name}". Condición de hora pico (${conditionMet ? 'SÍ' : 'NO'}). Acción: ${action.type} -> ${action.product}`);

    return {
        suggestionType: action.type,
        suggestedProduct: action.product,
        message: action.message,
    };
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
    
    console.log(`[Suggestion Flow] Buscando sugerencia para la compañía ${request.companyId} y el plato ${request.initialDishId}`);

    // La lógica de evaluación de reglas ahora está centralizada.
    const ruleBasedSuggestion = await evaluateRules(request);

    if (ruleBasedSuggestion.suggestionType !== 'none') {
        return ruleBasedSuggestion;
    }

    // Fallback: Si ninguna regla coincide, se podría llamar a un LLM para una sugerencia genérica.
    // Esta parte se puede implementar en el futuro.
    console.log('[Suggestion Flow] Ninguna regla aplicable. Se podría llamar a un LLM aquí como fallback.');

    return { suggestionType: 'none', message: 'No hay sugerencias por ahora.' };
  }
);
