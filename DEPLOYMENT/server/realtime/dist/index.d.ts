declare class RealtimeServer {
    private app;
    private server;
    private io;
    private redis;
    private broadcaster;
    private eventQueue;
    private supabase;
    private handlers;
    constructor();
    private setupExpress;
    private setupSocketIO;
    private setupServices;
    start(): Promise<void>;
    shutdown(): Promise<void>;
}
export { RealtimeServer };
//# sourceMappingURL=index.d.ts.map