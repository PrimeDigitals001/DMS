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
  where,
} from 'firebase/firestore';
import { CustomerVDM } from '../../shared/models/customer.vdm';
import { db } from '../../../firebase.config';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private collectionName = 'customers';

  constructor() {}

  createCustomer(customer: CustomerVDM): Observable<CustomerVDM> {
    return from(addDoc(collection(db, this.collectionName), customer.toRemote())).pipe(
      map((docRef) => new CustomerVDM({ ...customer.toRemote(), _id: docRef.id }))
    );
  }

  updateCustomer(id: string, customer: CustomerVDM): Observable<CustomerVDM> {
    const docRef = doc(db, this.collectionName, id);
    return from(updateDoc(docRef, customer.toRemote())).pipe(
      map(() => new CustomerVDM({ ...customer.toRemote(), _id: id }))
    );
  }

  getCustomers(): Observable<CustomerVDM[]> {
    return from(getDocs(collection(db, this.collectionName))).pipe(
      map((querySnapshot) => {
        const customers: CustomerVDM[] = [];
        querySnapshot.forEach((d) => {
          const data = d.data();
          customers.push(CustomerVDM.toLocal({ ...data, _id: d.id }));
        });
        return customers;
      })
    );
  }

  getCustomerById(id: string): Observable<CustomerVDM> {
    return from(getDocs(query(collection(db, this.collectionName), where('__name__', '==', id)))).pipe(
      map((qs) => {
        if (!qs.empty) {
          const d = qs.docs[0];
          const data = d.data();
          return CustomerVDM.toLocal({ ...data, _id: d.id });
        }
        throw new Error('Customer not found');
      })
    );
  }

  deleteCustomer(id: string): Observable<any> {
    const docRef = doc(db, this.collectionName, id);
    return from(deleteDoc(docRef));
  }

  /** Validate RFID uniqueness. Optionally exclude current id when editing */
  validateRfid(rfid: string, excludeId?: string): Observable<{ isValid: boolean; message?: string }> {
    const q = query(collection(db, this.collectionName), where('rfid', '==', rfid));
    return from(getDocs(q)).pipe(
      map((qs) => {
        if (qs.empty) return { isValid: true };
        const conflict = qs.docs.find((d) => d.id !== excludeId);
        if (conflict) return { isValid: false, message: 'RFID is already registered' };
        return { isValid: true };
      })
    );
  }
}