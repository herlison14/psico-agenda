import { describe, it, expect } from 'vitest'
import { maskCPF, maskPhone, fmtBRL } from './utils'

describe('maskCPF', () => {
  it('formata CPF completo', () => {
    expect(maskCPF('12345678901')).toBe('123.456.789-01')
  })

  it('ignora caracteres não numéricos', () => {
    expect(maskCPF('123.456.789-01')).toBe('123.456.789-01')
  })

  it('trunca em 11 dígitos', () => {
    expect(maskCPF('123456789012345')).toBe('123.456.789-01')
  })

  it('retorna parcialmente formatado quando incompleto', () => {
    expect(maskCPF('123')).toBe('123')
    expect(maskCPF('12345')).toBe('123.45')
  })
})

describe('maskPhone', () => {
  it('formata celular com 11 dígitos', () => {
    expect(maskPhone('21997927927')).toBe('(21) 99792-7927')
  })

  it('formata fixo com 10 dígitos', () => {
    expect(maskPhone('2133334444')).toBe('(21) 3333-4444')
  })

  it('ignora caracteres não numéricos', () => {
    expect(maskPhone('(21) 99792-7927')).toBe('(21) 99792-7927')
  })
})

describe('fmtBRL', () => {
  it('formata valor em BRL', () => {
    expect(fmtBRL(150)).toContain('150')
    expect(fmtBRL(150)).toContain('R$')
  })

  it('formata zero', () => {
    expect(fmtBRL(0)).toContain('0')
  })
})
