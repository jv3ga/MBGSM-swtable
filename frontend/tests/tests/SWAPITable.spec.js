import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { nextTick } from 'vue'
import axios from '@/plugins/axios-config'
import SWAPITable from '@/components/SWAPITable.vue'

// Mock de axios
vi.mock('@/plugins/axios-config')
global.ResizeObserver = require('resize-observer-polyfill')

// Mock de filtros globales
const mockShortDateTime = vi.fn(date => date.toISOString())
const globalMocks = {
  $filters: {
    shortDateTime: mockShortDateTime
  }
}

describe('SWAPITable Component', () => {
  let wrapper
  const vuetify = createVuetify({ components, directives })

  const mockAxiosResponse = {
    data: {
      results: [
        { id: 1, name: 'Item 1', created: new Date('2023-01-01') },
        { id: 2, name: 'Item 2', created: new Date('2023-02-01') }
      ],
      count: 2
    }
  }

  const apiUrl = '/test-api'
  const defaultParams = {
    search: '',
    page: 1,
    sortBy: 'name',
    order: 'desc'
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Configurar mock de axios para devolver datos simulados
    vi.mocked(axios.get).mockResolvedValue(mockAxiosResponse)

    wrapper = mount(SWAPITable, {
      props: {
        apiUrl: apiUrl,
      },
      global: {
        plugins: [vuetify],
        mocks: globalMocks
      }
    })
  })

  it('renders the component correctly', async () => {
    expect(wrapper.exists()).toBe(true)
    await nextTick()

    // Verificar que la tabla se renderice
    const dataTable = wrapper.findComponent({ name: 'VDataTableServer' })
    expect(dataTable.exists()).toBe(true)
  })

  it('loads data on mount', async () => {
    await nextTick()

    // Verificar que axios.get se llame con los parámetros correctos
    expect(axios.get).toHaveBeenCalledWith('/test-api', {
      params: defaultParams
    })

    // Verificar que los items se hayan cargado
    expect(wrapper.vm.items).toEqual(mockAxiosResponse.data.results)
    expect(wrapper.vm.totalItems).toBe(2)
  })

  it('handles pagination correctly', async () => {
    const dataTable = wrapper.findComponent({ name: 'VDataTableServer' })

    // Simular cambio de página a través de update:options
    await dataTable.vm.$emit('update:options', {
      page: 2,
      itemsPerPage: 15
    })

    // Esperar a que se actualice el estado
    await wrapper.vm.$nextTick()

    // Verificar que el número de página se haya actualizado
    expect(wrapper.vm.page).toBe(2)

    // Verificar que se llame a fetchData con los parámetros correctos
    expect(axios.get).toHaveBeenCalledWith('/test-api', {
      params: {
        search: '',
        page: 2,
        sortBy: 'name',
        order: 'desc'
      }
    })
  })


  it('handles sorting correctly', async () => {
    const dataTable = wrapper.findComponent({ name: 'VDataTableServer' })

    // Simular cambio de ordenamiento
    await dataTable.vm.$emit('update:sort-by', [{
      key: 'created',
      order: 'asc'
    }])

    // Esperar a que se actualice el estado
    await nextTick()

    expect(wrapper.vm.sortBy).toBe('created')
    expect(wrapper.vm.order).toBe('asc')
    expect(axios.get).toHaveBeenCalledWith('/test-api', {
      params: defaultParams
    })
  })

  it('displays an error message when loading fails', async () => {
    // Simular error de axios
    const errorMessage = 'Error de conexión'
    vi.mocked(axios.get).mockRejectedValue({
      response: {
        status: 500,
        data: errorMessage
      }
    })

    // Forzar recarga de datos
    await wrapper.vm.fetchData()

    // Verificar que se muestre el mensaje de error
    expect(wrapper.vm.errorMessage).toBe(errorMessage)
    const errorAlert = wrapper.findComponent({ name: 'VAlert' })
    expect(errorAlert.exists()).toBe(true)
    expect(errorAlert.props('text')).toBe(errorMessage)
  })

  it('applies search filtering', async () => {
    const searchInput = wrapper.findComponent({ name: 'VTextField' })

    // Simular entrada de texto de búsqueda
    await searchInput.vm.$emit('update:model-value', 'test')

    // Esperar al debounce (500 ms) + margen de seguridad
    await new Promise(resolve => setTimeout(resolve, 600))
    expect(axios.get).toHaveBeenCalledWith('/test-api', {
      params: {
        search: 'test',
        page: 1,
        sortBy: 'name',
        order: 'desc'
      }
    })
  })


  it('formats the creation date correctly', async () => {
    await nextTick()

    // Verificar que se llame al filtro de fecha
    expect(mockShortDateTime).toHaveBeenCalledTimes(2)
    expect(mockShortDateTime).toHaveBeenCalledWith(
      new Date('2023-01-01')
    )
  })
})