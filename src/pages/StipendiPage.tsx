
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StipendiPage() {
  const { profile } = useAuth();

  // Verifica accesso solo per admin
  if (profile && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Stipendi</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gestione Stipendi</h1>
        </div>

        {/* Contenuto temporaneo */}
        <Card>
          <CardHeader>
            <CardTitle>Modulo Stipendi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Modulo stipendi in costruzione. Qui sarà possibile gestire i calcoli degli stipendi per dipendenti e soci.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
