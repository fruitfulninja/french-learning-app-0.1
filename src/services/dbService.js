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
  
          if (!db.objectStoreNames.contains('vocabulary')) {
            const store = db.createObjectStore('vocabulary', { keyPath: 'word' });
            store.createIndex('lastUpdated', 'lastUpdated');
            store.createIndex('stars', 'stars');
            store.createIndex('type', 'type');
            console.log('Created vocabulary store');
          }
  
          if (!db.objectStoreNames.contains('contexts')) {
            const contextStore = db.createObjectStore('contexts', { keyPath: 'id', autoIncrement: true });
            contextStore.createIndex('word', 'word');
            contextStore.createIndex('timestamp', 'timestamp');
            console.log('Created contexts store');
          }
        };
      });
    }
  
    async saveWord(word, data) {
      console.log('Saving word:', word);
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['vocabulary'], 'readwrite');
        const store = transaction.objectStore('vocabulary');
  
        const request = store.put({
          word,
          ...data,
          lastUpdated: new Date().toISOString()
        });
  
        request.onsuccess = () => {
          console.log('Word saved successfully');
          resolve();
        };
  
        request.onerror = () => {
          console.error('Error saving word:', request.error);
          reject(request.error);
        };
      });
    }
  
    async getWord(word) {
      console.log('Fetching word:', word);
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['vocabulary'], 'readonly');
        const store = transaction.objectStore('vocabulary');
        const request = store.get(word);
  
        request.onsuccess = () => {
          resolve(request.result);
        };
  
        request.onerror = () => {
          reject(request.error);
        };
      });
    }
  
    async getAllWords() {
      console.log('Fetching all words');
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['vocabulary'], 'readonly');
        const store = transaction.objectStore('vocabulary');
        const request = store.getAll();
  
        request.onsuccess = () => {
          resolve(request.result);
        };
  
        request.onerror = () => {
          reject(request.error);
        };
      });
    }
  
    async exportFullData() {
      console.log('Starting full data export...');
      try {
        const words = await this.getAllWords();
        const contexts = await Promise.all(
          words.map(word => this.getContexts(word.word))
        );
  
        const completeData = words.map((word, index) => ({
          ...word,
          contexts: contexts[index],
          exportDate: new Date().toISOString(),
          version: this.version
        }));
  
        // Create JSON file
        const jsonContent = JSON.stringify(completeData, null, 2);
        const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `french-vocabulary-backup-${timestamp}.json`;
  
        // Trigger download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(jsonBlob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        console.log('Export completed successfully');
        return completeData;
  
      } catch (error) {
        console.error('Export failed:', error);
        throw error;
      }
    }
  
    async getContexts(word) {
      console.log('Fetching contexts for word:', word);
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['contexts'], 'readonly');
        const store = transaction.objectStore('contexts');
        const index = store.index('word');
        const request = index.getAll(word);
  
        request.onsuccess = () => {
          resolve(request.result);
        };
  
        request.onerror = () => {
          reject(request.error);
        };
      });
    }
  
    async addContext(word, context) {
      console.log('Adding context for word:', word);
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['contexts'], 'readwrite');
        const store = transaction.objectStore('contexts');
  
        const request = store.add({
          word,
          context,
          timestamp: new Date().toISOString()
        });
  
        request.onsuccess = () => {
          console.log('Context added successfully');
          resolve();
        };
  
        request.onerror = () => {
          reject(request.error);
        };
      });
    }
  }
  
  // Create and export a single instance
  const dbService = new DatabaseService();
  export default dbService;