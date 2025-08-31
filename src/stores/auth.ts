// src/stores/auth.ts
// Compatible version that works with your existing LoginPage.vue

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LoginCredentials {
  siteDomain: string
  username: string
  password: string
  rememberMe: boolean
}

export interface User {
  username: string
  email: string
  full_name: string
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const siteDomain = ref('')
  const isLoading = ref(false)
  const authCookies = ref('')

  // Helper function to get API URL
  const getApiUrl = (endpoint: string) => {
    if (import.meta.env.DEV) {
      return `/api${endpoint}`
    }
    return `${siteDomain.value}/api${endpoint}`
  }

  // Load saved credentials
  const loadSavedCredentials = () => {
    const saved = localStorage.getItem('innomate_credentials')
    if (saved) {
      const credentials = JSON.parse(saved)
      siteDomain.value = credentials.siteDomain
      return {
        siteDomain: credentials.siteDomain,
        username: credentials.username,
        rememberMe: true
      }
    }
    return null
  }

  // Save credentials
  const saveCredentials = (credentials: LoginCredentials) => {
    if (credentials.rememberMe) {
      localStorage.setItem('innomate_credentials', JSON.stringify({
        siteDomain: credentials.siteDomain,
        username: credentials.username
      }))
    } else {
      localStorage.removeItem('innomate_credentials')
    }
  }

  // Enhanced login with better authentication handling
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    
    try {
      siteDomain.value = credentials.siteDomain
      
      const loginUrl = getApiUrl('/method/login')
      console.log('Attempting login to:', loginUrl)
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          usr: credentials.username,
          pwd: credentials.password
        }),
        credentials: 'include' // Important: include cookies
      })

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Login response:', data)
      
      if (data.message === 'Logged In') {
        // Capture cookies from response for better session management
        const cookieHeader = response.headers.get('set-cookie')
        if (cookieHeader) {
          authCookies.value = cookieHeader
          console.log('Auth cookies captured:', cookieHeader)
        }

        // Get user info with proper authentication
        try {
          const userInfoResponse = await fetch(getApiUrl('/method/frappe.auth.get_logged_user'), {
            credentials: 'include',
            headers: {
              'Accept': 'application/json'
            }
          })
          
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json()
            console.log('User info:', userInfo)
            user.value = userInfo.message
          } else {
            console.warn('Could not fetch user info, using fallback')
            user.value = { 
              username: credentials.username, 
              email: credentials.username, 
              full_name: credentials.username 
            }
          }
        } catch (userError) {
          console.warn('Error fetching user info:', userError)
          user.value = { 
            username: credentials.username, 
            email: credentials.username, 
            full_name: credentials.username 
          }
        }

        isAuthenticated.value = true
        saveCredentials(credentials)
        
        return { success: true }
      } else {
        throw new Error(data.message || 'Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      
      let errorMessage = 'Login failed'
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to ERPNext server. Please check the server URL and your internet connection.'
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    } finally {
      isLoading.value = false
    }
  }

  // Enhanced API request method with proper authentication
  const makeAuthenticatedRequest = async (endpoint: string, options: any = {}) => {
    const url = getApiUrl(endpoint)
    
    const requestOptions = {
      credentials: 'include' as RequestCredentials,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Add any stored authentication headers
        ...options.headers
      },
      ...options
    }

    console.log(`Making authenticated request to: ${url}`)

    try {
      const response = await fetch(url, requestOptions)
      
      console.log(`Response status: ${response.status}`)
      
      if (response.status === 403) {
        console.error('403 Forbidden - Authentication may have expired')
        return { success: false, error: 'Authentication required', needsAuth: true }
      }
      
      if (response.status === 401) {
        console.error('401 Unauthorized - Invalid credentials')
        return { success: false, error: 'Invalid credentials', needsAuth: true }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Authenticated request failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Request failed' 
      }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      if (siteDomain.value) {
        await fetch(getApiUrl('/method/logout'), {
          method: 'POST',
          credentials: 'include'
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      isAuthenticated.value = false
      user.value = null
      authCookies.value = ''
      // Don't clear siteDomain so we can reconnect
    }
  }

  // Check if user is already logged in
  const checkAuthStatus = async () => {
    const saved = loadSavedCredentials()
    if (saved?.siteDomain) {
      try {
        const result = await makeAuthenticatedRequest('/method/frappe.auth.get_logged_user')
        
        if (result.success && result.data?.message && result.data.message !== 'Guest') {
          user.value = result.data.message
          isAuthenticated.value = true
        } else if (result.needsAuth) {
          // Authentication expired, need to login again
          isAuthenticated.value = false
          user.value = null
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
  }

  return {
    // State
    isAuthenticated,
    user,
    siteDomain,
    isLoading,
    authCookies,
    
    // Actions (compatible with your LoginPage.vue)
    login,
    logout,
    checkAuthStatus,
    loadSavedCredentials,
    saveCredentials,
    getApiUrl,
    makeAuthenticatedRequest
  }
})