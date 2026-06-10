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
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const registerUser = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const placeOrder = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
  });
  return res.json();
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

// ─── Payment ────────────────────────────────────────────────────────────────

export const initiateEsewa = async (orderId) => {
  const res = await fetch(`${API_BASE_URL}/payment/esewa/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ orderId }),
  });
  return res.json();
};

export const verifyEsewa = async (encodedData, paymentId) => {
  const res = await fetch(`${API_BASE_URL}/payment/esewa/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ encodedData, paymentId }),
  });
  return res.json();
};

export const initiateKhalti = async (orderId) => {
  const res = await fetch(`${API_BASE_URL}/payment/khalti/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ orderId }),
  });
  return res.json();
};

export const verifyKhalti = async (pidx, paymentId) => {
  const res = await fetch(`${API_BASE_URL}/payment/khalti/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ pidx, paymentId }),
  });
  return res.json();
};
