import { Homepage } from './Homepage'

/**
 * Split cards: transparent copy half + Deep 1px stroke.
 * Dev: http://localhost:5177/homepage5.html  ·  Prod: /homepage5
 */
export function Homepage5() {
  return <Homepage featuresLayout="outlined" heroScrollExit />
}
