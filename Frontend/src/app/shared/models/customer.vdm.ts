export class CustomerVDM {
  _id?: string = '';
  customerName: string = '';
  phoneNumber: string = '';
  rfid: string = '';
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data?: Partial<CustomerVDM>) {
    if (data) {
      this._id = data._id ?? '';
      this.customerName = data.customerName ?? '';
      this.phoneNumber = data.phoneNumber ?? '';
      this.rfid = data.rfid ?? '';
      this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
      this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
    }
  }

  /**
   * Convert backend object to VDM instance
   * @param data backend object
   * @returns CustomerVDM instance
   */
  static toLocal(data: any): CustomerVDM {
    return new CustomerVDM({
      _id: data?._id ?? '',
      customerName: data?.customerName ?? '',
      phoneNumber: data?.phoneNumber ?? '',
      rfid: data?.rfid ?? '',
      createdAt: data?.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data?.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }

  /**
   * Convert VDM instance to backend payload
   * @returns backend-ready object
   */
  toRemote(): any {
    return {
      customerName: this.customerName,
      phoneNumber: this.phoneNumber,
      rfid: this.rfid,
    };
  }
}
