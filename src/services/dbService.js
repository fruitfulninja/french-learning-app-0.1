// services/dbService.js

class DatabaseService {
    constructor() {
      this.dbName = 'frenchLearningDB';
      this.version = 1;
      this.db = null;
    }
  
    async init() {
      console.log('Initializing database...');
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
  
        request.onerror = () => {
          console.error('Failed to open database');
          reject(request.error);
        };
  
        request.onsuccess = (event) => {
          this.db = event.target.result;
          console.log('Database opened successfully');
          resolve(this.db);
        };
  
        request.onupgradeneeded = (event) => {
          console.log('Creating/upgrading database schema...');
          const db = event.target.result;
  
          // Create ratings store
          if (!db.objectStoreNames.contains('ratings')) {
            const store = db.createObjectStore('ratings', { keyPath: 'word' });
            store.createIndex('lastUpdated', 'lastUpdated');
            store.createIndex('stars', 'stars');
            console.log('Created ratings store');
          }
        };
      });
    }
  
    async saveRating(word, data) {
      console.log('Saving rating for word:', word);
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['ratings'], 'readwrite');
        const store = transaction.objectStore('ratings');
  
        const request = store.put({
          word,
          stars: data.stars || 0,
          notes: data.notes || '',
          lastUpdated: new Date().toISOString()
        });
  
        request.onsuccess = () => {
          console.log('Rating saved successfully');
          resolve();
        };
  
        request.onerror = () => {
          console.error('Error saving rating:', request.error);
          reject(request.error);
        };
      });
    }
  
    async getRating(word) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['ratings'], 'readonly');
        const store = transaction.objectStore('ratings');
        const request = store.get(word);
  
        request.onsuccess = () => {
          resolve(request.result || { stars: 0, notes: '' });
        };
  
        request.onerror = () => {
          reject(request.error);
        };
      });
    }
  
    async getAllRatings() {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['ratings'], 'readonly');
        const store = transaction.objectStore('ratings');
        const request = store.getAll();
  
        request.onsuccess = () => {
          resolve(request.result);
        };
  
        request.onerror = () => {
          reject(request.error);
        };
      });
    }
  }
  
  // Create and export singleton instance
  const dbService = new DatabaseService();
  export default dbService;