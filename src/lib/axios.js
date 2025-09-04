import axios from 'axios'

// 🌍 Root Domain from .env
// const BASE_ROOT = 'https://bluapi.aas.technology';
const BASE_ROOT = "http://localhost:8080" || 'https://bluapi.aas.technology';

// 1️⃣ Instance 1 - Root domain - /api
export const axiosInstance = axios.create({
  baseURL: `${BASE_ROOT}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
    withCredentials: true,
})

// 2️⃣ Instance 2 - /api
export const axiosInstance2 = axios.create({
  baseURL: `${BASE_ROOT}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, 
})

// 3️⃣ Instance 3 - /meeting 
export const axiosInstance3 = axios.create({
  baseURL: `${BASE_ROOT}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
})

// 4️⃣ Instance 4 - /public realed thunks like payment
// This instance is used for public APIs that do not require authentication.
export const axiosInstancePublic = axios.create({
  baseURL: `${BASE_ROOT}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

