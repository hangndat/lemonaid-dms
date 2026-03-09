import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

/** Supported display currencies. Data is always stored in VND. */
export type Currency = 'VND' | 'USD' | 'SGD' | 'THB'

/** VND per 1 unit of foreign currency (approximate). */
export const CURRENCY_RATES: Record<Exclude<Currency, 'VND'>, number> = {
  USD: 25_000,
  SGD: 18_500,
  THB: 700,
}

const CURRENCY_STORAGE_KEY = 'dms-currency'

function loadStoredCurrency(): Currency {
  if (typeof localStorage === 'undefined') return 'VND'
  const s = localStorage.getItem(CURRENCY_STORAGE_KEY)
  if (s === 'USD' || s === 'SGD' || s === 'THB' || s === 'VND') return s
  return 'VND'
}

interface CurrencyContextValue {
  currency: Currency
  setCurrency: (c: Currency) => void
  /** Format value (VND) for display in current currency. */
  formatPrice: (valueVnd: number | null | undefined) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(loadStoredCurrency)

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c)
    localStorage.setItem(CURRENCY_STORAGE_KEY, c)
  }, [])

  const formatPrice = useCallback(
    (valueVnd: number | null | undefined): string => {
      if (valueVnd == null) return '—'
      if (currency === 'VND') {
        return (valueVnd / 1_000_000).toFixed(0) + ' tr'
      }
      const rate = CURRENCY_RATES[currency]
      const amount = valueVnd / rate
      if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + 'M ' + currency
      if (amount >= 1_000) return (amount / 1_000).toFixed(1) + 'k ' + currency
      if (amount >= 1) return amount.toFixed(0) + ' ' + currency
      return amount.toFixed(2) + ' ' + currency
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
