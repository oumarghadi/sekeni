'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function TestSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    console.log('Testing Signup with:', { email });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Test User',
          }
        }
      });

      if (error) throw error;
      
      console.log('Signup Response:', data);
      setMessage('Success! Check Supabase Auth users. (Wait for email confirmation if enabled)');
    } catch (err: any) {
      console.error('Signup Error:', err);
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-20 max-w-md mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Minimal Signup Test</h1>
      <form onSubmit={handleSignup} className="space-y-4">
        <Input 
          label="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="test@example.com"
          required
        />
        <Input 
          label="Password" 
          type="password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="••••••••"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Testing...' : 'Test Signup'}
        </Button>
      </form>
      {message && <p className="p-4 bg-gray-100 rounded text-sm">{message}</p>}
    </div>
  );
}
