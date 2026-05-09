import { config } from '@vue/test-utils'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/vue'

afterEach(cleanup)

beforeAll(() => {
  config.global.config.warnHandler = () => {}
})
