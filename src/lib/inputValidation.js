const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])?$/i

export function sanitizeText(value, maxLength = 100) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function sanitizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function validateEmail(value) {
  const email = sanitizeEmail(value)
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address.'
  }
  return ''
}

export function validateFullName(value) {
  const name = sanitizeText(value)
  if (name.length < 2 || name.length > 100) {
    return 'Full name must be between 2 and 100 characters.'
  }
  if (/[<>]/.test(name)) {
    return 'Full name contains unsupported characters.'
  }
  return ''
}

export function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) {
    return 'Password must be between 8 and 128 characters.'
  }
  if (/[\u0000-\u001F\u007F]/.test(value)) {
    return 'Password contains unsupported characters.'
  }
  return ''
}

export function sanitizeUsername(value) {
  return sanitizeText(value, 32).toLowerCase()
}

export function validateUsername(value) {
  const username = sanitizeUsername(value)
  if (username && !USERNAME_PATTERN.test(username)) {
    return 'Username may contain only letters, numbers, dots, underscores, and hyphens.'
  }
  return ''
}
