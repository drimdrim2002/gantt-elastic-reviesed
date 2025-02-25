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
      :y="task.y + (root.state.options.row.height - 24) / 2"
      :width="24"
      :height="24"
      :viewBox="'0 0 24 24'"
      @click="onTaskClick"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
      @mousedown.stop="onDragStart"
      @mousewheel="emitEvent('mousewheel', $event)"
      @touchstart="emitEvent('touchstart', $event)"
      @touchmove="emitEvent('touchmove', $event)"
      @touchend="emitEvent('touchend', $event)"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath :id="clipPathId">
          <circle cx="12" cy="12" r="12" />
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
        cx="12"
        cy="12"
        r="12"
        fill="#42b983"
      ></circle>
      <progress-bar :task="task" :clip-path="'url(#' + clipPathId + ')'"></progress-bar>
      <text
        x="12"
        y="12"
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
        cx="12"
        cy="12"
        r="14"
        fill="none"
        :stroke="task.style.base.fill || '#42b983'"
        stroke-width="2.5"
        stroke-dasharray="3,3"
        stroke-opacity="1"
      />
    </svg>
    <!-- SVG foreignObject 기반 툴팁 -->
    <foreignObject v-if="showingTooltip" :x="tooltipX" :y="tooltipY" width="200" height="100" class="task-tooltip">
      <div xmlns="http://www.w3.org/1999/xhtml" class="tooltip-content">
        <div><strong>Task:</strong> {{ task.label }}</div>
        <div><strong>Start:</strong> {{ formatDate(task.start) }}</div>
        <div><strong>Duration:</strong> {{ formatDuration(task.duration) }}</div>
        <div><strong>Progress:</strong> {{ task.progress }}%</div>
      </div>
    </foreignObject>
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
      hasMoved: false,
      minDragDistance: 5,
      dragStartX: 0,
      dragStartY: 0,
      originalPositions: [],
      isSelected: false,
      showingTooltip: false,
      tooltipX: 0,
      tooltipY: 0
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
    }
  },
  methods: {
    /**
     * Show tooltip
     */
    showTooltip(event) {
      // 먼저 이벤트 전달
      this.emitEvent('mouseenter', event);

      // 일관된 패턴: 모든 이벤트에 대해 stopPropagation
      event.stopPropagation();

      const tooltipHeight = 100;
      const taskWidth = 24;
      const tooltipOffset = 10;
      this.tooltipX = Number(this.task.x) + taskWidth + tooltipOffset;
      this.tooltipY = Number(this.task.y) - tooltipHeight / 2;

      this.showingTooltip = true;
    },

    /**
     * Hide tooltip
     */
    hideTooltip(event) {
      // 먼저 이벤트 전달
      this.emitEvent('mouseleave', event);

      // 일관된 패턴: 모든 이벤트에 대해 stopPropagation
      event.stopPropagation();

      this.showingTooltip = false;
    },

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
      // 먼저 이벤트 전달
      // this.emitEvent('click', event); // 중복 이벤트 발생 방지를 위해 제거

      // 이벤트 버블링 중단
      event.stopPropagation();

      // 올바른 이벤트 이름으로 변경
      this.$emit('chart-task-click', {
        task: this.task,
        event: event
      });
    },

    /**
     * Task 드래그 시작
     */
    onDragStart(event) {
      // 먼저 이벤트 전달
      this.emitEvent('dragstart', event);
      this.emitEvent('mousedown', event);

      event.preventDefault();
      event.stopPropagation();

      if (!this.isSelected) {
        this.root.updateSelectedTasks([this.task]);
      }

      this.isDragging = true;
      this.hasMoved = false;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;

      // 선택된 tasks를 상위 스코프에서 정의
      const selectedTasks = this.root.state.selectedTasks || [];

      // 원래 위치 저장
      this.originalPositions = selectedTasks.map(task => ({
        id: task.id,
        x: task.x,
        y: task.y,
        start: task.start
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

        // 디버깅용: 첫 번째 task의 정보를 콘솔에 출력
        if (selectedTasks.length > 0) {
          const firstTask = selectedTasks[0];
          console.log(`드래그 중: task.y=${firstTask.y}, task.height=${firstTask.height}, row=${firstTask.row}`);
        }

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

        // 드래그 상태 해제
        this.isDragging = false;

        // 실제 드래그 이동이 없었으면 원래 위치로 복원하고 종료
        if (!this.hasMoved) {
          // 원래 위치로 복원
          this.originalPositions.forEach(original => {
            const task = selectedTasks.find(t => t.id === original.id);
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

        // 마우스를 놓았을 때 가장 가까운 row에 배치
        const rowHeight =
          this.root.state.options.row.height +
          (this.root.state.options.calendar.gap || 0) +
          (this.root.state.options.chart.grid.horizontal.gap || 0);

        // 디버깅용: rowHeight 구성요소 출력
        console.log('Row 높이 계산:', {
          'row.height': this.root.state.options.row.height,
          'calendar.gap': this.root.state.options.calendar.gap || 0,
          'grid.horizontal.gap': this.root.state.options.chart.grid.horizontal.gap || 0,
          total: rowHeight
        });

        // 1. 먼저 각 task의 row 계산
        selectedTasks.forEach(selectedTask => {
          console.log(`task 배치 전: y=${selectedTask.y}, height=${selectedTask.height}`);

          // 현재 y 위치에 해당하는 row 계산 (반올림)
          const rowIndex = Math.round(selectedTask.y / rowHeight);

          // row의 시작 y 좌표 계산
          const rowStartY = rowIndex * rowHeight;

          // task의 높이 (SVG 높이)
          const taskHeight = 24; // SVG 높이

          // row의 중앙에 task 배치
          // row 시작 위치 + (row 높이 - task 높이) / 2
          const centerY = rowStartY + (this.root.state.options.row.height - taskHeight) / 2;

          // task 위치 업데이트
          selectedTask.y = centerY;
          selectedTask.row = rowIndex;

          console.log(`task 배치 후: y=${selectedTask.y}, row=${selectedTask.row}`);
        });

        // 드래그 완료 위치 정보 계산 (첫 번째 선택된 task 기준)
        if (selectedTasks.length > 0) {
          const firstTask = selectedTasks[0];

          // 1. 시간 계산
          const dropTime = new Date(firstTask.start);
          const formattedTime = dropTime.toLocaleTimeString();

          // 2. Row 계산
          const dropRow = firstTask.row;

          // 3. Alert 메시지 표시
          alert(`Task를 다음 위치로 이동했습니다:\n시간: ${formattedTime}\nRow: ${dropRow}`);
        }

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

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        this.emitEvent('taskDragEnd', { tasks: selectedTasks, event: e });
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
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
