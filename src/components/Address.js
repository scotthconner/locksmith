export function DisplayAddress({address, ...rest}) {
  return address.substring(0,5) + '...' + address.substring(address.length - 3)
}
