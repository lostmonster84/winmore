// OUTPOST Trading System - Client-side Auth Helpers

export const clientAuth = {
  async login(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success) {
        // Small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  },

  async checkSession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include', // Important for cookies
      });
      const data = await response.json();
      console.log('Session check response:', data);
      return data.authenticated;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  }
};