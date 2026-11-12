'use client';

import React from 'react';
import AdminGuard from '../../../../src/admin/AdminGuard';
import RentalAnalyzerContainer from '../../../../components/calculators/rental-analyzer/RentalAnalyzerContainer';

export default function AdminRentalAnalyzerPage() {
  return (
    <AdminGuard moduleId="rental-analyzer">
      <RentalAnalyzerContainer mode="admin" />
    </AdminGuard>
  );
}
