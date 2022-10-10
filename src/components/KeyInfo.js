import { FcKey } from 'react-icons/fc';
import { HiOutlineKey } from 'react-icons/hi';

export function KeyInfoIcon(keyInfo, size = null) {
  var sizeProps = size ? {size: size} : {};
  return (keyInfo.data.isRoot ? <FcKey {... sizeProps}/> :  <HiOutlineKey {... sizeProps}/>)
}
