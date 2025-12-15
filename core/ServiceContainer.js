/**
 * ServiceContainer - Dependency Injection Container
 * 
 * 負責統一管理所有服務的創建和生命週期
 * 使用單例模式確保服務只創建一次
 * 
 * @example
 * const container = new ServiceContainer();
 * container.register('myService', () => new MyService());
 * const service = container.get('myService'); // 單例
 */
export class ServiceContainer {
    constructor() {
        this.services = new Map();
    }

    /**
     * 註冊服務
     * @param {string} name - 服務名稱
     * @param {Function} factory - 工廠函數，接收 container 作為參數
     * @throws {Error} 如果服務名稱已註冊
     */
    register(name, factory) {
        if (this.services.has(name)) {
            throw new Error(`[ServiceContainer] Service "${name}" already registered`);
        }

        this.services.set(name, {
            factory,
            instance: null
        });

        console.log(`[ServiceContainer] Registered: ${name}`);
    }

    /**
     * 獲取服務實例（單例模式）
     * @param {string} name - 服務名稱
     * @returns {*} 服務實例
     * @throws {Error} 如果服務未註冊
     */
    get(name) {
        const service = this.services.get(name);

        if (!service) {
            throw new Error(`[ServiceContainer] Service "${name}" not registered`);
        }

        // 單例：只創建一次
        if (!service.instance) {
            console.log(`[ServiceContainer] Creating instance: ${name}`);
            service.instance = service.factory(this);
        }

        return service.instance;
    }

    /**
     * 檢查服務是否已註冊
     * @param {string} name - 服務名稱
     * @returns {boolean}
     */
    has(name) {
        return this.services.has(name);
    }

    /**
     * 獲取所有已註冊的服務名稱
     * @returns {string[]}
     */
    list() {
        return Array.from(this.services.keys());
    }

    /**
     * 清空所有服務（用於測試）
     */
    clear() {
        this.services.clear();
        console.log('[ServiceContainer] Cleared all services');
    }
}
