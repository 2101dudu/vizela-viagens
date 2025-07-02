export const _get_token = async (password: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8080/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
};