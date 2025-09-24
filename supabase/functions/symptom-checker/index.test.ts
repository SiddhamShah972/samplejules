import { superoak } from 'https://deno.land/x/superoak@4.7.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { assertEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts';

// Note: This is a simplified test structure.
// For a real Supabase Edge Function, you would mock the Supabase client
// and other dependencies. We are testing the mock implementation here.

// Mock the server function from the actual index.ts
// In a real project, you might refactor index.ts to export the handler function
// so it can be imported and tested directly without spinning up a server.
// For simplicity here, we'll assume the function logic is available.

const mockHandler = async (req: Request): Promise<Response> => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symptoms } = await req.json();
    if (!symptoms || !Array.isArray(symptoms)) {
        throw new Error("Symptoms are required and must be an array.");
    }

    const mockAiResponse = {
      causes: ["Common cold or flu", "Allergic reaction", "Sinus infection"],
      red_flags: ["Difficulty breathing", "Chest pain", "High fever lasting more than 3 days"],
      advice: ["Rest and stay hydrated.", "Use over-the-counter medication for symptoms.", "Monitor your temperature."],
      follow_up: "Consult a doctor if symptoms worsen or do not improve after 5-7 days."
    };

    return new Response(JSON.stringify(mockAiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
};


Deno.test('Symptom Checker Edge Function', async (t) => {
  await t.step('should return a mock AI response for valid input', async () => {
    const request = await superoak(mockHandler);
    await request.post('/')
      .send({ user_id: 'some-uuid', symptoms: ['headache', 'sore throat'] })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        assertEquals(res.body.causes.length, 3);
        assertEquals(res.body.red_flags.length, 3);
        assertEquals(res.body.advice.length, 3);
      });
  });

  await t.step('should return 400 for missing symptoms', async () => {
    const request = await superoak(mockHandler);
    await request.post('/')
      .send({ user_id: 'some-uuid' })
      .expect(400)
      .expect('Content-Type', /json/)
      .expect((res) => {
        assertEquals(res.body.error, 'Symptoms are required and must be an array.');
      });
  });
});
