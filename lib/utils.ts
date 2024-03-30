// convert address to 0x123...567
export function shortenAddress(address: string, chars = 3): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// uppercase first letter of input string
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
