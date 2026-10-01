import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from './sanitizeHtml'

describe('sanitizeHtml', () => {
  it('preserva formatação e remove scripts, handlers e URLs executáveis', () => {
    const cleaned = sanitizeHtml(
      '<p onclick="alert(1)">Energia <strong>solar</strong>' +
      '<img src="x" onerror="alert(1)">' +
      '<a href="javascript:alert(1)">link</a>' +
      '<script>alert(1)</script></p>'
    )

    expect(cleaned).toContain('<strong>solar</strong>')
    expect(cleaned).not.toMatch(/onclick|onerror|javascript:|<script/i)
  })
})