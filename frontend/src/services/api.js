const API_BASE_URL = "http://localhost:3001/api";

const authHeader = () => {
  const token = localStorage.getItem("dokan_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchProducts = async (params = {}) => {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/products?${qs}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("fetchProducts error:", err);
    return [];
  }
};

export const fetchProductById = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) {
    console.error("fetchProductById error:", err);
    return null;
  }
};

export const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("fetchCategories error:", err);
    return [];
  }
};

export const loginUser = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  } catch (err) {
    console.error("loginUser error:", err);
    throw err;
  }
};

export const registerUser = async (payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  } catch (err) {
    console.error("registerUser error:", err);
    throw err;
  }
};

export const placeOrder = async (payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(payload),
    });
    return res.json();
  } catch (err) {
    console.error("placeOrder error:", err);
    throw err;
  }
};

export const fetchMyOrders = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: authHeader(),
    });
    return res.json();
  } catch (err) {
    console.error("fetchMyOrders error:", err);
    throw err;
  }
};

export const fetchVendorProducts = async (vendorId) => {
  return fetchProducts({ vendorId });
};

export const fetchVendorOrders = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/vendor`, {
      headers: authHeader(),
    });
    return res.json();
  } catch (err) {
    console.error("fetchVendorOrders error:", err);
    throw err;
  }
};

export const createProduct = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updateProduct = async (id, payload) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  return res.json();
};
