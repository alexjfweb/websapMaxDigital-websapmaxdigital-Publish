
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gem, CreditCard, QrCode, History, Save, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { format } from "date-fns";

// Mock Data
const subscriptionPlans = [
  { id: "basic", featuresCount: 4 },
  { id: "pro", featuresCount: 4 },
  { id: "enterprise", featuresCount: 4 },
];

const mockTransactions = [
  { id: "txn_1", company: "The Burger Joint", plan: "Pro", amount: 25.00, date: new Date("2024-07-31T10:00:00Z"), status: "Completed" },
  { id: "txn_2", company: "Pizza Palace", plan: "Basic", amount: 10.00, date: new Date("2024-07-30T11:00:00Z"), status: "Completed" },
  { id: "txn_3", company: "Sushi Central", plan: "Pro", amount: 25.00, date: new Date("2024-07-29T12:00:00Z"), status: "Failed" },
];

export default function SuperAdminSubscriptionsPage() {
  const { t } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return <Badge className="bg-green-500 text-white hover:bg-green-600">{t('superAdminSubscriptions.transactions.statusCompleted')}</Badge>;
      case "Failed": return <Badge variant="destructive">{t('superAdminSubscriptions.transactions.statusFailed')}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">{t('superAdminSubscriptions.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('superAdminSubscriptions.description')}</p>
      </div>

      {/* Subscription Plans Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gem className="h-5 w-5" /> {t('superAdminSubscriptions.plans.title')}</CardTitle>
          <CardDescription>{t('superAdminSubscriptions.plans.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          {subscriptionPlans.map(plan => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{t(`superAdminSubscriptions.plans.${plan.id}.name`)}</CardTitle>
                <p className="text-2xl font-bold text-primary">{t(`superAdminSubscriptions.plans.${plan.id}.price`)}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {Array.from({ length: plan.featuresCount }).map((_, index) => (
                    <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{t(`superAdminSubscriptions.plans.${plan.id}.features.${index}`)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full">{t('superAdminSubscriptions.plans.manageButton')}</Button>
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Payment Methods Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> {t('superAdminSubscriptions.paymentMethods.title')}</CardTitle>
          <CardDescription>{t('superAdminSubscriptions.paymentMethods.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stripe */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="stripe-enabled" className="text-lg font-semibold">{t('superAdminSubscriptions.paymentMethods.stripe.title')}</Label>
              <Switch id="stripe-enabled" defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe-pk">{t('superAdminSubscriptions.paymentMethods.stripe.publishableKey')}</Label>
              <Input id="stripe-pk" placeholder="pk_test_..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe-sk">{t('superAdminSubscriptions.paymentMethods.stripe.secretKey')}</Label>
              <Input id="stripe-sk" type="password" placeholder="sk_test_..." />
            </div>
          </div>
          
          {/* Mercado Pago */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="mp-enabled" className="text-lg font-semibold">{t('superAdminSubscriptions.paymentMethods.mercadoPago.title')}</Label>
              <Switch id="mp-enabled" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="mp-token">{t('superAdminSubscriptions.paymentMethods.mercadoPago.accessToken')}</Label>
              <Input id="mp-token" type="password" placeholder="APP_USR-..." />
            </div>
          </div>

          {/* Nequi */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="nequi-enabled" className="text-lg font-semibold">{t('superAdminSubscriptions.paymentMethods.nequi.title')}</Label>
              <Switch id="nequi-enabled" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="nequi-phone">{t('superAdminSubscriptions.paymentMethods.nequi.phoneNumber')}</Label>
              <Input id="nequi-phone" placeholder="3001234567" />
            </div>
          </div>

          <div className="flex justify-end">
             <Button><Save className="mr-2 h-4 w-4" /> {t('superAdminSubscriptions.paymentMethods.saveButton')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" /> {t('superAdminSubscriptions.qr.title')}</CardTitle>
          <CardDescription>{t('superAdminSubscriptions.qr.description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <Button>{t('superAdminSubscriptions.qr.generateButton')}</Button>
             {/* TODO: List of generated QRs here */}
        </CardContent>
      </Card>
      
      {/* Transaction History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> {t('superAdminSubscriptions.transactions.title')}</CardTitle>
          <CardDescription>{t('superAdminSubscriptions.transactions.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('superAdminSubscriptions.transactions.table.company')}</TableHead>
                <TableHead>{t('superAdminSubscriptions.transactions.table.plan')}</TableHead>
                <TableHead className="text-right">{t('superAdminSubscriptions.transactions.table.amount')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('superAdminSubscriptions.transactions.table.date')}</TableHead>
                <TableHead className="text-center">{t('superAdminSubscriptions.transactions.table.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.company}</TableCell>
                  <TableCell>{t(`superAdminSubscriptions.plans.${tx.plan.toLowerCase()}.name`)}</TableCell>
                  <TableCell className="text-right">${tx.amount.toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{format(tx.date, "PPp")}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(tx.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
