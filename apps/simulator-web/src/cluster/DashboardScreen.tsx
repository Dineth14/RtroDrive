import { useSettingsStore } from '@/state/settingsStore'
import { CLUSTER_LAYOUTS } from './layouts/registry'

export function DashboardScreen() {
  const layoutId = useSettingsStore((s) => s.display.clusterLayout)
  const Layout = CLUSTER_LAYOUTS[layoutId]
  return <Layout />
}
