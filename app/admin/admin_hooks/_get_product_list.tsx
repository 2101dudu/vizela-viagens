export interface Product {
  Code?: string;
  Name?: string;
  ImageUrl?: string;
  PriceFrom?: string;
}

export interface ProductWrapper {
  product: Product;
  tags: string[];
}

export const _get_product_list = async (): Promise<ProductWrapper[]> => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch('http://localhost:8080/api/admin/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        throw new Error('Authentication failed or token expired');
      }
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const json = await response.json();
    return json.list as ProductWrapper[];
  } catch (err) {
    console.error('Failed to get product list:', err);
    throw err;
  }
};
