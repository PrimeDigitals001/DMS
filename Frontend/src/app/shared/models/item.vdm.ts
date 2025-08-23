export class ItemVDM {
  _id?: string = '';
  name: string = '';
  capacity: string = '';
  price: number = 0;
  image?: string = '';
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data?: Partial<ItemVDM>) {
    if (data) {
      this._id = data._id || '';
      this.name = data.name || '';
      this.capacity = data.capacity || '';
      this.price = data.price || 0;
      this.image = data.image || '';
      this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
      this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
    }
  }

  /**
   * Convert backend object to VDM instance
   * @param data backend object
   * @returns ItemVDM instance
   */
  static toLocal(data: any): ItemVDM {
    return new ItemVDM({
      _id: data._id || '',
      name: data.name || '',
      capacity: data.capacity || '',
      price: data.price || 0,
      image: data.image || '',
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }

  /**
   * Convert VDM instance to backend payload
   * @returns backend-ready object
   */
  toRemote(): any {
    return {
      name: this.name,
      capacity: this.capacity,
      price: this.price,
      image: this.image,
    };
  }
}
