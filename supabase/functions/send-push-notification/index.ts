import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  user_ids?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: 'order_status' | 'promotion' | 'general';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_ids, title, body, data = {}, type = 'general' }: NotificationPayload = await req.json();

    console.log('Sending push notification:', { user_ids, title, body, type });

    // Get push tokens for the specified users
    let query = supabaseClient
      .from('push_tokens')
      .select('token, platform, user_id');

    if (user_ids && user_ids.length > 0) {
      query = query.in('user_id', user_ids);
    }

    const { data: tokens, error: tokenError } = await query;

    if (tokenError) {
      console.error('Error fetching push tokens:', tokenError);
      throw tokenError;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No push tokens found for the specified users');
      return new Response(
        JSON.stringify({ message: 'No push tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification records in database
    const notifications = tokens.map(token => ({
      user_id: token.user_id,
      title,
      body,
      type,
      data,
    }));

    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error creating notification records:', notificationError);
      throw notificationError;
    }

    // Send push notifications
    const sendPromises = tokens.map(async (tokenData) => {
      try {
        // This is a simplified example. In production, you would use:
        // - Firebase Cloud Messaging (FCM) for Android
        // - Apple Push Notification service (APNs) for iOS
        // - Web Push for web notifications
        
        console.log(`Sending notification to ${tokenData.platform} device:`, tokenData.token);
        
        // For now, we'll just log the notification
        // In a real implementation, you would send the actual push notification here
        return { success: true, token: tokenData.token };
      } catch (error) {
        console.error(`Failed to send notification to token ${tokenData.token}:`, error);
        return { success: false, token: tokenData.token, error };
      }
    });

    const results = await Promise.all(sendPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Push notification results: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        message: 'Push notifications processed',
        successful,
        failed,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});