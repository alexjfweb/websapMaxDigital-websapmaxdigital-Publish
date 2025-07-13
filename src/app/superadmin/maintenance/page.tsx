"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DatabaseZap, PlayCircle, HardDriveDownload, Wrench, ShieldAlert } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminMaintenancePage() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleAction = (actionName: string) => {
    toast({
      title: t('superAdminMaintenance.toast.actionTriggeredTitle'),
      description: t('superAdminMaintenance.toast.actionTriggeredDescription', { actionName }),
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{t('superAdminMaintenance.title')}</h1>
      <p className="text-lg text-muted-foreground">{t('superAdminMaintenance.description')}</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Cache Management Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <HardDriveDownload className="h-8 w-8 text-primary" />
              <CardTitle>{t('superAdminMaintenance.cacheCard.title')}</CardTitle>
            </div>
            <CardDescription>{t('superAdminMaintenance.cacheCard.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleAction(t('superAdminMaintenance.cacheCard.actionName'))}>
              <PlayCircle className="mr-2 h-5 w-5" />
              {t('superAdminMaintenance.cacheCard.clearButton')}
            </Button>
          </CardContent>
        </Card>

        {/* Database Maintenance Card */}
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <DatabaseZap className="h-8 w-8 text-primary" />
              <CardTitle>{t('superAdminMaintenance.dbCard.title')}</CardTitle>
            </div>
            <CardDescription>{t('superAdminMaintenance.dbCard.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={() => handleAction(t('superAdminMaintenance.dbCard.actionName'))}>
              <PlayCircle className="mr-2 h-5 w-5" />
              {t('superAdminMaintenance.dbCard.reindexButton')}
            </Button>
          </CardContent>
        </Card>

        {/* System Diagnostics Card */}
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-primary" />
              <CardTitle>{t('superAdminMaintenance.diagnosticsCard.title')}</CardTitle>
            </div>
            <CardDescription>{t('superAdminMaintenance.diagnosticsCard.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={() => handleAction(t('superAdminMaintenance.diagnosticsCard.actionName'))}>
              <PlayCircle className="mr-2 h-5 w-5" />
              {t('superAdminMaintenance.diagnosticsCard.runButton')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Mode Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-destructive" />
              <CardTitle>{t('superAdminMaintenance.modeCard.title')}</CardTitle>
            </div>
          <CardDescription>{t('superAdminMaintenance.modeCard.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {t('superAdminMaintenance.modeCard.enableLabel')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('superAdminMaintenance.modeCard.enableDescription')}
              </p>
            </div>
            <Switch id="maintenance-mode" aria-label={t('superAdminMaintenance.modeCard.ariaLabel')} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
