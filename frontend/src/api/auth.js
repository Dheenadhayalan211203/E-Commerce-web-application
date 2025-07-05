import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

// Renamed from register to signupRequestOtp to reflect the new flow
const signupRequestOtp = async (userData) => {
  const response = await axios.post(API_URL + 'signup-request-otp', userData);
  return response.data; // Just return message, no token yet
};

const verifyOtp = async (email, otp) => {
  const response = await axios.post(API_URL + 'verify-otp', { email, otp });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const resendOtp = async (email) => {
  const response = await axios.post(API_URL + 'resend-otp', { email });
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const authService = {
  signupRequestOtp, // Updated name
  verifyOtp,
  resendOtp,
  login,
  logout,
};

export default authService;