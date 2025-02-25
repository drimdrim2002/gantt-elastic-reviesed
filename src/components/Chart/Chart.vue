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
            @keydown="onKeyDown"
            @keyup="onKeyUp"
            tabindex="0"
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
                @chart-task-click="handleTaskSelection"
                @chart-task-taskDragging="onTaskDragging"
                @chart-task-taskDragEnd="onTaskDragEnd"
              ></component>
            </g>
          </svg>
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
      shiftKeyPressed: false,
      ctrlKeyPressed: false,
      _taskSelectionTimeout: null,
      lastSelectedTaskId: null
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
    this.$refs.chartGraphSvg.focus();

    // 문서 레벨에서 이벤트 리스너 등록
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);

    // 포커스가 변경되어도 키 상태 추적
    window.addEventListener('blur', this.resetKeyState);

    // 클릭 시 SVG에 포커스 유지
    this.$el.addEventListener('click', this.focusSvg);
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
      this.root.$emit('task-dragging', event.tasks || event.task);
    },
    onTaskDragEnd(event) {
      this.root.$emit('task-moved', event.tasks || event.task);
    },
    /**
     * Task 선택 처리
     */
    handleTaskSelection(event) {
      // 이벤트 중복 실행 방지를 위한 디바운싱
      if (this._taskSelectionTimeout) {
        clearTimeout(this._taskSelectionTimeout);
      }

      this._taskSelectionTimeout = setTimeout(() => {
        const task = event.task || event;
        const originalEvent = event.event || window.event;
        const currentSelection = this.root.state.selectedTasks || [];
        const isSelected = currentSelection.some(t => t.id === task.id);

        console.log('Task selection:', {
          taskId: task.id,
          isSelected,
          shiftKey: originalEvent.shiftKey || this.shiftKeyPressed,
          ctrlKey: originalEvent.ctrlKey || originalEvent.metaKey || this.ctrlKeyPressed,
          currentSelectionCount: currentSelection.length
        });

        // 선택 상태 업데이트 함수
        const updateSelection = newSelection => {
          console.log('Updating selection:', {
            before: (this.root.state.selectedTasks && this.root.state.selectedTasks.map(t => t.id)) || [],
            after: newSelection.map(t => t.id)
          });

          // 명시적으로 새 배열 생성하여 참조 변경 보장
          this.root.updateSelectedTasks([...newSelection]);

          // 강제 업데이트를 위해 nextTick 사용
          this.$nextTick(() => {
            // 선택 상태가 제대로 반영되었는지 확인
            console.log('Selection updated:', this.root.state.selectedTasks.map(t => t.id));
          });
        };

        // Shift 키를 사용한 다중 선택
        if (originalEvent.shiftKey || this.shiftKeyPressed) {
          // 마지막으로 선택한 작업이 있는지 확인
          if (this.lastSelectedTaskId) {
            // 마지막으로 선택한 작업 찾기
            const lastTask = this.root.visibleTasks.find(t => t.id === this.lastSelectedTaskId);

            if (lastTask) {
              // 현재 작업과 마지막 작업이 같은 row에 있는지 확인
              if (lastTask.row !== task.row) {
                alert('다른 row의 task는 선택할 수 없습니다. 같은 row의 task만 선택 가능합니다.');
                return;
              }

              // 현재 row의 모든 작업 가져오기
              const rowTasks = this.root.visibleTasks.filter(t => t.row === task.row);

              // x 좌표로 정렬
              rowTasks.sort((a, b) => a.x - b.x);

              // 시작 및 끝 인덱스 찾기
              const startIndex = rowTasks.findIndex(t => t.id === lastTask.id);
              const endIndex = rowTasks.findIndex(t => t.id === task.id);

              if (startIndex !== -1 && endIndex !== -1) {
                // 시작과 끝 사이의 모든 작업 선택
                const start = Math.min(startIndex, endIndex);
                const end = Math.max(startIndex, endIndex);

                // 범위 내의 모든 작업 선택
                const tasksToSelect = rowTasks.slice(start, end + 1);

                // Ctrl 키가 함께 눌려있으면 기존 선택에 추가, 아니면 새로 선택
                if (originalEvent.ctrlKey || originalEvent.metaKey || this.ctrlKeyPressed) {
                  // 기존 선택에 추가 (중복 제거)
                  const newSelection = [...currentSelection];

                  tasksToSelect.forEach(t => {
                    if (!newSelection.some(selected => selected.id === t.id)) {
                      newSelection.push(t);
                    }
                  });

                  updateSelection(newSelection);
                } else {
                  // 새로 선택
                  updateSelection(tasksToSelect);
                }

                console.log('Range selected with Shift key');
              }
            }
          } else {
            // 마지막 선택이 없으면 현재 작업만 선택
            updateSelection([task]);
          }

          // 현재 작업을 마지막 선택으로 저장
          this.lastSelectedTaskId = task.id;
        }
        // Ctrl/Cmd 키를 누른 상태에서 클릭한 경우
        else if (originalEvent.ctrlKey || originalEvent.metaKey || this.ctrlKeyPressed) {
          if (isSelected) {
            // 이미 선택된 task라면 제거
            updateSelection(currentSelection.filter(t => t.id !== task.id));
          } else {
            // 선택되지 않은 task라면 추가
            updateSelection([...currentSelection, task]);
          }

          // 현재 작업을 마지막 선택으로 저장
          this.lastSelectedTaskId = task.id;
        }
        // 일반 클릭 (키 없이)
        else {
          if (isSelected && currentSelection.length === 1) {
            // 이미 선택된 단일 task를 클릭하면 선택 해제
            updateSelection([]);
            this.lastSelectedTaskId = null;
          } else {
            // 그 외의 경우 이 task만 선택
            updateSelection([task]);
            this.lastSelectedTaskId = task.id;
          }
        }
      }, 10); // 10ms 지연으로 중복 이벤트 방지
    },
    /**
     * 키보드 상태 시각적 표시
     */
    updateKeyboardStatus() {
      // 선택적: 키보드 상태를 UI에 표시하는 기능
      const keyStatus = document.createElement('div');
      keyStatus.id = 'key-status';
      keyStatus.style.position = 'fixed';
      keyStatus.style.bottom = '10px';
      keyStatus.style.right = '10px';
      keyStatus.style.padding = '5px';
      keyStatus.style.background = 'rgba(0,0,0,0.7)';
      keyStatus.style.color = 'white';
      keyStatus.style.borderRadius = '3px';
      keyStatus.style.fontSize = '12px';
      keyStatus.style.zIndex = '9999';

      document.body.appendChild(keyStatus);

      // 상태 업데이트 함수
      const updateStatus = () => {
        const status = document.getElementById('key-status');
        if (status) {
          status.textContent = `Shift: ${this.shiftKeyPressed ? 'ON' : 'OFF'}, Ctrl/Cmd: ${
            this.ctrlKeyPressed ? 'ON' : 'OFF'
          }`;
        }
      };

      // 초기 상태 설정 및 이벤트 리스너에 업데이트 추가
      updateStatus();
      this.$watch('shiftKeyPressed', updateStatus);
      this.$watch('ctrlKeyPressed', updateStatus);
    },
    /**
     * 키보드 이벤트 처리 - 키 누름
     */
    onKeyDown(event) {
      if (event.key === 'Shift') {
        this.shiftKeyPressed = true;
        // console.log('Shift key pressed');
      } else if (event.key === 'Control' || event.key === 'Meta') {
        this.ctrlKeyPressed = true;
        // console.log('Ctrl/Cmd key pressed');
      }
    },
    /**
     * 키보드 이벤트 처리 - 키 뗌
     */
    onKeyUp(event) {
      if (event.key === 'Shift') {
        this.shiftKeyPressed = false;
        console.log('Shift key released');
      } else if (event.key === 'Control' || event.key === 'Meta') {
        this.ctrlKeyPressed = false;
        console.log('Ctrl/Cmd key released');
      }
    },
    resetKeyState() {
      this.shiftKeyPressed = false;
      this.ctrlKeyPressed = false;
    },
    /**
     * SVG에 포커스 설정
     */
    focusSvg() {
      this.$refs.chartGraphSvg.focus();
    }
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.resetKeyState);
    this.$el.removeEventListener('click', this.focusSvg);
  }
};
</script>

<style scoped>
/* 선택된 task에 대한 스타일 강화 */
:deep(.gantt-elastic__chart-row-task-wrapper.selected) {
  filter: drop-shadow(0 0 3px rgba(66, 185, 131, 0.7));
}

/* 키보드 상태 표시를 위한 스타일 */
.keyboard-status {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 3px;
  font-size: 12px;
  z-index: 9999;
}
</style>
