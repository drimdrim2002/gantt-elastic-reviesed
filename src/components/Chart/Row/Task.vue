<!--
/**
 * @fileoverview Task component
 * @license MIT
 * @author Rafal Pospiech <neuronet.io@gmail.com>
 * @package GanttElastic
 */
-->
<template>
  <g
    class="gantt-elastic__chart-row-bar-wrapper gantt-elastic__chart-row-task-wrapper"
    :style="{
      ...root.style['chart-row-bar-wrapper'],
      ...root.style['chart-row-task-wrapper'],
      ...task.style['chart-row-bar-wrapper']
    }"
  >
    <foreignObject
      class="gantt-elastic__chart-expander gantt-elastic__chart-expander--task"
      :style="{
        ...root.style['chart-expander'],
        ...root.style['chart-expander--task'],
        ...task.style['chart-expander']
      }"
      :x="task.x - root.state.options.chart.expander.offset - root.state.options.chart.expander.size"
      :y="task.y + (root.state.options.row.height - root.state.options.chart.expander.size) / 2"
      :width="root.state.options.chart.expander.size"
      :height="root.state.options.chart.expander.size"
      v-if="displayExpander"
    >
      <expander :tasks="[task]" :options="root.state.options.chart.expander" type="chart"></expander>
    </foreignObject>
    <svg
      class="gantt-elastic__chart-row-bar gantt-elastic__chart-row-task"
      :style="{
        ...root.style['chart-row-bar'],
        ...root.style['chart-row-task'],
        ...task.style['chart-row-bar'],
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isSelected ? '0.8' : '1',
        outline: isSelected ? '2px solid #42b983' : 'none'
      }"
      :x="task.x"
      :y="task.y"
      :width="task.width"
      :height="task.height"
      :viewBox="`0 0 ${task.width} ${task.height}`"
      @click.stop="onTaskClick"
      @mouseenter="emitEvent('mouseenter', $event)"
      @mouseover="emitEvent('mouseover', $event)"
      @mouseout="emitEvent('mouseout', $event)"
      @mousedown.stop="onDragStart"
      @mousewheel="emitEvent('mousewheel', $event)"
      @touchstart="emitEvent('touchstart', $event)"
      @touchmove="emitEvent('touchmove', $event)"
      @touchend="emitEvent('touchend', $event)"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath :id="clipPathId">
          <polygon :points="getPoints"></polygon>
        </clipPath>
      </defs>
      <polygon
        class="gantt-elastic__chart-row-bar-polygon gantt-elastic__chart-row-task-polygon"
        :style="{
          ...root.style['chart-row-bar-polygon'],
          ...root.style['chart-row-task-polygon'],
          ...task.style['base'],
          ...task.style['chart-row-bar-polygon']
        }"
        :points="getPoints"
      ></polygon>
      <progress-bar :task="task" :clip-path="'url(#' + clipPathId + ')'"></progress-bar>
    </svg>
    <chart-text :task="task" v-if="root.state.options.chart.text.display"></chart-text>
  </g>
</template>

<script>
import ChartText from '../Text.vue';
import ProgressBar from '../ProgressBar.vue';
import Expander from '../../Expander.vue';
import taskMixin from './Task.mixin.js';

export default {
  name: 'Task',
  components: {
    ChartText,
    ProgressBar,
    Expander
  },
  inject: ['root'],
  props: ['task'],
  mixins: [taskMixin],
  data() {
    return {
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      originalPositions: [],
      isSelected: false
    };
  },
  computed: {
    /**
     * Get clip path id
     *
     * @returns {string}
     */
    clipPathId() {
      return 'gantt-elastic__task-clip-path-' + this.task.id;
    },

    /**
     * Get points
     *
     * @returns {string}
     */
    getPoints() {
      const task = this.task;
      return `0,0 ${task.width},0 ${task.width},${task.height} 0,${task.height}`;
    }
  },
  methods: {
    onTaskClick(event) {
      if (event.shiftKey) {
        const selectedTasks = this.root.state.selectedTasks || [];
        if (selectedTasks.length > 0 && !selectedTasks.every(t => t.row === this.task.row)) {
          alert('다른 row의 task는 선택할 수 없습니다.');
          return;
        }

        this.isSelected = !this.isSelected;
        if (this.isSelected) {
          this.root.state.selectedTasks = [...selectedTasks, this.task];
        } else {
          this.root.state.selectedTasks = selectedTasks.filter(t => t.id !== this.task.id);
        }
        this.$emit('task-selected', {
          task: this.task,
          selected: this.isSelected,
          event
        });
      } else {
        if (this.isSelected) {
          this.isSelected = false;
          this.root.state.selectedTasks = (this.root.state.selectedTasks || []).filter(t => t.id !== this.task.id);
        } else {
          console.log('else');
          if (this.root.state.selectedTasks) {
            this.root.state.selectedTasks = [];
          }
          this.root.state.selectedTasks = [this.task];
          this.isSelected = true;
        }

        this.$emit('task-selected', {
          task: this.task,
          selected: this.isSelected,
          event
        });
      }

      this.emitEvent('click', event);
    },

    onDragStart(event) {
      event.preventDefault();
      event.stopPropagation();

      if (!event.shiftKey) {
        if (this.root.state.selectedTasks) {
          this.root.state.selectedTasks = [];
        }
        this.root.state.selectedTasks = [this.task];
        this.isSelected = true;
      }

      this.isDragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;

      // 선택된 모든 task의 원래 위치를 저장
      const selectedTasks = this.root.state.selectedTasks || [];
      const initialPositions = selectedTasks.map(task => ({
        id: task.id,
        x: task.x,
        y: task.y
      }));

      const onMouseMove = e => {
        if (!this.isDragging) return;

        e.preventDefault();
        e.stopPropagation();

        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;

        // 선택된 모든 task 이동
        selectedTasks.forEach(selectedTask => {
          // 저장된 원래 위치 찾기
          const originalPosition = initialPositions.find(pos => pos.id === selectedTask.id);
          if (!originalPosition) return;

          // 새로운 위치 계산
          const newX = originalPosition.x + dx;
          const rowHeight = this.root.state.options.row.height + this.root.state.options.chart.grid.horizontal.gap * 2;
          const newRow = Math.floor((originalPosition.y + dy) / rowHeight);
          const newY = newRow * rowHeight + rowHeight / 2 - selectedTask.height / 2;

          // task 위치 업데이트
          selectedTask.x = newX;
          selectedTask.y = newY;

          // 시간 업데이트
          const newStartTime = this.root.pixelOffsetXToTime(newX);
          selectedTask.start = newStartTime;

          // row 업데이트
          selectedTask.row = Math.max(0, newRow);
        });

        this.emitEvent('taskDragging', { tasks: selectedTasks, event: e });
      };

      const onMouseUp = e => {
        e.preventDefault();
        e.stopPropagation();

        // 선택된 모든 task의 최종 위치 조정
        const rowHeight = this.root.state.options.row.height + this.root.state.options.chart.grid.horizontal.gap * 2;

        selectedTasks.forEach(selectedTask => {
          const finalRow = Math.floor(selectedTask.y / rowHeight);
          selectedTask.y = finalRow * rowHeight + rowHeight / 2 - selectedTask.height / 2;
          selectedTask.row = Math.max(0, finalRow);
        });

        this.isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        this.emitEvent('taskDragEnd', { tasks: selectedTasks, event: e });
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      this.emitEvent('mousedown', event);
    },

    onDragEnd(event) {
      event.preventDefault();
      if (!this.isDragging) return;

      this.isDragging = false;

      document.removeEventListener('mousemove', this.onDragging);
      document.removeEventListener('mouseup', this.onDragEnd);

      this.emitEvent('taskDragEnd', { task: this.task, event });
    }
  },
  watch: {
    'root.state.selectedTasks': {
      handler(newSelectedTasks) {
        this.isSelected = newSelectedTasks.some(t => t.id === this.task.id);
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.gantt-elastic__chart-row-bar-wrapper {
  user-select: none;
}

.gantt-elastic__chart-row-bar {
  cursor: grab;
}

.gantt-elastic__chart-row-bar:active {
  cursor: grabbing !important;
}

.gantt-elastic__chart-row-bar.selected {
  opacity: 0.8;
  outline: 2px solid #42b983;
}
</style>
