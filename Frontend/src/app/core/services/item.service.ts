import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';
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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ItemVDM } from '../../shared/models/item.vdm';
import { db, storage } from '../../../firebase.config';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private collectionName = 'items';

  constructor() {}

  createItem(item: ItemVDM): Observable<ItemVDM> {
    console.log('ItemService: Creating item in Firebase');
    console.log('Collection name:', this.collectionName);
    console.log('Item data:', item.toRemote());
    console.log('Firebase db instance:', db);
    debugger
    try {
      return from(addDoc(collection(db, this.collectionName), item.toRemote())).pipe(
        map((docRef) => {
          debugger
          console.log('Firebase document created with ID:', docRef.id);
          const newItem = new ItemVDM({ ...item.toRemote(), _id: docRef.id });
          console.log('New item with ID:', newItem);
          return newItem;
        })
      );
    } catch (error) {
      debugger
      console.error('Error in createItem:', error);
      throw error;
    }
  }

  updateItem(id: string, item: ItemVDM): Observable<ItemVDM> {
    const docRef = doc(db, this.collectionName, id);
    return from(updateDoc(docRef, item.toRemote())).pipe(
      map(() => {
        const updatedItem = new ItemVDM({ ...item.toRemote(), _id: id });
        return updatedItem;
      })
    );
  }

  getItems(): Observable<ItemVDM[]> {
    return from(getDocs(collection(db, this.collectionName))).pipe(
      map((querySnapshot) => {
        const items: ItemVDM[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push(ItemVDM.toLocal({ ...data, _id: doc.id }));
        });
        return items;
      })
    );
  }

  getItemById(id: string): Observable<ItemVDM> {
    const docRef = doc(db, this.collectionName, id);
    return from(getDocs(query(collection(db, this.collectionName), where('__name__', '==', id)))).pipe(
      map((querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          return ItemVDM.toLocal({ ...data, _id: doc.id });
        }
        throw new Error('Item not found');
      })
    );
  }

  deleteItem(id: string): Observable<any> {
    const docRef = doc(db, this.collectionName, id);
    return from(deleteDoc(docRef));
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const timestamp = Date.now();
    const fileName = `items/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    return from(uploadBytes(storageRef, file)).pipe(
      switchMap(() => from(getDownloadURL(storageRef))),
      map((url) => ({ url }))
    );
  }

  /** Test Firebase connectivity */
  testConnection(): Observable<boolean> {
    console.log('Testing Firebase connection...');
    console.log('DB instance:', db);
    console.log('Collection name:', this.collectionName);
    
    // Test reading from collection
    return from(getDocs(collection(db, this.collectionName))).pipe(
      map(() => {
        console.log('Firebase connection test successful');
        return true;
      })
    );
  }

  /** Test creating a simple document */
  testCreateDocument(): Observable<any> {
    console.log('Testing document creation...');
    const testData = { test: true, timestamp: new Date().toISOString() };
    
    return from(addDoc(collection(db, 'test'), testData)).pipe(
      map((docRef) => {
        console.log('Test document created with ID:', docRef.id);
        return docRef;
      })
    );
  }
}
