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
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../firebase.config';

export interface PurchaseItem {
  itemId: string;
  qty: number;
  unitPrice: number;
}

export interface PurchaseRequest {
  clientId: string;
  customerId: string;
  itemList: PurchaseItem[];
  totalAmount: number;
}

export interface Purchase {
  _id: string;
  clientId: string;
  customerId: string;
  purchaseDate: Timestamp;
  totalAmount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PurchaseItemDocument {
  _id: string;
  purchaseId: string;
  itemId: string;
  quantity: number;
  amount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private purchaseCollection = 'purchases';
  private purchaseItemCollection = 'purchaseItems';

  constructor() {}

  /**
   * Create a new purchase
   */
  createPurchase(purchaseData: PurchaseRequest): Observable<any> {
    const purchaseDoc = {
      clientId: purchaseData.clientId,
      customerId: purchaseData.customerId,
      totalAmount: purchaseData.totalAmount,
      purchaseDate: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
debugger
    return from(addDoc(collection(db, this.purchaseCollection), purchaseDoc)).pipe(
      map((purchaseRef) => {
        // Create purchase items
        debugger
        const purchaseItems = purchaseData.itemList.map(item => ({
          purchaseId: purchaseRef.id,
          itemId: item.itemId,
          quantity: item.qty,
          amount: item.qty * item.unitPrice,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }));

        // Add all purchase items
        purchaseItems.forEach(item => {
          addDoc(collection(db, this.purchaseItemCollection), item);
        });

        return {
          _id: purchaseRef.id,
          ...purchaseDoc,
          items: purchaseItems
        };
      })
    );
  }

  /**
   * Get all purchases
   */
  getAllPurchases(): Observable<any[]> {
    return from(getDocs(query(
      collection(db, this.purchaseCollection),
      orderBy('purchaseDate', 'desc')
    ))).pipe(
      map((querySnapshot) => {
        const purchases: any[] = [];
        querySnapshot.forEach((doc) => {
          purchases.push({
            _id: doc.id,
            ...doc.data()
          });
        });
        return purchases;
      })
    );
  }

  /**
   * Get purchase by ID
   */
  getPurchaseById(purchaseId: string): Observable<any> {
    return from(getDocs(query(
      collection(db, this.purchaseCollection),
      where('__name__', '==', purchaseId)
    ))).pipe(
      switchMap((querySnapshot) => {
        if (!querySnapshot.empty) {
          const purchaseDoc = querySnapshot.docs[0];
          const purchaseData = {
            _id: purchaseDoc.id,
            ...purchaseDoc.data()
          };

          // Get purchase items
          return from(getDocs(query(
            collection(db, this.purchaseItemCollection),
            where('purchaseId', '==', purchaseId)
          ))).pipe(
            map((itemsSnapshot) => {
              const items: any[] = [];
              itemsSnapshot.forEach((itemDoc) => {
                items.push({
                  _id: itemDoc.id,
                  ...itemDoc.data()
                });
              });
              return {
                ...purchaseData,
                items: items
              };
            })
          );
        }
        throw new Error('Purchase not found');
      })
    );
  }

  /**
   * Get purchases by customer ID
   */
  getPurchasesByCustomer(customerId: string): Observable<any[]> {
    return from(getDocs(query(
      collection(db, this.purchaseCollection),
      where('customerId', '==', customerId),
      orderBy('purchaseDate', 'desc')
    ))).pipe(
      map((querySnapshot) => {
        const purchases: any[] = [];
        querySnapshot.forEach((doc) => {
          purchases.push({
            _id: doc.id,
            ...doc.data()
          });
        });
        return purchases;
      })
    );
  }

  /**
   * Get purchases by client ID
   */
  getPurchasesByClient(clientId: string): Observable<any[]> {
    return from(getDocs(query(
      collection(db, this.purchaseCollection),
      where('clientId', '==', clientId),
      orderBy('purchaseDate', 'desc')
    ))).pipe(
      map((querySnapshot) => {
        const purchases: any[] = [];
        querySnapshot.forEach((doc) => {
          purchases.push({
            _id: doc.id,
            ...doc.data()
          });
        });
        return purchases;
      })
    );
  }

  /**
   * Delete purchase
   */
  deletePurchase(purchaseId: string): Observable<any> {
    // First delete all purchase items
    return from(getDocs(query(
      collection(db, this.purchaseItemCollection),
      where('purchaseId', '==', purchaseId)
    ))).pipe(
      switchMap((itemsSnapshot) => {
        // Delete all purchase items
        const deletePromises = itemsSnapshot.docs.map(itemDoc => 
          deleteDoc(doc(db, this.purchaseItemCollection, itemDoc.id))
        );
        
        // Delete the purchase
        deletePromises.push(deleteDoc(doc(db, this.purchaseCollection, purchaseId)));
        
        return from(Promise.all(deletePromises)).pipe(
          map(() => ({ success: true }))
        );
      })
    );
  }

  /**
   * Update purchase
   */
  updatePurchase(purchaseId: string, purchaseData: Partial<Purchase>): Observable<any> {
    const docRef = doc(db, this.purchaseCollection, purchaseId);
    const updateData = {
      ...purchaseData,
      updatedAt: Timestamp.now()
    };
    
    return from(updateDoc(docRef, updateData)).pipe(
      map(() => ({ _id: purchaseId, ...updateData }))
    );
  }

  /**
   * Get purchase items by purchase ID
   */
  getPurchaseItems(purchaseId: string): Observable<any[]> {
    return from(getDocs(query(
      collection(db, this.purchaseItemCollection),
      where('purchaseId', '==', purchaseId)
    ))).pipe(
      map((querySnapshot) => {
        const items: any[] = [];
        querySnapshot.forEach((doc) => {
          items.push({
            _id: doc.id,
            ...doc.data()
          });
        });
        return items;
      })
    );
  }
}
