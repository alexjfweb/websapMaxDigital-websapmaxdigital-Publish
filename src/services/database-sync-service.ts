// src/services/database-sync-service.ts
import { getDb } from '@/lib/firebase';
import { landingPlansService } from './landing-plans-service';
import { landingConfigService } from './landing-config-service';
import { navigationService } from './navigation-service';
import { auditService } from './audit-service';

// Lista de colecciones que se espera que existan
const CORE_COLLECTIONS = [
  'users', 
  'companies', 
  'dishes', 
  'orders', 
  'reservations', 
  'tables', 
  'landingPlans', 
  'landing_configs', 
  'configuration', // Para la navegación
  'globalAuditLogs',
  'payment_configs', // Para la configuración de pagos por compañía
  'menu_styles',     // Para la personalización del menú por compañía
  'supportTickets',  // Para tickets de soporte
  'payment_methods', // Para la configuración de pasarelas de pago de superadmin
];

class DatabaseSyncService {

  async syncAll(userId: string, userEmail: string): Promise<string> {
    console.log('🔄 Iniciando sincronización de la base de datos...');
    
    let messages: string[] = [];

    // 1. Sincronizar Planes de Aterrizaje
    try {
      const planResult = await landingPlansService.initializeDefaultPlans(userId, userEmail);
      messages.push(planResult);
    } catch (e: any) {
      messages.push(`❌ Error al sincronizar planes: ${e.message}`);
    }

    // 2. Sincronizar Configuración de Landing Page
    try {
      const configResult = await landingConfigService.initializeDefaultConfig(userId, userEmail);
      messages.push(configResult);
    } catch (e: any) {
      messages.push(`❌ Error al sincronizar config de landing: ${e.message}`);
    }
    
    // 3. Sincronizar Configuración de Navegación
    try {
        const navResult = await navigationService.checkAndInitializeDefaultConfig();
        messages.push(navResult);
    } catch (e: any) {
        messages.push(`❌ Error al sincronizar navegación: ${e.message}`);
    }

    // Puedes añadir más sincronizaciones aquí...

    const finalMessage = `Sincronización completada. Resultados:\n- ${messages.join('\n- ')}`;
    console.log(`✅ ${finalMessage}`);

    await auditService.log({
        entity: 'system' as any,
        entityId: 'database-sync',
        action: 'updated',
        performedBy: { uid: userId, email: userEmail },
        details: 'Se ejecutó el proceso de sincronización de la base de datos.',
        newData: { summary: finalMessage }
    });

    return finalMessage;
  }
}

export const databaseSyncService = new DatabaseSyncService();
