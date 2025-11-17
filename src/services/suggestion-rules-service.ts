import { getDb } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

export interface SuggestionRule {
  id: string;
  companyId: string;
  initialDish: string;
  condition: {
    type: 'peakTime' | 'dayOfWeek';
    active: boolean;
    startTime?: string;
    endTime?: string;
    days?: number[];
  };
  actions: {
    yes: {
      type: 'cross-sell' | 'upsell';
      product: string;
      message: string;
    };
    no: {
      type: 'cross-sell' | 'upsell';
      product: string;
      message: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

class SuggestionRuleService {
  private get rulesCollection() {
    const db = getDb();
    return collection(db, 'suggestionRules');
  }

  async createRule(ruleData: Omit<SuggestionRule, 'id'>): Promise<string> {
    const docRef = await addDoc(this.rulesCollection, ruleData);
    return docRef.id;
  }

  async getRulesByCompany(companyId: string): Promise<SuggestionRule[]> {
    const q = query(this.rulesCollection, where('companyId', '==', companyId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SuggestionRule));
  }

  async updateRule(ruleId: string, updates: Partial<SuggestionRule>): Promise<void> {
    const ruleRef = doc(this.rulesCollection, ruleId);
    await updateDoc(ruleRef, { ...updates, updatedAt: new Date() });
  }

  async deleteRule(ruleId: string): Promise<void> {
    const ruleRef = doc(this.rulesCollection, ruleId);
    await deleteDoc(ruleRef);
  }
}

export const suggestionRuleService = new SuggestionRuleService();
