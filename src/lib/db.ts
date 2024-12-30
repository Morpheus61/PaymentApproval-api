import Dexie, { Table } from 'dexie';

export interface User {
  id?: number;
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'generator' | 'approver' | 'admin';
  createdAt: Date;
}

export interface Voucher {
  id?: number;
  voucherNumber: string;
  date: Date;
  payTo: string;
  headOfAccount: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  generatedBy: number;
  approvedBy?: number;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id?: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface Modifications {
  updatedAt?: Date;
  // Add other properties as needed
}

class VoucherDatabase extends Dexie {
  users!: Table<User>;
  vouchers!: Table<Voucher>;
  notifications!: Table<Notification>;
  voucherCounter!: Table<{ id: number; counter: number }>;

  constructor() {
    super('VoucherDB');
    
    this.version(2).stores({
      users: '++id, username, role',
      vouchers: '++id, voucherNumber, status, generatedBy, approvedBy, updatedAt',
      notifications: '++id, userId, read',
      voucherCounter: 'id'
    });

    // Add hooks for automatic timestamp updates
    this.vouchers.hook('creating', (primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      return obj;
    });

    this.vouchers.hook('updating', (modifications: Modifications, primKey, obj) => {
      if (typeof modifications === 'object') {
        modifications.updatedAt = new Date();
      }
      return modifications;
    });
  }

  async initialize() {
    try {
      const userCount = await this.users.count();
      
      if (userCount === 0) {
        await this.transaction('rw', this.users, this.voucherCounter, async () => {
          await this.users.add({
            username: 'admin',
            password: 'admin123',
            name: 'Administrator',
            email: 'admin@relishfoods.com',
            role: 'admin',
            createdAt: new Date()
          });

          await this.voucherCounter.add({ id: 1, counter: 0 });
        });
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Database initialization error at ${new Date().toISOString()}:`, error);
      await this.reloadDatabase();
    }
  }

  async reloadDatabase() {
    try {
      await this.close();
      await this.open();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Database reload error at ${new Date().toISOString()}:`, error);
    }
  }

  async getNextVoucherNumber(): Promise<string> {
    const tx = await this.transaction('rw', this.voucherCounter, async () => {
      const counter = await this.voucherCounter.get(1);
      const nextNumber = (counter?.counter || 0) + 1;
      await this.voucherCounter.put({ id: 1, counter: nextNumber });
      return nextNumber.toString().padStart(6, '0');
    });
    return `RFV${tx}`;
  }

  async resetVoucherCounter(): Promise<void> {
    await this.voucherCounter.put({ id: 1, counter: 0 });
  }
}

export const db = new VoucherDatabase();

export const initializeDatabase = db.initialize;

// Initialize database when the module loads
db.open().then(() => db.initialize());

// Add periodic database health check
setInterval(() => {
  if (!db.isOpen()) {
    db.open().then(() => db.initialize());
  }
}, 5000);