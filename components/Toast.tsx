'use client'

export function showToast(msg: string) {
  const existing = document.querySelector('.toast')
  if (existing) existing.remove()
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = msg
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('is-visible'))
  setTimeout(() => {
    toast.classList.remove('is-visible')
    setTimeout(() => toast.remove(), 400)
  }, 3000)
}
