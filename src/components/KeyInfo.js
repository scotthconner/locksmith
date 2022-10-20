import { FcKey } from 'react-icons/fc';
import { HiOutlineKey } from 'react-icons/hi';

export function KeyInfoIcon(keyInfo, size = null, props = {}) {
  var sizeProps = size ? {size: size} : {};
  return (keyInfo.data.isRoot ? <FcKey {... sizeProps} {... props}/> :  <HiOutlineKey {... sizeProps} {... props}/>)
}
