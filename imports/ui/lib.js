const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const getUniqueId = () => {
  // Check if the identifier is already stored
  let uniqueId = localStorage.getItem('uniqueId')

  // If not, generate a new one and store it
  if (!uniqueId) {
    uniqueId = generateUniqueId()
    localStorage.setItem('uniqueId', uniqueId)
  }

  return uniqueId
}

const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
  }
  return hash
}

const generateColorFromUniqueId = (uniqueId) => {
  const hash = simpleHash(uniqueId)
  const color = `#${((hash >>> 0) & 0xffffff).toString(16).padStart(6, '0')}`

  return color
}

const isMobile = () => {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth
}

export { getUniqueId, generateColorFromUniqueId, isMobile }
