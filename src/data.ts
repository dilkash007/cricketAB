
import { Vendor, User, AuditLog, Match } from './types';

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'VND-001', name: 'Global Sports Book', phone: '+1 234 567 890', email: 'admin@globalsports.com', creditLimit: 100000, usedCredit: 45000, commissionRate: 5.5, type: 'Super', status: 'Active', joinDate: '2024-01-15', totalUsers: 124 },
  { id: 'VND-002', name: 'Swift Betting', phone: '+44 789 123 456', email: 'ops@swiftbet.io', creditLimit: 50000, usedCredit: 12000, commissionRate: 4.0, type: 'Regular', status: 'Active', joinDate: '2024-02-01', totalUsers: 85 },
  { id: 'VND-003', name: 'Alpha Gaming', phone: '+91 98765 43210', email: 'support@alphagame.in', creditLimit: 75000, usedCredit: 5000, commissionRate: 3.5, type: 'Regular', status: 'Active', joinDate: '2024-03-10', totalUsers: 42 },
  { id: 'VND-004', name: 'Elite Odds', phone: '+971 50 123 4567', email: 'finance@eliteodds.ae', creditLimit: 200000, usedCredit: 150000, commissionRate: 6.0, type: 'Super', status: 'Active', joinDate: '2024-04-05', totalUsers: 310 },
  { id: 'VND-005', name: 'Apex Wagering', phone: '+61 2 9876 5432', email: 'contact@apexwagering.au', creditLimit: 30000, usedCredit: 28000, commissionRate: 4.5, type: 'Regular', status: 'Inactive', joinDate: '2024-05-12', totalUsers: 12 }
];

export const INITIAL_USERS: User[] = [
  { id: 'USR-001', vendorId: 'VND-001', vendorName: 'Global Sports Book', username: 'alex_pro', status: 'Active', balance: 2450.50, totalBets: 156, totalDeposits: 5000, totalWithdrawals: 2549.50, lastLogin: '2024-05-20 10:45', joinDate: '2024-01-20' },
  { id: 'USR-002', vendorId: 'VND-001', vendorName: 'Global Sports Book', username: 'crypto_king', status: 'Active', balance: 12400.00, totalBets: 89, totalDeposits: 15000, totalWithdrawals: 2600.00, lastLogin: '2024-05-21 14:20', joinDate: '2024-02-15' },
  { id: 'USR-003', vendorId: 'VND-002', vendorName: 'Swift Betting', username: 'lucky_lisa', status: 'Active', balance: 450.00, totalBets: 240, totalDeposits: 2000, totalWithdrawals: 1550.00, lastLogin: '2024-05-21 09:12', joinDate: '2024-03-01' },
  { id: 'USR-004', vendorId: 'VND-004', vendorName: 'Elite Odds', username: 'high_roller_sam', status: 'Blocked', balance: 0.00, totalBets: 12, totalDeposits: 500, totalWithdrawals: 500.00, lastLogin: '2024-04-30 23:55', joinDate: '2024-04-10' },
  { id: 'USR-005', vendorId: 'VND-003', vendorName: 'Alpha Gaming', username: 'tiger_bet', status: 'Active', balance: 3120.75, totalBets: 67, totalDeposits: 4000, totalWithdrawals: 879.25, lastLogin: '2024-05-21 18:30', joinDate: '2024-05-01' }
];

export const INITIAL_MATCHES: Match[] = [
  { id: 'M-101', teams: ['India', 'Australia'], type: 'T20', tournament: 'ICC World Cup', startTime: '2024-06-15 14:00', status: 'Live', isApproved: true, markets: [{ id: 'MK-1', name: 'Match Winner', odds: [1.8, 2.1], isOpen: true, minBet: 10, maxBet: 5000 }, { id: 'MK-2', name: 'Total Runs', odds: [1.9, 1.9], isOpen: true, minBet: 10, maxBet: 2000 }] },
  { id: 'M-102', teams: ['England', 'Pakistan'], type: 'ODI', tournament: 'Bilateral Series', startTime: '2024-06-16 10:00', status: 'Upcoming', isApproved: true, markets: [{ id: 'MK-3', name: 'Match Winner', odds: [1.7, 2.3], isOpen: true, minBet: 10, maxBet: 3000 }] },
  { id: 'M-103', teams: ['South Africa', 'New Zealand'], type: 'Test', tournament: 'Championship', startTime: '2024-06-20 09:30', status: 'Upcoming', isApproved: true, markets: [{ id: 'MK-4', name: 'Draw No Bet', odds: [1.6, 2.4], isOpen: true, minBet: 50, maxBet: 10000 }] },
  { id: 'M-104', teams: ['West Indies', 'Sri Lanka'], type: 'T20', tournament: 'Bilateral Series', startTime: '2024-06-21 19:00', status: 'Suspended', isApproved: true, markets: [{ id: 'MK-5', name: 'Match Winner', odds: [2.0, 1.8], isOpen: false, minBet: 10, maxBet: 5000 }] },
  { id: 'M-105', teams: ['Bangladesh', 'Afghanistan'], type: 'T20', tournament: 'Asia Cup Feed', startTime: '2024-06-22 15:00', status: 'Pending Approval', isApproved: false, markets: [{ id: 'MK-6', name: 'Match Winner', odds: [1.9, 1.9], isOpen: false, minBet: 10, maxBet: 5000 }] }
];

export const INITIAL_LOGS: AuditLog[] = [
  { id: 'L-1', action: 'Login Success', admin: 'Main Admin', category: 'Security', timestamp: '2024-05-21 10:00', details: 'Admin logged in from IP 1.2.3.4' },
  { id: 'L-2', action: 'Credit Add', admin: 'Main Admin', category: 'Finance', timestamp: '2024-05-21 10:15', details: 'Added $5000 to VND-001' },
  { id: 'L-3', action: 'Match Approved', admin: 'System', category: 'Match', timestamp: '2024-05-21 11:00', details: 'Match M-101 (IND vs AUS) marked Live' },
  { id: 'L-4', action: 'Market Closed', admin: 'Operator', category: 'Match', timestamp: '2024-05-21 11:30', details: 'MK-5 Market suspended manually' },
  { id: 'L-5', action: 'User Blocked', admin: 'Security Bot', category: 'User', timestamp: '2024-05-21 12:00', details: 'USR-004 blocked for suspicious betting' }
];
