const API_BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api/auth', '')
  : 'http://localhost:5000';

export default API_BASE;
