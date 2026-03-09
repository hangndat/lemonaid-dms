import { Grid } from 'antd'

/**
 * True when viewport is below the `lg` breakpoint (992px).
 * Use to auto-collapse filter bars on mobile/tablet (same breakpoint as ProLayout sidebar).
 */
export function useIsMobile(): boolean {
  const screens = Grid.useBreakpoint()
  return screens?.lg === false
}
