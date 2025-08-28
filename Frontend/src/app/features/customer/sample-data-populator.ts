import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { 
  collection, 
  addDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class SampleDataPopulator {
  
  constructor() {}

  /**
   * Populate sample data for testing
   * Run this once to create test data
   */
  async populateSampleData() {
    try {
      console.log('Starting to populate sample data...');
      
      // 1. Create sample items
      const items = await this.createSampleItems();
      console.log('Created items:', items);
      
      // 2. Create sample customers
      const customers = await this.createSampleCustomers();
      console.log('Created customers:', customers);
      
      // 3. Create sample purchases
      const purchases = await this.createSamplePurchases(customers, items);
      console.log('Created purchases:', purchases);
      
      console.log('Sample data population completed successfully!');
      return { items, customers, purchases };
      
    } catch (error) {
      console.error('Error populating sample data:', error);
      throw error;
    }
  }

  private async createSampleItems() {
    const itemsData = [
      { itemName: 'Laptop', unitPrice: 45000, category: 'Electronics' },
      { itemName: 'Mouse', unitPrice: 500, category: 'Electronics' },
      { itemName: 'Keyboard', unitPrice: 1200, category: 'Electronics' },
      { itemName: 'Monitor', unitPrice: 8000, category: 'Electronics' },
      { itemName: 'Headphones', unitPrice: 1500, category: 'Electronics' },
      { itemName: 'USB Cable', unitPrice: 200, category: 'Accessories' },
      { itemName: 'Power Bank', unitPrice: 2500, category: 'Electronics' },
      { itemName: 'Webcam', unitPrice: 3000, category: 'Electronics' },
      { itemName: 'Microphone', unitPrice: 1800, category: 'Electronics' },
      { itemName: 'Tablet', unitPrice: 25000, category: 'Electronics' }
    ];

    const items = [];
    for (const itemData of itemsData) {
      const docRef = await addDoc(collection(db, 'items'), {
        ...itemData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      items.push({ _id: docRef.id, ...itemData });
    }
    return items;
  }

  private async createSampleCustomers() {
    const customersData = [
      { customerName: 'John Doe', phoneNumber: '9876543210', rfid: 'RFID001' },
      { customerName: 'Jane Smith', phoneNumber: '9876543211', rfid: 'RFID002' },
      { customerName: 'Bob Johnson', phoneNumber: '9876543212', rfid: 'RFID003' }
    ];

    const customers = [];
    for (const customerData of customersData) {
      const docRef = await addDoc(collection(db, 'customers'), {
        ...customerData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      customers.push({ _id: docRef.id, ...customerData });
    }
    return customers;
  }

  private async createSamplePurchases(customers: any[], items: any[]) {
    const purchases = [];
    
    // Create purchases for the last 10 days
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Create 1-3 purchases per day
      const purchasesPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < purchasesPerDay; j++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const purchaseItems = this.generateRandomPurchaseItems(items);
        const totalAmount = purchaseItems.reduce((sum, item) => sum + item.amount, 0);
        
        // Create purchase header
        const purchaseRef = await addDoc(collection(db, 'purchases'), {
          customerId: customer._id,
          customerName: customer.customerName,
          totalAmount: totalAmount,
          itemCount: purchaseItems.length,
          purchaseDate: Timestamp.fromDate(date),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        // Create purchase items
        for (const item of purchaseItems) {
          await addDoc(collection(db, 'purchaseItems'), {
            purchaseId: purchaseRef.id,
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }
        
        purchases.push({
          _id: purchaseRef.id,
          customerId: customer._id,
          customerName: customer.customerName,
          totalAmount,
          itemCount: purchaseItems.length,
          purchaseDate: date
        });
      }
    }
    
    return purchases;
  }

  private generateRandomPurchaseItems(items: any[]) {
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const selectedItems = [];
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numItems && i < shuffled.length; i++) {
      const item = shuffled[i];
      const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 quantity
      selectedItems.push({
        itemId: item._id,
        itemName: item.itemName,
        quantity,
        unitPrice: item.unitPrice,
        amount: quantity * item.unitPrice
      });
    }
    
    return selectedItems;
  }
}

// Usage instructions:
// 1. Import this service in your component
// 2. Call: this.sampleDataPopulator.populateSampleData()
// 3. This will create 3 customers, 10 items, and ~20-30 purchases over 10 days
// 4. Each purchase will have 1-3 items with realistic quantities and prices
