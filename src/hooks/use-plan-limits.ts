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
    orders: number;
  };
  max: {
    tables: number;
    reservations: number;
    employees: number;
    orders: number;
  };
  reached: {
    tables: boolean;
    reservations: boolean;
    employees: boolean;
    orders: boolean;
  };
}

const fetchCurrentUsage = async (companyId: string): Promise<{ tables: number; reservations: number; employees: number; orders: number }> => {
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

  // Fetch orders this month
  const ordersQuery = query(
    collection(db, 'orders'),
    where('restaurantId', '==', companyId),
    where('date', '>=', Timestamp.fromDate(startOfMonth))
  );
  const ordersSnapshot = await getDocs(ordersQuery);
  const ordersCount = ordersSnapshot.size;

  return { tables: tablesCount, reservations: reservationsCount, employees: employeesCount, orders: ordersCount };
};

const getDefaultLimits = (): PlanLimits => ({
  current: { tables: 0, reservations: 0, employees: 0, orders: 0 },
  max: { tables: -1, reservations: -1, employees: -1, orders: -1 },
  reached: { tables: false, reservations: false, employees: false, orders: false },
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
      tables: plan.maxProjects ?? -1,
      reservations: plan.maxReservations ?? -1, // Leer directamente del plan
      employees: plan.maxUsers ?? -1,
      orders: plan.maxOrders ?? -1,
    };

    limits.current = usage;
    limits.max = maxLimits;

    limits.reached.tables = maxLimits.tables === -1 ? false : usage.tables >= maxLimits.tables;
    limits.reached.reservations = maxLimits.reservations === -1 ? false : usage.reservations >= maxLimits.reservations;
    limits.reached.employees = maxLimits.employees === -1 ? false : usage.employees >= maxLimits.employees;
    limits.reached.orders = maxLimits.orders === -1 ? false : usage.orders >= maxLimits.orders;
  }

  return {
    limits,
    isLimitsLoading: isLoading,
    error,
  };
}
