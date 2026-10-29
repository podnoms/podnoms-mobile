// SecureStore has no web version, so in a browser (for development) the
// token and server address go in localStorage.
export async function getItem(key: string) {
  return localStorage.getItem(key)
}

export async function setItem(key: string, value: string) {
  localStorage.setItem(key, value)
}

export async function deleteItem(key: string) {
  localStorage.removeItem(key)
}
