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
    :class="{ selected: isSelected }"
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
      @click="onTaskClick"
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
      <text
        :x="task.width / 2"
        :y="task.height / 2"
        text-anchor="middle"
        alignment-baseline="middle"
        :style="{
          fill: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
          userSelect: 'none',
          pointerEvents: 'none'
        }"
      >
        {{ task.label }}
      </text>
    </svg>
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
      event.stopPropagation(); // 이벤트 버블링만 중단

      if (event.shiftKey) {
        const selectedTasks = this.root.state.selectedTasks || [];
        // if (selectedTasks.length > 0 && !selectedTasks.every(t => t.row === this.task.row)) {
        //   alert('다른 row의 task는 선택할 수 없습니다.');
        //   return;
        // }

        // Shift 키를 누른 상태에서는 기존 선택에 추가/제거
        const isCurrentlySelected = selectedTasks.some(t => t.id === this.task.id);
        if (isCurrentlySelected) {
          // 이미 선택된 task라면 제거
          this.root.updateSelectedTasks(selectedTasks.filter(t => t.id !== this.task.id));
        } else {
          // 선택되지 않은 task라면 추가
          this.root.updateSelectedTasks([...selectedTasks, this.task]);
        }
      } else {
        // 일반 클릭 시에는 토글 동작
        const selectedTasks = this.root.state.selectedTasks || [];
        const isCurrentlySelected = selectedTasks.some(t => t.id === this.task.id);

        if (isCurrentlySelected) {
          // 이미 선택된 task라면 선택 해제
          this.root.updateSelectedTasks([]);
        } else {
          // 선택되지 않은 task라면 선택
          this.root.updateSelectedTasks([this.task]);
        }
      }

      // 클릭 이벤트 발생 후 task-selected 이벤트도 발생
      this.$emit('task-selected', {
        selectedTasks: this.root.state.selectedTasks,
        count: this.root.state.selectedTasks.length
      });

      this.emitEvent('click', event);
    },

    onDragStart(event) {
      event.preventDefault();
      event.stopPropagation();

      if (!this.isSelected) {
        this.root.updateSelectedTasks([this.task]);
      }

      this.isDragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;

      // 선택된 tasks를 상위 스코프에서 정의
      const selectedTasks = this.root.state.selectedTasks || [];

      const onMouseMove = e => {
        if (!this.isDragging) return;

        e.preventDefault();
        e.stopPropagation();

        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;

        // 선택된 모든 task 이동
        selectedTasks.forEach(selectedTask => {
          // 새로운 위치 계산
          const newX = selectedTask.x + dx;
          const newY = selectedTask.y + dy;

          // task 위치 업데이트
          selectedTask.x = newX;
          selectedTask.y = newY;

          // 시간 업데이트
          const newStartTime = this.root.pixelOffsetXToTime(newX);
          selectedTask.start = newStartTime;
        });

        // 드래그 시작점 업데이트
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;

        this.emitEvent('taskDragging', { tasks: selectedTasks, event: e });
      };

      const onMouseUp = e => {
        e.preventDefault();
        e.stopPropagation();

        // 마우스를 놓았을 때 가장 가까운 row에 배치
        const rowHeight = this.root.state.options.row.height + this.root.state.options.chart.grid.horizontal.gap * 2;

        // 1. 먼저 각 task의 row 계산
        selectedTasks.forEach(selectedTask => {
          const finalRow = Math.floor(selectedTask.y / rowHeight);
          selectedTask.y = finalRow * rowHeight + rowHeight / 2 - selectedTask.height / 2;
          selectedTask.row = Math.max(0, finalRow);
        });

        // 2. 각 row의 task들을 x 좌표 순으로 정렬하고 겹침 방지
        const rowTasks = {};

        // 현재 row의 모든 task 수집
        this.root.visibleTasks.forEach(task => {
          if (!rowTasks[task.row]) {
            rowTasks[task.row] = [];
          }
          rowTasks[task.row].push(task);
        });

        // 각 row의 task들을 x 좌표로 정렬
        Object.keys(rowTasks).forEach(row => {
          const tasks = rowTasks[row];
          tasks.sort((a, b) => a.x - b.x);

          // 겹침 방지
          for (let i = 1; i < tasks.length; i++) {
            const prevTask = tasks[i - 1];
            const currentTask = tasks[i];
            const minGap = 10; // 최소 간격 (픽셀)

            if (currentTask.x < prevTask.x + prevTask.width + minGap) {
              currentTask.x = prevTask.x + prevTask.width + minGap;
              // 시간 정보도 업데이트
              currentTask.start = this.root.pixelOffsetXToTime(currentTask.x);
            }
          }
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
        this.isSelected = newSelectedTasks.some(task => task.id === this.task.id);
      },
      deep: true,
      immediate: true
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

.selected {
  stroke: #42b983;
  stroke-width: 2px;
}
</style>
