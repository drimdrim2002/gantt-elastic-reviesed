<!--
/**
 * @fileoverview Days highlight component
 * @license MIT
 * @author Rafal Pospiech <neuronet.io@gmail.com>
 * @package GanttElastic
 */
-->

<template>
  <g
    class="gantt-elastic__chart-days-highlight-container"
    :style="{ ...root.style['chart-days-highlight-container'] }"
    v-if="showWorkingDays"
  >
    <rect
      class="gantt-elastic__chart-days-highlight-rect"
      v-for="day in workingDays"
      :key="getKey(day)"
      :x="day.offset.px || 0"
      y="0"
      :width="isNaN(day.width.px) ? 0 : day.width.px"
      height="100%"
      :style="{ ...root.style['chart-days-highlight-rect'] }"
    ></rect>
  </g>
</template>

<script>
import dayjs from 'dayjs';
export default {
  name: 'DaysHighlight',
  inject: ['root'],
  data() {
    return {};
  },
  methods: {
    /**
     * Get key
     *
     * @param {object} day
     * @returns {string} key ideintifier for loop
     */
    getKey(day) {
      return dayjs(day.time).format('YYYY-MM-DD');
    }
  },
  computed: {
    /**
     * Get working days
     *
     * @returns {array}
     */
    workingDays() {
      if (!this.root.state.options.times.steps || !Array.isArray(this.root.state.options.times.steps)) {
        console.warn('DaysHighlight: steps is not an array');
        return [];
      }
      
      return this.root.state.options.times.steps.filter(step => {
        if (!step || typeof step.time === 'undefined' || !step.width || typeof step.width.px === 'undefined') {
          console.warn('DaysHighlight: Invalid step object', step);
          return false;
        }
        
        return this.root.state.options.calendar.workingDays.indexOf(dayjs(step.time).day()) === -1;
      });
    },

    /**
     * Show working days?
     *
     * @returns {bool}
     */
    showWorkingDays() {
      const calendar = this.root.state.options.calendar;
      if (
        typeof calendar.workingDays !== 'undefined' &&
        Array.isArray(calendar.workingDays) &&
        calendar.workingDays.length
      ) {
        return true;
      }
      return false;
    }
  }
};
</script>
