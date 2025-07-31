import React from 'react';
import { ServicesContent } from '@/components/services/ServicesContent';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-3 sm:px-6 md:px-8">
        <ServicesContent />
      </div>
    </div>
  );
}