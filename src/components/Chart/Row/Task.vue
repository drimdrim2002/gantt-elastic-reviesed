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
        opacity: '1'
      }"
      :x="task.x"
      :y="task.y + (root.state.options.row.height - this.circleRadius * 2) / 2"
      :width="this.circleRadius * 2"
      :height="this.circleRadius * 2"
      :viewBox="viewBoxValue"
      @click="onTaskClick"
      @mousedown.stop="onDragStart"
      @mousewheel="emitEvent('mousewheel', $event)"
      @touchstart="emitEvent('touchstart', $event)"
      @touchmove="emitEvent('touchmove', $event)"
      @touchend="emitEvent('touchend', $event)"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath :id="clipPathId">
          <circle :cx="this.circleRadius" :cy="this.circleRadius" :r="this.circleRadius" />
        </clipPath>
      </defs>
      <circle
        class="gantt-elastic__chart-row-bar-polygon gantt-elastic__chart-row-task-polygon"
        :style="{
          ...root.style['chart-row-bar-polygon'],
          ...root.style['chart-row-task-polygon'],
          ...task.style['base'],
          ...task.style['chart-row-bar-polygon'],
          stroke: 'none'
        }"
        :cx="this.circleRadius"
        :cy="this.circleRadius"
        :r="this.circleRadius"
        fill="#42b983"
      ></circle>
      <progress-bar :task="task" :clip-path="'url(#' + clipPathId + ')'"></progress-bar>
      <text
        :x="this.circleRadius"
        :y="this.circleRadius"
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
      <!-- 선택 표시 원 -->
      <circle
        v-if="isSelected"
        :cx="this.circleRadius"
        :cy="this.circleRadius"
        :r="this.circleRadius + 2"
        fill="none"
        :stroke="task.style.base.fill || '#42b983'"
        stroke-width="2.5"
        stroke-dasharray="3,3"
        stroke-opacity="1"
      />
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
      circleRadius: 15,
      isDragging: false,
      hasMoved: false,
      minDragDistance: 1,
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
     * Get tooltip style
     */
    tooltipStyle() {
      return {
        position: 'absolute',
        left: `${this.tooltipX}px`,
        top: `${this.tooltipY}px`,
        zIndex: 9999
      };
    },
    /**
     * Get tooltip style
     */
    displayExpander() {
      return this.task.type === 'project' || (this.task.children && this.task.children.length > 0);
    },

    viewBoxValue() {
      return `0 0 ${this.circleRadius * 2} ${this.circleRadius * 2}`;
    }
  },
  methods: {
    /**
     * Format date
     */
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },

    /**
     * Format duration
     */
    formatDuration(duration) {
      const hours = duration / (60 * 60 * 1000);
      return `${hours.toFixed(1)} hours`;
    },

    onTaskClick(event) {
      event.stopPropagation();
      this.$emit('chart-task-click', {
        task: this.task,
        event: event
      });
    },

    /**
     * Task 드래그 시작
     */
    onDragStart(event) {
      event.preventDefault();
      event.stopPropagation();

      if (!this.isSelected) {
        this.root.updateSelectedTasks([this.task]);
      }

      this.isDragging = true;
      this.hasMoved = false;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;

      // 드래그 상태 설정
      this.root.state.isDragging = true;

      // 선택된 tasks를 상위 스코프에서 정의
      const copiedSelectedTasks = this.root.state.selectedTasks || [];

      if (copiedSelectedTasks.length === 0) {
        return;
      }

      copiedSelectedTasks.forEach(task => {
        if (task.label === '0') {
          return;
        }
      });

      // 원래 위치 저장
      this.originalPositions = copiedSelectedTasks.map(task => ({
        id: task.id,
        x: task.x,
        y: task.y,
        start: task.start,
        row: task.row,
        vhclId: task.vhclId
      }));

      const onMouseMove = e => {
        if (!this.isDragging) return;

        e.preventDefault();
        e.stopPropagation();

        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;

        // 최소 드래그 거리를 넘었는지 확인
        if (!this.hasMoved && (Math.abs(dx) > this.minDragDistance || Math.abs(dy) > this.minDragDistance)) {
          this.hasMoved = true;
        }

        // 선택된 모든 task 이동
        copiedSelectedTasks.forEach(selectedTask => {
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

        // 올바른 이벤트 이름으로 변경
        this.$emit('chart-task-taskDragging', { tasks: copiedSelectedTasks, event: e });
      };

      const onMouseUp = e => {
        e.preventDefault();
        e.stopPropagation();

        // 드래그 상태 해제
        this.isDragging = false;
        // 전역 드래그 상태 해제
        this.root.state.isDragging = false;

        // 실제 드래그 이동이 없었으면 원래 위치로 복원하고 종료
        if (!this.hasMoved) {
          // 원래 위치로 복원
          this.originalPositions.forEach(original => {
            const task = copiedSelectedTasks.find(t => t.id === original.id);
            if (task) {
              task.x = original.x;
              task.y = original.y;
              task.start = original.start;
            }
          });

          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);

          // 클릭 이벤트 발생 (드래그가 아닌 클릭으로 처리)
          this.onTaskClick(e);
          return;
        }

        let toRow = -1;
        // 1. 먼저 각 task의 row 계산
        copiedSelectedTasks.forEach(selectedTask => {
          for (let boundary of this.root.state.options.rowBoundaries) {
            if (selectedTask.y >= boundary.min && selectedTask.y < boundary.max) {
              toRow = boundary.row;
              break;
            }
          }

          console.log(`this.root.state.options.originYByRowIndex`, this.root.state.options.originYByRowIndex);

          selectedTask.y = this.root.state.options.originYByRowIndex[toRow.toString()];
        });

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // 올바른 이벤트 이름으로 변경
        this.$emit('chart-task-taskDragEnd', {
          selectedTasks: copiedSelectedTasks,
          event: e,
          originalTasks: this.originalPositions,
          toRow: toRow
        });

        // 드래그 완료 후 선택 초기화
        setTimeout(() => {
          // 모든 선택 초기화
          this.root.updateSelectedTasks([]);

          // 모든 task의 선택 상태 시각적 표시 제거
          document.querySelectorAll('.gantt-elastic__chart-row-task-wrapper.selected').forEach(el => {
            el.classList.remove('selected');
          });

          // 선택 표시 원 제거를 위해 isSelected 상태 업데이트
          this.isSelected = false;
        }, 100); // 약간의 지연을 두어 이벤트 처리 완료 후 초기화되도록 함
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },

    /**
     * 이벤트 발생
     */
    emitEvent(eventName, event) {
      // 올바른 이벤트 이름 형식으로 변경
      this.$emit('chart-task-' + eventName, { task: this.task, event });
    }
  },
  watch: {
    'root.state.selectedTasks': {
      handler(newSelectedTasks) {
        // 명시적으로 배열 확인 후 처리
        if (!Array.isArray(newSelectedTasks)) {
          this.isSelected = false;
          return;
        }

        this.isSelected = newSelectedTasks.some(task => task.id === this.task.id);

        // 선택 상태에 따라 시각적 효과 적용
        // DOM 요소가 마운트된 후에만 classList 접근
        this.$nextTick(() => {
          if (this.$el) {
            if (this.isSelected) {
              this.$el.classList.add('selected');
            } else {
              this.$el.classList.remove('selected');
            }
          }
        });
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style scoped>
.task-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 9999;
}

.tooltip-content {
  background: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  font-size: 12px;
  line-height: 1.4;
  color: #333;
  min-width: 150px;
  white-space: nowrap;
  z-index: 9999;
}

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
}

/* 선택된 작업 스타일 */
.gantt-elastic__chart-row-task-wrapper.selected .gantt-elastic__chart-row-task {
  filter: brightness(1.1);
}
</style>
