import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';
import { ClientVDM } from '../../shared/models/client.vdm';
import { db } from '../../../firebase.config';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private collectionName = 'clients';

  constructor() {}

  createClient(client: ClientVDM): Observable<ClientVDM> {
    return from(addDoc(collection(db, this.collectionName), client.toRemote())).pipe(
      map((docRef) => {
        const newClient = new ClientVDM({ ...client.toRemote(), _id: docRef.id });
        return newClient;
      })
    );
  }

  updateClient(id: string, client: ClientVDM): Observable<ClientVDM> {
    const docRef = doc(db, this.collectionName, id);
    return from(updateDoc(docRef, client.toRemote())).pipe(
      map(() => {
        const updatedClient = new ClientVDM({ ...client.toRemote(), _id: id });
        return updatedClient;
      })
    );
  }

  getClients(): Observable<ClientVDM[]> {
    return from(getDocs(collection(db, this.collectionName))).pipe(
      map((querySnapshot) => {
        const clients: ClientVDM[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          clients.push(ClientVDM.toLocal({ ...data, _id: doc.id }));
        });
        return clients;
      })
    );
  }

  getClientById(id: string): Observable<ClientVDM> {
    const docRef = doc(db, this.collectionName, id);
    return from(getDocs(query(collection(db, this.collectionName), where('__name__', '==', id)))).pipe(
      map((querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          return ClientVDM.toLocal({ ...data, _id: doc.id });
        }
        throw new Error('Client not found');
      })
    );
  }

  deleteClient(id: string): Observable<any> {
    const docRef = doc(db, this.collectionName, id);
    return from(deleteDoc(docRef));
  }
}
