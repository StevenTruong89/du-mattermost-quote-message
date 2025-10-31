declare global {
    interface Window {
        registerPlugin: (id: string, plugin: any) => void;
    }
}

export {}; // để TypeScript hiểu đây là module