
import { Vendor, User, Match, Transaction, AuditLog, Market } from './types';

const DIAMOND_API_URL = 'http://130.250.191.174:3009';
const DIAMOND_KEY = 'uniique5557878hshshhs';

const FALLBACK_STATS = {
  totalVendors: 12,
  activeVendors: 8,
  totalUsers: 1400,
  userGrowth: 15.2,
  netProfit: 54200,
  liquidity: "Unlimited"
};

export interface SportStatus {
  id: string;
  name: string;
  status: 'Online' | 'Error' | 'Unauthorized' | 'CORS Block';
  errorMsg?: string;
}

export const ApiService = {
  // ============================================
  // SITE 1 - SUPERADMIN MATCHES
  // ============================================

  // Get all matches from site1_superadmin
  getSite1Matches: async (): Promise<Match[]> => {
    try {
      const response = await fetch('/api/site1/matches');
      const data = await response.json();
      return data.success ? data.matches : [];
    } catch (error) {
      console.error('Get site1 matches error:', error);
      return [];
    }
  },

  // Create match in site1_superadmin
  createSite1Match: async (matchData: any) => {
    try {
      const response = await fetch('/api/site1/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });
      return await response.json();
    } catch (error) {
      console.error('Create site1 match error:', error);
      return { success: false, error: 'Failed to create match' };
    }
  },

  // Update match in site1_superadmin
  updateSite1Match: async (matchId: string, matchData: any) => {
    try {
      const response = await fetch(`/api/site1/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });
      return await response.json();
    } catch (error) {
      console.error('Update site1 match error:', error);
      return { success: false, error: 'Failed to update match' };
    }
  },

  // Delete match from site1_superadmin
  deleteSite1Match: async (matchId: string) => {
    try {
      const response = await fetch(`/api/site1/matches/${matchId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Delete site1 match error:', error);
      return { success: false, error: 'Failed to delete match' };
    }
  },

  // ============================================
  // DIAMOND API INTEGRATION
  // ============================================

  // Get Diamond API live matches
  getDiamondMatches: async () => {
    try {
      const response = await fetch('/api/diamond/tree');
      return await response.json();
    } catch (error) {
      console.error('Diamond API error:', error);
      return { success: false, error: 'Failed to fetch Diamond matches' };
    }
  },

  // Sync Diamond matches to database
  syncDiamondMatches: async () => {
    try {
      const response = await fetch('/api/diamond/sync', {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      console.error('Diamond sync error:', error);
      return { success: false, error: 'Failed to sync Diamond matches' };
    }
  },

  // ============================================
  // SITE 1 - FINANCES
  // ============================================

  getSite1FinancesOverview: async () => {
    try {
      const response = await fetch('/api/site1/finances/overview');
      const data = await response.json();
      return data.success ? data.overview : null;
    } catch (error) {
      console.error('Get finances overview error:', error);
      return null;
    }
  },

  getSite1Transactions: async () => {
    try {
      const response = await fetch('/api/site1/finances/transactions');
      const data = await response.json();
      return data.success ? data.transactions : [];
    } catch (error) {
      console.error('Get transactions error:', error);
      return [];
    }
  },

  getSite1VendorSettlements: async () => {
    try {
      const response = await fetch('/api/site1/finances/vendor-settlements');
      const data = await response.json();
      return data.success ? data.settlements : [];
    } catch (error) {
      console.error('Get vendor settlements error:', error);
      return [];
    }
  },

  // ============================================
  // SITE 2 - VENDORS
  // ============================================

  getSite2Vendors: async () => {
    try {
      const response = await fetch('/api/site2/vendors');
      const data = await response.json();
      return data.success ? data.vendors : [];
    } catch (error) {
      console.error('Get site2 vendors error:', error);
      return [];
    }
  },

  createSite2Vendor: async (vendorData: any) => {
    try {
      const response = await fetch('/api/site2/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData)
      });
      return await response.json();
    } catch (error) {
      console.error('Create site2 vendor error:', error);
      return { success: false, error: 'Failed to create vendor' };
    }
  },

  updateSite2Vendor: async (id: number, vendorData: any) => {
    try {
      const response = await fetch(`/api/site2/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData)
      });
      return await response.json();
    } catch (error) {
      console.error('Update site2 vendor error:', error);
      return { success: false, error: 'Failed to update vendor' };
    }
  },

  deleteSite2Vendor: async (id: number) => {
    try {
      const response = await fetch(`/api/site2/vendors/${id}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Delete site2 vendor error:', error);
      return { success: false, error: 'Failed to delete vendor' };
    }
  },

  getVendorDetails: async (id: number) => {
    try {
      const response = await fetch(`/api/site2/vendors/${id}/details`);
      return await response.json();
    } catch (error) {
      console.error('Get vendor details error:', error);
      return { success: false, error: 'Failed to fetch details' };
    }
  },

  // ============================================
  // SITE 3 - USERS
  // ============================================

  getSite3Users: async () => {
    try {
      const response = await fetch('/api/site3/users');
      const data = await response.json();
      return data.success ? data.users : [];
    } catch (error) {
      console.error('Get site3 users error:', error);
      return [];
    }
  },

  createSite3User: async (userData: any) => {
    try {
      const response = await fetch('/api/site3/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error('Create site3 user error:', error);
      return { success: false, error: 'Failed to create user' };
    }
  },

  updateSite3User: async (id: number, userData: any) => {
    try {
      const response = await fetch(`/api/site3/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error('Update site3 user error:', error);
      return { success: false, error: 'Failed to update user' };
    }
  },

  deleteSite3User: async (id: number) => {
    try {
      const response = await fetch(`/api/site3/users/${id}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Delete site3 user error:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  },

  /**
   * Traverse the Diamond API tree structure exactly like the Python documentation
   */
  getDiamondTreeFeed: async (): Promise<{ matches: Match[], reports: SportStatus[] }> => {
    const reports: SportStatus[] = [];
    const allMatches: Match[] = [];

    try {
      const url = `${DIAMOND_API_URL}/tree?key=${DIAMOND_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        reports.push({
          id: 'D-API',
          name: 'Diamond Cluster',
          status: 'Error',
          errorMsg: `Server returned HTTP ${response.status}`
        });
        return { matches: [], reports };
      }

      const result = await response.json();

      if (!result.success) {
        reports.push({
          id: 'D-API',
          name: 'Diamond Cluster',
          status: 'Unauthorized',
          errorMsg: 'Invalid API Key'
        });
        return { matches: [], reports };
      }

      // Root Data traversal: data -> t1 (Sports List)
      const sports = result.data?.t1 || [];

      sports.forEach((sport: any) => {
        const sportId = sport.etid;
        const sportName = sport.name || 'Unknown Sport';

        // Children level: Competitions (e.g. IPL, Big Bash)
        const competitions = sport.children || [];

        competitions.forEach((comp: any) => {
          const tournamentName = comp.name || 'Unknown Tournament';

          // Children level: Games/Matches
          const matches = comp.children || [];

          matches.forEach((m: any) => {
            const rawName = m.name || 'TBD v TBD';
            const teams = rawName.includes(' v ') ? rawName.split(' v ') : (rawName.includes(' - ') ? rawName.split(' - ') : [rawName, 'TBD']);

            allMatches.push({
              id: String(m.gmid),
              teams: [teams[0]?.trim() || 'Team A', teams[1]?.trim() || 'Team B'],
              type: (sportName === 'Cricket' ? 'T20' : 'ODI') as any,
              tournament: tournamentName,
              startTime: new Date().toLocaleTimeString(),
              status: m.iscc === 0 ? 'Live' : 'Upcoming',
              isApproved: true,
              sourceApi: `Diamond ${sportName}`,
              markets: [
                {
                  id: `MK-${m.gmid}`,
                  name: 'Match Winner',
                  odds: [1.90, 1.90],
                  isOpen: true,
                  minBet: 10,
                  maxBet: 50000
                }
              ]
            });
          });
        });
      });

      reports.push({ id: 'D-API', name: 'Diamond Cluster', status: 'Online' });

    } catch (err: any) {
      const isCors = err.message === 'Failed to fetch';
      reports.push({
        id: 'D-API',
        name: 'Diamond Cluster',
        status: isCors ? 'CORS Block' : 'Error',
        errorMsg: isCors ? 'Browser blocked request. Check CORS headers on server.' : err.message
      });
      console.error("Diamond Feed Error:", err);
    }

    return { matches: allMatches, reports };
  },

  getApprovedMatches: async (): Promise<Match[]> => {
    const { matches } = await ApiService.getDiamondTreeFeed();
    return matches;
  },

  getDiamondQueue: async (): Promise<{ matches: Match[], reports: SportStatus[] }> => {
    return await ApiService.getDiamondTreeFeed();
  },

  // --- UI HELPERS ---
  getSystemHealth: async () => ({ status: 'Connected', engine: 'PostgreSQL 16', latency: '24ms', apiCluster: 'Diamond Active' }),
  getDashboardStats: async () => FALLBACK_STATS,
  getChartData: async () => [
    { name: 'Mon', bets: 4500, winnings: 2400 },
    { name: 'Tue', bets: 5200, winnings: 3100 },
    { name: 'Wed', bets: 4800, winnings: 4200 },
    { name: 'Thu', bets: 6100, winnings: 3800 },
    { name: 'Fri', bets: 5900, winnings: 4500 },
    { name: 'Sat', bets: 8200, winnings: 5100 },
    { name: 'Sun', bets: 7500, winnings: 4800 },
  ],

  // Get users from cricket_betting database (default schema: vender_master_agent_site2)
  getUsers: async (schema: string = 'vender_master_agent_site2'): Promise<User[]> => {
    try {
      const response = await fetch(`/api/cricket/users/${schema}`);
      const data = await response.json();

      if (data.success && data.users) {
        // Map cricket DB users to UI format
        return data.users.map((u: any) => ({
          id: u.user_id || `USR-${u.id}`,
          username: u.username || u.name || 'Unknown',
          vendorName: u.vendor_name || 'N/A',
          balance: parseFloat(u.balance) || 0,
          status: u.status || 'Active',
          totalBets: parseInt(u.total_bets) || 0,
          totalDeposits: parseFloat(u.total_deposits) || 0,
          totalWithdrawals: parseFloat(u.total_withdrawals) || 0,
          lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
          joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown'
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch users from cricket DB:', error);
      return [];
    }
  },

  // Get vendors from cricket_betting database
  getVendors: async (schema: string = 'vender_master_agent_site2'): Promise<Vendor[]> => {
    try {
      const response = await fetch(`/api/cricket/vendors/${schema}`);
      const data = await response.json();

      if (data.success && data.vendors) {
        return data.vendors.map((v: any) => ({
          id: v.vendor_id || `VND-${v.id}`,
          name: v.name,
          email: v.email,
          phone: v.phone || 'N/A',
          type: v.type || 'Regular',
          status: v.status || 'Active',
          creditLimit: parseFloat(v.credit_limit) || 0,
          usedCredit: parseFloat(v.used_credit) || 0,
          commissionRate: parseFloat(v.commission_rate) || 0,
          totalUsers: parseInt(v.total_users) || 0,
          joinDate: v.join_date ? new Date(v.join_date).toLocaleDateString() : 'Unknown'
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch vendors from cricket DB:', error);
      return [];
    }
  },

  // Get available schemas
  getSchemas: async (): Promise<string[]> => {
    try {
      const response = await fetch('/api/cricket/schemas');
      const data = await response.json();
      return data.success ? data.schemas : [];
    } catch (error) {
      console.error('Failed to fetch schemas:', error);
      return [];
    }
  },

  getSettings: async () => ({
    betting: { defaultMultiplier: 1.05, settlementDelay: 10, maxSingleBet: 10000, maxAccumulator: 50000 },
    security: { twoFactorEnforced: false, ipWhitelistEnabled: true, sessionTimeout: 60, maintenanceMode: false },
    feeds: [{ id: '1', name: 'Diamond Tree Feed', status: 'Connected', latency: '12ms' }]
  }),
  updateVendorStatus: async (vid: string, s: string, schema: string = 'vender_master_agent_site2') => {
    try {
      const response = await fetch(`/api/cricket/vendors/${schema}/${vid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: s })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to update vendor status' };
    }
  },

  adjustVendorCredit: async (vid: string, a: number, t: string, schema: string = 'vender_master_agent_site2') => {
    try {
      const response = await fetch(`/api/cricket/vendors/${schema}/${vid}/credit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: a, action: t.toLowerCase() })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to adjust credit' };
    }
  },

  updateUserStatus: async (uid: string, s: string, schema: string = 'vender_master_agent_site2') => {
    try {
      const response = await fetch(`/api/cricket/users/${schema}/${uid}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: s })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to update user status' };
    }
  },

  adjustUserBalance: async (uid: string, a: number, t: string, schema: string = 'vender_master_agent_site2') => {
    try {
      const response = await fetch(`/api/cricket/users/${schema}/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balance: t === 'Add' ? `balance + ${a}` : `balance - ${a}`
        })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to adjust balance' };
    }
  },

  deleteVendor: async (id: string, schema: string = 'vender_master_agent_site2') => {
    try {
      const response = await fetch(`/api/cricket/vendors/${schema}/${id}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to delete vendor' };
    }
  },

  createVendor: async (d: any, schema: string = 'vender_master_agent_site2') => {
    try {
      const response = await fetch(`/api/cricket/vendors/${schema}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to create vendor' };
    }
  },
  // ============================================
  // FINANCIAL COMMAND - REAL DATABASE STATS
  // ============================================
  getFinancialStats: async () => {
    try {
      const response = await fetch('/api/financial/financial-stats');
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Get financial stats error:', error);
      return null;
    }
  },

  getWithdrawalRequests: async () => {
    try {
      const response = await fetch('/api/financial/withdrawal-queue');
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get withdrawal requests error:', error);
      return [];
    }
  },

  getMasterLedger: async () => {
    try {
      const response = await fetch('/api/financial/master-ledger');
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get master ledger error:', error);
      return [];
    }
  },

  approveWithdrawal: async (id: string) => {
    try {
      const response = await fetch(`/api/financial/withdrawal-queue/${id}/approve`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      console.error('Approve withdrawal error:', error);
      return { success: false, error: 'Failed to approve withdrawal' };
    }
  },
  getReportKPIs: async () => {
    try {
      const response = await fetch('/api/reports/kpis');
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Get report KPIs error:', error);
      return null;
    }
  },
  getRevenueAnalytics: async (range: string) => {
    try {
      const response = await fetch(`/api/reports/revenue-analytics?range=${range}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get revenue analytics error:', error);
      return [];
    }
  },
  getSportPerformance: async () => {
    try {
      const response = await fetch('/api/reports/sport-performance');
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get sport performance error:', error);
      return [];
    }
  },
  getVendorLeaderboard: async () => {
    try {
      const response = await fetch('/api/reports/vendor-leaderboard');
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get vendor leaderboard error:', error);
      return [];
    }
  },
  getActivityHeatmap: async () => {
    try {
      const response = await fetch('/api/reports/heatmap');
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get activity heatmap error:', error);
      return [];
    }
  },
  getAuditLogs: async (filters: any) => {
    try {
      const { category } = filters;
      const response = await fetch(`/api/audit/logs?category=${category || 'All'}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get audit logs error:', error);
      return [];
    }
  },
  getAuditKPIs: async () => {
    try {
      const response = await fetch('/api/audit/kpis');
      const data = await response.json();
      return data.success ? data.data : { totalLogs24h: '---', securityAlerts: '---', failedLogins: '---', systemStability: '---' };
    } catch (error) {
      console.error('Get audit KPIs error:', error);
      return null;
    }
  },
  getLogPayload: async (id: string) => {
    try {
      const response = await fetch(`/api/audit/payload/${id}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Get log payload error:', error);
      return null;
    }
  },
  archiveLogs: async (date: string) => {
    try {
      const response = await fetch('/api/audit/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });
      return await response.json();
    } catch (error) {
      console.error('Archive logs error:', error);
      return { success: false, error: 'Failed to archive logs' };
    }
  },
  updateSettings: async (c: string, s: any) => ({ success: true }),
  testFeedConnection: async (id: string) => ({ success: true }),
  performDbMaintenance: async (t: string) => ({ success: true }),
  getRiskAlerts: async () => {
    try {
      const response = await fetch('/api/risk/alerts');
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get risk alerts error:', error);
      return [];
    }
  },
  getRiskKPIs: async () => {
    try {
      const response = await fetch('/api/risk/kpis');
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Get risk KPIs error:', error);
      return null;
    }
  },
  getRiskHeuristics: async () => {
    try {
      const response = await fetch('/api/risk/heuristics');
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get risk heuristics error:', error);
      return [];
    }
  },
  getBlacklistedIps: async () => {
    try {
      const response = await fetch('/api/risk/blacklist');
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get blacklisted IPs error:', error);
      return [];
    }
  },
  toggleMarket: async (mid: string, s: boolean) => ({ success: true }),
  settleMatch: async (mid: string, w: string) => ({ success: true }),
  createMatch: async () => ({ success: true }),
  approveMatch: async (id: string) => ({ success: true }),
  rejectMatch: async (id: string) => ({ success: true })
};
