
export type Status = 'Active' | 'Inactive';
export type VendorType = 'Super' | 'Regular';
export type MatchType = 'T20' | 'ODI' | 'Test';
export type MatchStatus = 'Upcoming' | 'Live' | 'Suspended' | 'Finished' | 'Pending Approval';

export interface Vendor {
  id: any;
  vendor_id: string;
  name: string;
  phone: string;
  email: string;
  credit_limit: number;
  used_credit: number;
  commission_rate: number;
  type: VendorType;
  status: Status;
  joinDate: string;
  totalUsers: number;
}

export interface User {
  id: string;
  vendorId: string;
  vendorName: string;
  username: string;
  status: 'Active' | 'Blocked';
  balance: number;
  totalBets: number;
  totalDeposits: number;
  totalWithdrawals: number;
  lastLogin: string;
  joinDate: string;
}

export interface Match {
  id: string;
  teams: [string, string];
  type: MatchType;
  startTime: string;
  status: MatchStatus;
  tournament: string;
  markets: Market[];
  isApproved: boolean;
  sourceApi?: string;
}

export interface Market {
  id: string;
  name: string;
  odds: [number, number];
  isOpen: boolean;
  minBet: number;
  maxBet: number;
}

export interface Transaction {
  id: string;
  type: 'Add' | 'Deduct' | 'Commission' | 'Bet' | 'Win';
  amount: number;
  refId: string;
  refType: 'Vendor' | 'User' | 'System';
  admin: string;
  timestamp: string;
  description: string;
}

export interface AuditLog {
  id: string;
  action: string;
  admin: string;
  category: 'Security' | 'Finance' | 'User' | 'Vendor' | 'System' | 'Match';
  timestamp: string;
  details: string;
}
