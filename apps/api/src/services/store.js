class InMemoryStore {
  constructor() {
    this.cooperatives = [];
    this.services = [];
    this.users = [];
    this.workers = [];
    this.bookings = [];
    this.ratings = [];
    this.aiLogs = [];
    this.workforceRecommendations = [];
    this.payments = [];
  }

  clear() {
    this.cooperatives = [];
    this.services = [];
    this.users = [];
    this.workers = [];
    this.bookings = [];
    this.ratings = [];
    this.aiLogs = [];
    this.workforceRecommendations = [];
    this.payments = [];
  }

  resetToDemo() {
    this.clear();
    console.log('[Store] Seeded demo data removed; store is empty.');
  }
}

export const store = new InMemoryStore();
