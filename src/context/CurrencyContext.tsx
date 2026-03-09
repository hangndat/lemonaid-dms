import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

/** Supported display currencies. Data is always stored in THB (Baht). */
export type Currency = 'VND' | 'USD' | 'SGD' | 'THB'

/** Số THB tương đương 1 đơn vị ngoại tệ (ước lượng). Dùng để quy đổi giá lưu (THB) sang hiển thị. */
export const THB_PER_UNIT: Record<Exclude<Currency, 'THB'>, number> = {
  USD: 36,
  SGD: 26,
  VND: 1 / 700,
}

const CURRENCY_STORAGE_KEY = 'dms-currency'

function loadStoredCurrency(): Currency {
  if (typeof localStorage === 'undefined') return 'THB'
  const s = localStorage.getItem(CURRENCY_STORAGE_KEY)
  if (s === 'USD' || s === 'SGD' || s === 'THB' || s === 'VND') return s
  return 'THB'
}

interface CurrencyContextValue {
  currency: Currency
  setCurrency: (c: Currency) => void
  /** Format value (THB) for display in current currency. */
  formatPrice: (valueThb: number | null | undefined) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

function formatAmount(amount: number, currency: Currency): string {
  if (currency === 'VND') {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(0) + ' tr'
    if (amount >= 1_000) return (amount / 1_000).toFixed(1) + 'k'
    return amount.toFixed(0)
  }
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(2) + ' M ' + currency
  if (amount >= 1_000) return (amount / 1_000).toFixed(1) + 'k ' + currency
  if (amount >= 1) return amount.toFixed(0) + ' ' + currency
  return amount.toFixed(2) + ' ' + currency
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(loadStoredCurrency)

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c)
    localStorage.setItem(CURRENCY_STORAGE_KEY, c)
  }, [])

  const formatPrice = useCallback(
    (valueThb: number | null | undefined): string => {
      if (valueThb == null) return '—'
      if (currency === 'THB') return formatAmount(valueThb, 'THB')
      const rate = THB_PER_UNIT[currency]
      const amount = currency === 'VND' ? valueThb / rate : valueThb / rate
      return formatAmount(amount, currency)
    },
    [currency]
  )

  const value = useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency, formatPrice }),
    [currency, setCurrency, formatPrice]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}

export { CURRENCY_STORAGE_KEY }
