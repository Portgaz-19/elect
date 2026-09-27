const TOKEN_KEY = 'elect_token'
const ROLE_KEY = 'elect_role'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY)
}

export function setSession(token, role) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, role)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
}

// Every custom exception on the backend comes back through
// GlobalExceptionHandler as { message, status, error, timestamp } — this
// pulls the human-readable message out consistently so every page can just
// catch and display err.message.
async function request(path, options = {}) {
  const token = getToken()
  const headers = { ...(options.headers || {}) }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`/api${path}`, { ...options, headers })

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    // no body (rare, but some endpoints could return empty)
  }

  if (!res.ok) {
    let message = data?.message || `Request failed with status ${res.status}`
    if (data?.details && typeof data.details === 'object') {
      const fieldMessages = Object.values(data.details).join(', ')
      message = fieldMessages || message
    }
    throw new Error(message)
  }
  return data
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) =>
    request(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
}
