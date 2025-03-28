<!--
/**
 * @fileoverview MainView component
 * @license MIT
 * @author Rafal Pospiech <neuronet.io@gmail.com>
 * @package GanttElastic
 */
-->
<template>
  <div class="gantt-elastic__main-view" :style="{ ...root.style['main-view'] }">
    <div
      class="gantt-elastic__main-container-wrapper"
      :style="{ ...root.style['main-container-wrapper'], height: root.state.options.height + 'px' }"
    >
      <div
        class="gantt-elastic__main-container"
        :style="{
          ...root.style['main-container'],
          width: root.state.options.clientWidth + 'px',
          height: root.state.options.height + 'px'
        }"
        ref="mainView"
      >
        <div
          class="gantt-elastic__container"
          :style="{ ...root.style['container'] }"
          @mousemove="mouseMove"
          @mouseup="mouseUp"
        >
          <div
            ref="taskList"
            class="gantt-elastic__task-list-container"
            :style="{
              ...root.style['task-list-container'],
              width: root.state.options.taskList.finalWidth + 'px',
              height: root.state.options.height + 'px'
            }"
            v-show="root.state.options.taskList.display"
          >
            <task-list></task-list>
          </div>
          <div
            class="gantt-elastic__main-view-container"
            :style="{ ...root.style['main-view-container'] }"
            ref="chartContainer"
            @mousedown="!showTaskPopup && chartMouseDown"
            @touchstart="!showTaskPopup && chartMouseDown"
            @mouseup="!showTaskPopup && chartMouseUp"
            @touchend="!showTaskPopup && chartMouseUp"
            @mousemove="!showTaskPopup && chartMouseMove"
            @touchmove="!showTaskPopup && chartMouseMove"
            @wheel="!showTaskPopup && chartWheel"
          >
            <chart @task-click="onTaskClick"></chart>
          </div>
        </div>
      </div>
      <div
        class="gantt-elastic__chart-scroll-container gantt-elastic__chart-scroll-container--vertical"
        :style="{
          ...root.style['chart-scroll-container'],
          ...root.style['chart-scroll-container--vertical'],
          ...verticalStyle
        }"
        ref="chartScrollContainerVertical"
        @scroll="onVerticalScroll"
      >
        <div
          class="gantt-elastic__chart-scroll--vertical"
          :style="{ width: '1px', height: root.state.options.allVisibleTasksHeight + 'px' }"
        ></div>
      </div>
    </div>
    <div
      class="gantt-elastic__chart-scroll-container gantt-elastic__chart-scroll-container--horizontal"
      :style="{
        ...root.style['chart-scroll-container'],
        ...root.style['chart-scroll-container--horizontal'],
        marginLeft: getMarginLeft
      }"
      @scroll="onHorizontalScroll"
      ref="chartScrollContainerHorizontal"
    >
      <div
        class="gantt-elastic__chart-scroll--horizontal"
        :style="{ height: '1px', width: root.state.options.width + 'px' }"
      ></div>
    </div>
    <!-- 작업 팝업 -->
    <div
      v-if="showTaskPopup"
      class="task-popup"
      :style="{
        position: 'fixed',
        left: popupPosition.x + 'px',
        top: popupPosition.y + 'px',
        zIndex: 9999
      }"
      @mousedown="startDragging"
      @mousemove="onDrag"
      @mouseup="stopDragging"
      @mouseleave="stopDragging"
    >
      <div class="popup-content">
        <div
          class="popup-header"
          :style="{
            backgroundColor:
              selectedTask && selectedTask.style && selectedTask.style.base && selectedTask.style.base.fill
                ? selectedTask.style.base.fill
                : '#42b983'
          }"
        >
          <h3>Task Details</h3>
          <button class="close-button" @click="closeTaskPopup">&times;</button>
        </div>
        <div class="popup-body">
          <div><strong>Task:</strong> {{ selectedTask ? selectedTask.label : '' }}</div>
          <div><strong>Start:</strong> {{ selectedTask ? formatDate(selectedTask.start) : '' }}</div>
          <div><strong>Duration:</strong> {{ selectedTask ? formatDuration(selectedTask.duration) : '' }}</div>
          <div><strong>Progress:</strong> {{ selectedTask ? selectedTask.progress : '' }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TaskList from './TaskList/TaskList.vue';
import Chart from './Chart/Chart.vue';

let ignoreScrollEvents = false;

export default {
  name: 'MainView',
  components: {
    TaskList,
    Chart
  },
  inject: ['root'],
  data() {
    return {
      defs: '',
      mousePos: {
        x: 0,
        y: 0,
        movementX: 0,
        movementY: 0,
        lastX: 0,
        lastY: 0,
        positiveX: 0,
        positiveY: 0,
        currentX: 0,
        currentY: 0
      },
      showTaskPopup: false,
      selectedTask: null,
      popupPosition: { x: 0, y: 0 },
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    };
  },
  /**
   * Mounted
   */
  mounted() {
    this.viewBoxWidth = this.$el.clientWidth;
    this.root.state.refs.mainView = this.$refs.mainView;
    this.root.state.refs.chartContainer = this.$refs.chartContainer;

    this.root.state.refs.taskList = this.$refs.taskList;

    this.root.state.refs.chartScrollContainerHorizontal = this.$refs.chartScrollContainerHorizontal;
    this.root.state.refs.chartScrollContainerVertical = this.$refs.chartScrollContainerVertical;
    document.addEventListener('mouseup', this.chartMouseUp.bind(this));
    document.addEventListener('mousemove', this.chartMouseMove.bind(this));
    document.addEventListener('touchmove', this.chartMouseMove.bind(this));
    document.addEventListener('touchend', this.chartMouseUp.bind(this));
  },
  computed: {
    /**
     * Get margin left
     *
     * @returns {string}
     */
    getMarginLeft() {
      if (!this.root.state.options.taskList.display) {
        return '0px';
      }
      return this.root.state.options.taskList.finalWidth + 'px';
    },

    /**
     * Get vertical style
     *
     * @returns {object}
     */
    verticalStyle() {
      return {
        width: this.root.state.options.scrollBarHeight + 'px',
        height: this.root.state.options.rowsHeight + 'px',
        'margin-top': this.root.state.options.calendar.height + this.root.state.options.calendar.gap + 'px'
      };
    },

    /**
     * Get view box
     *
     * @returns {string}
     */
    getViewBox() {
      if (this.root.state.options.clientWidth) {
        return `0 0 ${this.root.state.options.clientWidth - this.root.state.options.scrollBarHeight} ${
          this.root.state.options.height
        }`;
      }
      return `0 0 0 ${this.root.state.options.height}`;
    }
  },
  methods: {
    /**
     * Emit event when mouse is moving inside main view
     */
    mouseMove(event) {
      this.root.$emit('main-view-mousemove', event);
    },

    /**
     * Emit mouseup event inside main view
     */
    mouseUp(event) {
      this.root.$emit('main-view-mouseup', event);
    },

    /**
     * Horizontal scroll event handler
     */
    onHorizontalScroll(ev) {
      this.root.$emit('chart-scroll-horizontal', ev);
    },

    /**
     * Vertical scroll event handler
     */
    onVerticalScroll(ev) {
      this.root.$emit('chart-scroll-vertical', ev);
    },

    /**
     * Mouse wheel event handler
     */
    chartWheel(ev) {
      this.root.$emit('chart-wheel', ev);
    },

    /**
     * Chart mousedown event handler
     * Initiates drag scrolling mode
     */
    chartMouseDown(ev) {
      if (typeof ev.touches !== 'undefined') {
        this.mousePos.x = this.mousePos.lastX = ev.touches[0].screenX;
        this.mousePos.y = this.mousePos.lastY = ev.touches[0].screenY;
        this.mousePos.movementX = 0;
        this.mousePos.movementY = 0;
        this.mousePos.currentX = this.$refs.chartScrollContainerHorizontal.scrollLeft;
        this.mousePos.currentY = this.$refs.chartScrollContainerVertical.scrollTop;
      }
    },

    /**
     * Chart mouseup event handler
     * Deactivates drag scrolling mode
     */
    chartMouseUp(ev) {
      // 마우스 업 이벤트에서는 특별한 처리가 필요 없음
    },

    /**
     * Chart mousemove event handler
     * When in drag scrolling mode this method calculate scroll movement
     */
    chartMouseMove(ev) {
      if (!ev.buttons && !ev.touches) return; // 마우스 버튼이 눌려있지 않으면 리턴

      if (this.showTaskPopup) {
        return;
      }

      ev.preventDefault();
      ev.stopImmediatePropagation();
      ev.stopPropagation();
      const touch = typeof ev.touches !== 'undefined';
      let movementX, movementY;
      if (touch) {
        const screenX = ev.touches[0].screenX;
        const screenY = ev.touches[0].screenY;
        movementX = this.mousePos.x - screenX;
        movementY = this.mousePos.y - screenY;
        this.mousePos.lastX = screenX;
        this.mousePos.lastY = screenY;
      } else {
        movementX = ev.movementX;
        movementY = ev.movementY;
      }
      const horizontal = this.$refs.chartScrollContainerHorizontal;
      const vertical = this.$refs.chartScrollContainerVertical;
      let x = 0,
        y = 0;
      if (touch) {
        x = this.mousePos.currentX + movementX * this.root.state.options.scroll.dragXMoveMultiplier;
      } else {
        x = horizontal.scrollLeft - movementX * this.root.state.options.scroll.dragXMoveMultiplier;
      }
      horizontal.scrollLeft = x;
      if (touch) {
        y = this.mousePos.currentY + movementY * this.root.state.options.scroll.dragYMoveMultiplier;
      } else {
        y = vertical.scrollTop - movementY * this.root.state.options.scroll.dragYMoveMultiplier;
      }
      vertical.scrollTop = y;
    },

    onTaskClick({ task, position }) {
      this.selectedTask = task;
      this.popupPosition = position;
      this.showTaskPopup = true;
    },

    closeTaskPopup() {
      this.showTaskPopup = false;
      this.selectedTask = null;
    },

    startDragging(event) {
      if (!event.target.closest('.popup-header')) {
        return;
      }

      this.isDragging = true;
      const rect = event.target.getBoundingClientRect();
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    },

    onDrag(event) {
      if (!this.isDragging) return;

      event.preventDefault();
      this.popupPosition = {
        x: event.clientX - this.dragOffset.x,
        y: event.clientY - this.dragOffset.y
      };
    },

    stopDragging() {
      this.isDragging = false;
    },

    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },

    formatDuration(duration) {
      const hours = duration / (60 * 60 * 1000);
      return `${hours.toFixed(1)} hours`;
    }
  },

  /**
   * Before destroy event - clean up
   */
  beforeDestroy() {
    document.removeEventListener('mouseup', this.chartMouseUp);
    document.removeEventListener('mousemove', this.chartMouseMove);
    document.removeEventListener('touchmove', this.chartMouseMove);
    document.removeEventListener('touchend', this.chartMouseUp);
  }
};
</script>

<style scoped>
/* ... existing styles ... */

.task-popup {
  pointer-events: auto;
  cursor: move;
}

.popup-content {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 200px;
}

.popup-header {
  padding: 8px 12px;
  border-radius: 4px 4px 0 0;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  user-select: none;
}

.popup-header h3 {
  margin: 0;
  font-size: 14px;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
}

.popup-body {
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  color: #333;
}

.popup-body div {
  margin-bottom: 4px;
}

.popup-body div:last-child {
  margin-bottom: 0;
}
</style>
