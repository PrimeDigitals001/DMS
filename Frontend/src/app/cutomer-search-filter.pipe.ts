import { Pipe, PipeTransform } from '@angular/core';
import { CustomerVDM } from './shared/models/customer.vdm';

@Pipe({
  name: 'customerSearchFilter',
  standalone: true,
  pure: true,
})
export class CustomerSearchFilterPipe implements PipeTransform {
  transform(customers: CustomerVDM[] | null | undefined, searchQuery: string | null | undefined): CustomerVDM[] {
    if (!customers || customers.length === 0) return [];
    if (!searchQuery || !searchQuery.trim()) return customers;

    const q = searchQuery.toLowerCase().trim();
    const qDigits = searchQuery.replace(/\D/g, '');

    return customers.filter((c) => {
      const name = (c.customerName ?? '').toLowerCase();
      const rfid = (c.rfid ?? '').toLowerCase();
      const phoneDigits = (c.phoneNumber ?? '').replace(/\D/g, '');
      return (
        name.includes(q) ||
        rfid.includes(q) ||
        (qDigits.length > 0 && phoneDigits.includes(qDigits))
      );
    });
  }
}