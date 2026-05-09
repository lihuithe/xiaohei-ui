import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatDate = (date: dayjs.ConfigType, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: dayjs.ConfigType, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).format(format)
}

export const formatRelativeTime = (date: dayjs.ConfigType, locale = 'zh') => {
  return dayjs(date).locale(locale).fromNow()
}

export const isToday = (date: dayjs.ConfigType) => {
  return dayjs(date).isSame(dayjs(), 'day')
}

export const isYesterday = (date: dayjs.ConfigType) => {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}

export const isTomorrow = (date: dayjs.ConfigType) => {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day')
}
