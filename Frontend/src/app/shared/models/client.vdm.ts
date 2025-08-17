export class ClientVDM {
  _id?: string = '';
  client: string = '';
  ownerName: string = '';
  phoneNumber: string = '';
  email: string = '';
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data?: Partial<ClientVDM>) {
    if (data) {
      this._id = data._id || '';
      this.client = data.client || '';
      this.ownerName = data.ownerName || '';
      this.phoneNumber = data.phoneNumber || '';
      this.email = data.email || '';
      this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
      this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
    }
  }

  /**
   * Convert backend object to VDM instance
   * @param data backend object
   * @returns ClientVDM instance
   */
  static toLocal(data: any): ClientVDM {
    return new ClientVDM({
      _id: data._id || '',
      client: data.client || '',
      ownerName: data.ownerName || '',
      phoneNumber: data.phoneNumber || '',
      email: data.email || '',
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
      client: this.client,
      ownerName: this.ownerName,
      phoneNumber: this.phoneNumber,
      email: this.email,
    };
  }
}
