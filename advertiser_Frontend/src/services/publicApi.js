import axios from 'axios'

const publicApi = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
})

export default publicApi
