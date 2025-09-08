
"use client";

import useSWR from 'swr';
import { useSession } from '@/contexts/session-context';
import { useSubscription } from '@/hooks/use-subscription';
import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

interface PlanLimits {
  current: {
    tables: number;
    reservations: number;
    employees: number;
  };
  max: {
    tables: number;
    reservations: number;
    employees: number;
  };
  reached: {
    tables: boolean;
    reservations: boolean;
    employees: boolean;
  };
}

const fetchCurrentUsage = async (companyId: string): Promise<{ tables: number; reservations: number; employees: number }> => {
  const db = getDb();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch tables
  const tablesQuery = query(collection(db, 'tables'), where('restaurantId', '==', companyId));
  const tablesSnapshot = await getDocs(tablesQuery);
  const tablesCount = tablesSnapshot.size;

  // Fetch reservations this month
  const reservationsQuery = query(
    collection(db, 'reservations'),
    where('restaurantId', '==', companyId),
    where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
  );
  const reservationsSnapshot = await getDocs(reservationsQuery);
  const reservationsCount = reservationsSnapshot.size;

  // Fetch employees
  const employeesQuery = query(collection(db, 'users'), where('companyId', '==', companyId), where('role', '==', 'employee'));
  const employeesSnapshot = await getDocs(employeesQuery);
  const employeesCount = employeesSnapshot.size;

  return { tables: tablesCount, reservations: reservationsCount, employees: employeesCount };
};

const getDefaultLimits = (): PlanLimits => ({
  current: { tables: 0, reservations: 0, employees: 0 },
  max: { tables: -1, reservations: -1, employees: -1 },
  reached: { tables: false, reservations: false, employees: false },
});

export function usePlanLimits() {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();
  const companyId = currentUser?.companyId;

  const { data: usage, error, isLoading: isUsageLoading } = useSWR(
    companyId ? ['usage', companyId] : null,
    ([, id]) => fetchCurrentUsage(id as string),
    { revalidateOnFocus: false }
  );

  const isLoading = isSessionLoading || isSubscriptionLoading || isUsageLoading;

  const plan = subscription?.plan;
  const limits: PlanLimits = getDefaultLimits();

  if (plan && usage) {
    const maxLimits = {
      tables: plan.maxProjects ?? 5, // Usando maxProjects para mesas como en la auditoría
      reservations: plan.name === 'Plan Gratuito' ? 10 : plan.name === 'Plan Básico' ? 50 : plan.name === 'Plan Gratis Lite' ? 5 : -1,
      employees: plan.maxUsers ?? 5,
    };

    limits.current = usage;
    limits.max = maxLimits;

    limits.reached.tables = maxLimits.tables === -1 ? false : usage.tables >= maxLimits.tables;
    limits.reached.reservations = maxLimits.reservations === -1 ? false : usage.reservations >= maxLimits.reservations;
    limits.reached.employees = maxLimits.employees === -1 ? false : usage.employees >= maxLimits.employees;
  }

  return {
    limits,
    isLimitsLoading: isLoading,
    error,
  };
}
