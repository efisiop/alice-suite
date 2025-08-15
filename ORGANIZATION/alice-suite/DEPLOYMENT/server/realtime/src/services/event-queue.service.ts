import { RealTimeEvent } from '../types';
import { RedisService } from './redis.service';

export interface EventQueueConfig {
  maxQueueSize: number;
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
}

export class EventQueueService {
  private redis: RedisService;
  private config: EventQueueConfig;
  private processing: boolean = false;

  constructor(redis: RedisService, config: EventQueueConfig = {
    maxQueueSize: 1000,
    maxRetries: 3,
    retryDelay: 1000,
    batchSize: 100
  }) {
    this.redis = redis;
    this.config = config;
  }

  async enqueue(event: RealTimeEvent): Promise<void> {
    try {
      const queueKey = 'event_queue';
      const eventData = JSON.stringify({
        ...event,
        retryCount: 0,
        enqueuedAt: new Date().toISOString()
      });

      // Check queue size
      const queueSize = await this.getQueueSize();
      if (queueSize >= this.config.maxQueueSize) {
        throw new Error('Event queue is full');
      }

      // Add to queue with priority (timestamp as score)
      await this.redis['publisher'].zAdd(queueKey, {
        score: Date.now(),
        value: eventData
      });

      console.log(`📥 Enqueued event: ${event.eventType} for user ${event.userId}`);
    } catch (error) {
      console.error('❌ Error enqueuing event:', error);
      throw error;
    }
  }

  async dequeue(): Promise<RealTimeEvent | null> {
    try {
      const queueKey = 'event_queue';
      const result = await this.redis['publisher'].zPopMin(queueKey);
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        return null;
      }

      const eventData = JSON.parse(result[0].value);
      return {
        ...eventData,
        timestamp: new Date(eventData.timestamp)
      };
    } catch (error) {
      console.error('❌ Error dequeuing event:', error);
      throw error;
    }
  }

  async processEvents(processCallback: (event: RealTimeEvent) => Promise<void>): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    
    try {
      while (true) {
        const event = await this.dequeue();
        if (!event) {
          break; // Queue is empty
        }

        try {
          await processCallback(event);
          console.log(`✅ Processed event: ${event.eventType}`);
        } catch (error) {
          await this.handleFailedEvent(event, error);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async handleFailedEvent(event: any, error: any): Promise<void> {
    const retryCount = (event.retryCount || 0) + 1;
    
    if (retryCount <= this.config.maxRetries) {
      // Re-enqueue with retry count
      const retryEvent = {
        ...event,
        retryCount,
        error: error.message
      };

      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * retryCount));
      
      await this.redis['publisher'].zAdd('event_queue', {
        score: Date.now() + (this.config.retryDelay * retryCount),
        value: JSON.stringify(retryEvent)
      });

      console.warn(`🔄 Retrying event: ${event.eventType} (attempt ${retryCount})`);
    } else {
      // Move to dead letter queue
      await this.moveToDeadLetterQueue(event, error);
      console.error(`💀 Event failed permanently: ${event.eventType}`, error);
    }
  }

  private async moveToDeadLetterQueue(event: any, error: any): Promise<void> {
    try {
      const dlqKey = 'dead_letter_queue';
      const deadEvent = JSON.stringify({
        ...event,
        error: error.message,
        failedAt: new Date().toISOString(),
        stack: error.stack
      });

      await this.redis['publisher'].lPush(dlqKey, deadEvent);
      await this.redis['publisher'].expire(dlqKey, 604800); // 7 days
    } catch (dlqError) {
      console.error('❌ Error moving to dead letter queue:', dlqError);
    }
  }

  async getQueueSize(): Promise<number> {
    try {
      return await this.redis['publisher'].zCard('event_queue');
    } catch (error) {
      console.error('❌ Error getting queue size:', error);
      return 0;
    }
  }

  async getDeadLetterQueueSize(): Promise<number> {
    try {
      return await this.redis['publisher'].lLen('dead_letter_queue');
    } catch (error) {
      console.error('❌ Error getting DLQ size:', error);
      return 0;
    }
  }

  async clearQueue(): Promise<void> {
    try {
      await this.redis['publisher'].del('event_queue');
      console.log('🗑️ Event queue cleared');
    } catch (error) {
      console.error('❌ Error clearing queue:', error);
    }
  }

  async getQueueStats(): Promise<{
    queueSize: number;
    dlqSize: number;
    isProcessing: boolean;
  }> {
    const [queueSize, dlqSize] = await Promise.all([
      this.getQueueSize(),
      this.getDeadLetterQueueSize()
    ]);

    return {
      queueSize,
      dlqSize,
      isProcessing: this.processing
    };
  }

  async startPeriodicProcessing(processCallback: (event: RealTimeEvent) => Promise<void>): Promise<void> {
    setInterval(async () => {
      try {
        await this.processEvents(processCallback);
      } catch (error) {
        console.error('❌ Error in periodic processing:', error);
      }
    }, 1000); // Check every second
  }

  async shutdown(): Promise<void> {
    // Process remaining events before shutdown
    if (this.processing) {
      console.log('🔄 Processing remaining events before shutdown...');
      // Wait for current processing to complete
      while (this.processing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    console.log('✅ Event queue service shutdown complete');
  }
}