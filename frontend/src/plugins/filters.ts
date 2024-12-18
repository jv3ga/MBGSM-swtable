import filters from '@/utils/filters'

export default {
  install(app: any) {
    app.config.globalProperties.$filters = {
      shortDateTime: filters.shortDateTime,
    }
  }
}
