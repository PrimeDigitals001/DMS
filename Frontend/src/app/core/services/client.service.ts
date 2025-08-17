import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ClientVDM } from '../../shared/models/client.vdm';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private baseUrl = 'http://localhost:3000/api/super-admin/clients';

  constructor(private http: HttpClient) {}

  createClient(client: ClientVDM): Observable<ClientVDM> {
    return this.http
      .post(this.baseUrl, client.toRemote())
      .pipe(map((res) => ClientVDM.toLocal(res)));
  }

  updateClient(id: string, client: ClientVDM): Observable<ClientVDM> {
    return this.http
      .put(`${this.baseUrl}/${id}`, client.toRemote())
      .pipe(map((res) => ClientVDM.toLocal(res)));
  }

  getClients(): Observable<ClientVDM[]> {
    return this.http
      .get<any>(this.baseUrl)
      .pipe(map((res) => res.data.map((item: any) => ClientVDM.toLocal(item))));
  }

  getClientById(id: string): Observable<ClientVDM> {
    return this.http
      .get(`${this.baseUrl}/${id}`)
      .pipe(map((res) => ClientVDM.toLocal(res)));
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
