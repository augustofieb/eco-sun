import DOMPurify from 'dompurify'

const SANITIZER_OPTIONS = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'iframe', 'object', 'embed'],
}

export const sanitizeHtml = (value) => {
  if (typeof value !== 'string') return ''
  return DOMPurify.sanitize(value, SANITIZER_OPTIONS)
}