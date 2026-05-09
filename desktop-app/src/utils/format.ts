export const formatNumber = (num: number, decimals = 2) => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export const formatPercent = (num: number, decimals = 2) => {
  return `${(num * 100).toFixed(decimals)}%`
}

export const formatCurrency = (num: number, currency = 'CNY') => {
  return num.toLocaleString('zh-CN', {
    style: 'currency',
    currency
  })
}

export const truncate = (str: string, length = 50, suffix = '...') => {
  if (str.length <= length) return str
  return str.substring(0, length) + suffix
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const camelCase = (str: string) => {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

export const kebabCase = (str: string) => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}
