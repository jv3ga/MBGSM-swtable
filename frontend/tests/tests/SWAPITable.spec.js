import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { nextTick } from 'vue'
import axios from '@/plugins/axios-config'
import SWAPITable from '@/components/SWAPITable.vue'

// Mock axios
vi.mock('@/plugins/axios-config')
global.ResizeObserver = require('resize-observer-polyfill')

// Mock filters
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

    // Configure simulated data
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
    const dataTable = wrapper.findComponent({ name: 'VDataTableServer' })
    expect(dataTable.exists()).toBe(true)
  })

  it('loads data on mount', async () => {
    await nextTick()
    expect(axios.get).toHaveBeenCalledWith('/test-api', {
      params: defaultParams
    })
    expect(wrapper.vm.items).toEqual(mockAxiosResponse.data.results)
    expect(wrapper.vm.totalItems).toBe(2)
  })

  it('handles pagination correctly', async () => {
    const dataTable = wrapper.findComponent({ name: 'VDataTableServer' })

    // simulate page change by update:options
    await dataTable.vm.$emit('update:options', {
      page: 2,
      itemsPerPage: 15
    })

    // wait for state change
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.page).toBe(2)
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

    // simulate change ordering
    await dataTable.vm.$emit('update:sort-by', [{
      key: 'created',
      order: 'asc'
    }])
    await nextTick()

    expect(wrapper.vm.sortBy).toBe('created')
    expect(wrapper.vm.order).toBe('asc')
    expect(axios.get).toHaveBeenCalledWith('/test-api', {
      params: defaultParams
    })
  })

  it('displays an error message when loading fails', async () => {
    // Axios error
    const errorMessage = 'Connection error'
    vi.mocked(axios.get).mockRejectedValue({
      response: {
        status: 500,
        data: errorMessage
      }
    })

    // Force fetching data
    await wrapper.vm.fetchData()
    expect(wrapper.vm.errorMessage).toBe(errorMessage)
    const errorAlert = wrapper.findComponent({ name: 'VAlert' })
    expect(errorAlert.exists()).toBe(true)
    expect(errorAlert.props('text')).toBe(errorMessage)
  })

  it('applies search filtering', async () => {
    const searchInput = wrapper.findComponent({ name: 'VTextField' })
    await searchInput.vm.$emit('update:model-value', 'test')
    // Wait for debounce (500 ms) + security margin
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
    expect(mockShortDateTime).toHaveBeenCalledTimes(2)
    expect(mockShortDateTime).toHaveBeenCalledWith(
      new Date('2023-01-01')
    )
  })
})
