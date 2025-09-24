import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { patient_id, prompt } = await req.json()

    // In a real scenario, you'd use the service role key to fetch data securely.
    // const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    // --- 1. Fetch Patient Data (Mocked) ---
    // Here you would fetch the patient's profile, recent vitals, and symptoms.
    // const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', patient_id).single()
    // const { data: vitals } = await supabaseAdmin.from('vitals').select('*').eq('user_id', patient_id).limit(5)
    // const { data: symptoms } = await supabaseAdmin.from('symptoms').select('*').eq('user_id', patient_id).limit(5)

    const mockPatientDataContext = {
      profile: { full_name: "John Doe", age: 45 },
      vitals: [{ recorded_at: "yesterday", spo2: 98, heart_rate: 75 }],
      symptoms: [{ recorded_at: "yesterday", symptoms: ["cough", "fatigue"], severity: 3 }]
    }

    // --- 2. AI Provider Call (Mocked) ---
    const mockAiPrompt = `Based on this data: ${JSON.stringify(mockPatientDataContext)}, the admin asked: "${prompt}". Provide a concise summary and answer.`
    console.log("Mock AI Prompt for Admin Chatbot:", mockAiPrompt);

    // Mock response
    const mockAiResponse = {
      summary: "The patient, John Doe (45), recently reported a cough and fatigue with a severity of 3/5. Their latest vitals appear stable with an SpO2 of 98% and heart rate of 75 bpm.",
      suggested_next_steps: [
        "Ask the patient if their cough is productive.",
        "Recommend monitoring symptoms for the next 24-48 hours.",
        "Schedule a follow-up if symptoms persist."
      ],
      templated_message_to_patient: "Hello John, I've reviewed your recent symptoms. Please continue to rest and monitor your condition. Let us know if anything changes or worsens."
    }

    return new Response(JSON.stringify(mockAiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
