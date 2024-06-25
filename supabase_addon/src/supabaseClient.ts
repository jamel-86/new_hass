import { createClient } from '@supabase/supabase-js';

let supabase: any;

export const initializeSupabase = (url: string, key: string) => {
  supabase = createClient(url, key);
};

export const insertState = async (state: any) => {
  try {
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .eq('entity_id', state.entity_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      // Update existing record
      const updatedStateHistory = [...data.state_history, { state: state.state, timestamp: new Date().toISOString() }];
      const { error: updateError } = await supabase
        .from('states')
        .update({
          state: state.state,  // Ensure the state field is populated
          state_history: updatedStateHistory,
          attributes: state.attributes,
          last_changed: state.last_changed,
          last_updated: state.last_updated,
          context: state.context,
        })
        .eq('entity_id', state.entity_id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('states')
        .insert({
          entity_id: state.entity_id,
          state: state.state,  // Ensure the state field is populated
          state_history: [{ state: state.state, timestamp: new Date().toISOString() }],
          attributes: state.attributes,
          last_changed: state.last_changed,
          last_updated: state.last_updated,
          context: state.context,
        });

      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error inserting state:', error);
  }
};

export const insertEvent = async (data: any) => {
  const { error } = await supabase.from('events').insert(data);
  if (error) throw new Error(error.message);
};

export const insertTransformedEvent = async (data: any) => {
  const { error } = await supabase.from('transformed_events').insert(data);
  if (error) throw new Error(error.message);
};
