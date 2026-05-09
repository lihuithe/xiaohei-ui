<script setup lang="ts">
import { ref, onMounted, watch, type WatchSource } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, AreaChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
} from 'echarts/components'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
])

interface ChartProps {
  option: EChartsOption
  theme?: string
  width?: string
  height?: string
}

const props = withDefaults(defineProps<ChartProps>(), {
  theme: 'light',
  width: '100%',
  height: '400px',
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value, props.theme)
    chartInstance.setOption(props.option)

    window.addEventListener('resize', handleResize)
  }
})

watch(
  () => props.option,
  (newOption) => {
    if (chartInstance) {
      chartInstance.setOption(newOption, true)
    }
  },
  { deep: true }
)

function handleResize() {
  chartInstance?.resize()
}

defineExpose({
  getChartInstance: () => chartInstance,
})
</script>

<template>
  <div ref="chartRef" :style="{ width, height }"></div>
</template>
