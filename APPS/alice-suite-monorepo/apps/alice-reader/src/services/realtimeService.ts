import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';
import { appLog } from '../components/LogViewer';
import { RealtimeChannel } from '@supabase/supabase-js';

const SERVICE_NAME = 'RealtimeService';
let supabase: SupabaseClient | null = null;
let interactionsChannel: RealtimeChannel | null = null;

interface RealtimeInteraction {
  id: string;
  user_id: string;
  event_type: string;
  content: string;
  created_at: string;
  context?: any;
}

type RealtimeCallback = (payload: RealtimeInteraction) => void;

export const initializeRealtimeService = async () => {
  if (supabase) {
    appLog(SERVICE_NAME, 'Realtime service already initialized.', 'info');
    return;
  }
  try {
    supabase = await getSupabaseClient();
    appLog(SERVICE_NAME, 'Supabase client obtained for realtime service.', 'success');
  } catch (error) {
    appLog(SERVICE_NAME, 'Failed to get Supabase client for realtime service.', 'error', error);
  }
};

export const subscribeToAIInteractionPrompts = (userId: string, callback: RealtimeCallback) => {
  if (!supabase) {
    appLog(SERVICE_NAME, 'Supabase client not initialized. Cannot subscribe.', 'error');
    return;
  }

  if (interactionsChannel) {
    appLog(SERVICE_NAME, 'Already subscribed to AI interaction prompts. Unsubscribing existing channel.', 'info');
    interactionsChannel.unsubscribe();
  }

  appLog(SERVICE_NAME, `Subscribing to AI interaction prompts for user: ${userId}`, 'info');

  interactionsChannel = supabase
    .channel(`ai_prompts_for_user_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'interactions',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const newInteraction = payload.new as RealtimeInteraction;
        if (newInteraction.event_type === 'ai_prompt_sent') {
          appLog(SERVICE_NAME, 'Received new AI prompt:', 'info', newInteraction);
          callback(newInteraction);
        }
      }
    )
    .subscribe((status) => {
      appLog(SERVICE_NAME, `Realtime channel status for AI prompts: ${status}`, 'info');
      if (status === 'CHANNEL_ERROR') {
        appLog(SERVICE_NAME, 'Realtime channel error for AI prompts.', 'error');
      }
    });
};

export const unsubscribeFromAIInteractionPrompts = () => {
  if (interactionsChannel) {
    appLog(SERVICE_NAME, 'Unsubscribing from AI interaction prompts.', 'info');
    interactionsChannel.unsubscribe();
    interactionsChannel = null;
  }
};

export const getRealtimeServiceStatus = () => {
  return {
    isInitialized: !!supabase,
    isSubscribed: !!interactionsChannel,
    channelState: interactionsChannel?.state || 'unsubscribed'
  };
};
