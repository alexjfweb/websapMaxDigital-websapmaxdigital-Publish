
import { z } from "zod";

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
