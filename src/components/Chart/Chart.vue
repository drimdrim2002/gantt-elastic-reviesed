<!--
/**
 * @fileoverview Chart component
 * @license MIT
 * @author Rafal Pospiech <neuronet.io@gmail.com>
 * @package GanttElastic
 */
-->
<template>
  <div class="gantt-elastic__chart" :style="{ ...root.style['chart'] }" ref="chart">
    <div
      class="gantt-elastic__chart-calendar-container"
      ref="chartCalendarContainer"
      :style="{
        ...root.style['chart-calendar-container'],
        height: root.state.options.calendar.height + 'px',
        'margin-bottom': root.state.options.calendar.gap + 'px'
      }"
    >
      <calendar></calendar>
    </div>
    <div
      class="gantt-elastic__chart-graph-container"
      ref="chartGraphContainer"
      :style="{
        ...root.style['chart-graph-container'],
        height: root.state.options.height - root.state.options.calendar.height + 'px'
      }"
    >
      <div
        :style="{
          ...root.style['chart-area'],
          width: root.state.options.width + 'px',
          height: root.state.options.rowsHeight + 'px'
        }"
      >
        <div
          class="gantt-elastic__chart-graph"
          ref="chartGraph"
          :style="{ ...root.style['chart-graph'], height: '100%', position: 'relative' }"
          @mousedown="startSelection"
          @mousemove="updateSelection"
          @mouseup="endSelection"
        >
          <svg
            class="gantt-elastic__chart-graph-svg"
            :style="{ ...root.style['chart-graph-svg'] }"
            ref="chartGraphSvg"
            x="0"
            y="0"
            :width="root.state.options.width + 'px'"
            :height="root.state.options.allVisibleTasksHeight + 'px'"
            xmlns="http://www.w3.org/2000/svg"
          >
            <days-highlight></days-highlight>
            <grid></grid>
            <dependency-lines :tasks="root.visibleTasks"></dependency-lines>
            <g
              class="gantt-elastic__chart-row-wrapper"
              :style="{ ...root.style['chart-row-wrapper'] }"
              v-for="task in root.visibleTasks"
              :task="task"
              :key="task.id"
            >
              <component
                :task="task"
                :is="task.type"
                @chart-task-click="onTaskClick"
                @chart-task-taskDragging="onTaskDragging"
                @chart-task-taskDragEnd="onTaskDragEnd"
              ></component>
            </g>
          </svg>

          <!-- 선택 영역 표시 -->
          <div
            v-if="isSelecting"
            class="selection-box"
            :style="{
              left: `${Math.min(selectionStart.x, selectionCurrent.x)}px`,
              top: `${Math.min(selectionStart.y, selectionCurrent.y)}px`,
              width: `${Math.abs(selectionCurrent.x - selectionStart.x)}px`,
              height: `${Math.abs(selectionCurrent.y - selectionStart.y)}px`
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Grid from './Grid.vue';
import DaysHighlight from './DaysHighlight.vue';
import Calendar from '../Calendar/Calendar.vue';
import DependencyLines from './DependencyLines.vue';
import Task from './Row/Task.vue';
import Milestone from './Row/Milestone.vue';
import Project from './Row/Project.vue';
export default {
  name: 'Chart',
  components: {
    Grid,
    DependencyLines,
    Calendar,
    Task,
    Milestone,
    Project,
    DaysHighlight
  },
  inject: ['root'],
  data() {
    return {
      moving: false,
      isSelecting: false,
      selectionStart: { x: 0, y: 0 },
      selectionCurrent: { x: 0, y: 0 }
    };
  },
  /**
   * Mounted
   */
  mounted() {
    this.root.state.refs.chart = this.$refs.chart;
    this.root.state.refs.chartCalendarContainer = this.$refs.chartCalendarContainer;
    this.root.state.refs.chartGraphContainer = this.$refs.chartGraphContainer;
    this.root.state.refs.chartGraph = this.$refs.chartGraph;
    this.root.state.refs.chartGraphSvg = this.$refs.chartGraphSvg;
  },

  computed: {
    /**
     * Get view box
     *
     * @returns {string}
     */
    getViewBox() {
      return `0 0 ${this.root.state.options.width} ${this.root.state.options.allVisibleTasksHeight}`;
    }
  },

  methods: {
    onTaskClick(event) {
      const task = event.data;
      alert(`Task clicked: ${task.label}`);
      // 필요한 경우 이벤트를 상위로 전달
      this.root.$emit('task-click', task);
    },
    onTaskDragging(event) {
      const { task } = event.data;
      this.root.$emit('task-dragging', task);
    },
    onTaskDragEnd(event) {
      const { task } = event.data;
      this.root.$emit('task-moved', task);
    },
    startSelection(event) {
      const rect = this.$refs.chartGraph.getBoundingClientRect();
      this.selectionStart = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      this.selectionCurrent = { ...this.selectionStart };
      this.isSelecting = true;
    },
    updateSelection(event) {
      if (!this.isSelecting) return;

      const rect = this.$refs.chartGraph.getBoundingClientRect();
      this.selectionCurrent = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };

      this.selectTasksInArea();
    },
    endSelection() {
      this.isSelecting = false;
    },
    selectTasksInArea() {
      const left = Math.min(this.selectionStart.x, this.selectionCurrent.x);
      const right = Math.max(this.selectionStart.x, this.selectionCurrent.x);
      const top = Math.min(this.selectionStart.y, this.selectionCurrent.y);
      const bottom = Math.max(this.selectionStart.y, this.selectionCurrent.y);

      const selectedTasks = this.root.visibleTasks.filter(task => {
        const taskRect = {
          left: task.x,
          right: task.x + task.width,
          top: task.y,
          bottom: task.y + task.height
        };

        return taskRect.left < right && taskRect.right > left && taskRect.top < bottom && taskRect.bottom > top;
      });

      this.root.state.selectedTasks = selectedTasks;
    }
  }
};
</script>

<style scoped>
.selection-box {
  position: absolute;
  border: 1px solid #42b983;
  background-color: rgba(66, 185, 131, 0.1);
  pointer-events: none;
  z-index: 1000;
}
</style>
