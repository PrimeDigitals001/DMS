import { Pipe, PipeTransform } from '@angular/core';
import { ClientVDM } from '../models/client.vdm';

@Pipe({
  name: 'searchFilter',
  standalone: true,
  pure: true
})
export class SearchFilterPipe implements PipeTransform {

  transform(clients: ClientVDM[], searchQuery: string): ClientVDM[] {
    if (!searchQuery) return clients;
    const query = searchQuery.toLowerCase().trim();
    return clients.filter(
      c =>
        c.client.toLowerCase().includes(query) ||
        c.ownerName.toLowerCase().includes(query)
    );
  }
}
