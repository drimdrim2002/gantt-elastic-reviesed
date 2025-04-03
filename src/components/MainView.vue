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
            @mousedown="chartMouseDown"
            @touchstart="chartMouseDown"
            @mouseup="chartMouseUp"
            @touchend="chartMouseUp"
            @mousemove="chartMouseMove"
            @touchmove="chartMouseMove"
            @wheel="chartWheel"
          >
            <chart></chart>
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

    <!-- 오버레이와 컨텍스트 메뉴 -->
    <div v-if="showContextMenu" class="context-menu-overlay">
      <div
        class="task-context-menu"
        :style="{
          position: 'fixed',
          top: `${contextMenuPosition.y}px`,
          left: `${contextMenuPosition.x}px`
        }"
        @click.stop
      >
        <div
          class="context-menu-header"
          :style="{
            background: selectedTaskInfo.color || '#42b983',
            color: '#ffffff', // 텍스트 색상을 흰색으로 변경
            height: '15px'
          }"
        >
          <strong> Customer Information</strong>
        </div>
        <div class="context-menu-content">
          <table class="task-info-table">
            <tbody>
              <tr>
                <td class="label">Vehicle</td>
                <td class="value">{{ selectedTaskInfo.vhclId }}</td>
              </tr>
              <tr>
                <td class="label">Stop Seq No</td>
                <td class="value">{{ selectedTaskInfo.label }}</td>
              </tr>
              <tr>
                <td class="label">Arrival Time</td>
                <td class="value">{{ formatDateTime(selectedTaskInfo.start) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Task 이동 확인 팝업 -->
    <div v-if="showMoveConfirm" class="task-move-confirm-popup" :style="moveConfirmStyle">
      <div class="popup-header" :style="{ backgroundColor: moveConfirmTaskColor }">
        <h3>Task 이동 확인</h3>
      </div>
      <div class="popup-content">
        <p>선택한 Task를 이동하시겠습니까?</p>
        <div class="button-group">
          <button @click="confirmMove(true)" class="confirm-button">Confirm</button>
          <button @click="confirmMove(false)" class="cancel-button">Cancel</button>
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
      showContextMenu: false,
      contextMenuPosition: { x: 0, y: 0 },
      selectedTaskInfo: null,
      showMoveConfirm: false,
      moveConfirmStyle: {},
      moveConfirmTaskColor: '#42b983',
      moveConfirmCallback: null
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

    // 컨텍스트 메뉴 이벤트 리스너 등록
    this.root.$on('task-contextmenu', this.showTaskContextMenu);

    // 다른 곳 클릭시 컨텍스트 메뉴 닫기
    document.addEventListener('click', this.hideContextMenu);

    // ESC 키 이벤트 리스너 추가
    document.addEventListener('keydown', this.handleKeyDown);
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
      this.root.state.options.scroll.scrolling = true;
    },

    /**
     * Chart mouseup event handler
     * Deactivates drag scrolling mode
     */
    chartMouseUp(ev) {
      this.root.state.options.scroll.scrolling = false;
    },

    /**
     * Chart mousemove event handler
     * When in drag scrolling mode this method calculate scroll movement
     */
    chartMouseMove(ev) {
      if (this.root.state.options.scroll.scrolling) {
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
      }
    },

    showTaskContextMenu(data) {
      this.showContextMenu = true;
      this.contextMenuPosition = data.position;
      this.selectedTaskInfo = data.taskInfo;

      // 스크롤 방지
      document.body.style.overflow = 'hidden';
    },

    hideContextMenu(event) {
      // 컨텍스트 메뉴 영역 클릭시에는 닫지 않음
      if (event && event.target.closest('.task-context-menu')) {
        return;
      }
      this.showContextMenu = false;

      // 스크롤 복원
      document.body.style.overflow = '';
    },

    formatDateTime(timestamp) {
      return new Date(timestamp).toLocaleString();
    },

    handleTaskEdit() {
      // 작업 수정 로직 구현
      console.log('Edit task:', this.selectedTaskInfo);
      this.hideContextMenu();
    },

    handleTaskDelete() {
      if (confirm(`작업 "${this.selectedTaskInfo.label}"을(를) 삭제하시겠습니까?`)) {
        // 작업 삭제 로직 구현
        console.log('Delete task:', this.selectedTaskInfo);
      }
      this.hideContextMenu();
    },

    // ESC 키로 팝업 닫기 추가
    handleKeyDown(event) {
      if (event.key === 'Escape' && this.showContextMenu) {
        this.hideContextMenu();
      }
    },

    confirmMove(confirmed) {
      if (this.moveConfirmCallback) {
        this.moveConfirmCallback(confirmed);
      }
      this.showMoveConfirm = false;
      this.moveConfirmCallback = null;
      this.moveConfirmStyle = {};
      this.moveConfirmTaskColor = '#42b983';
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

    // 이벤트 리스너 제거
    this.root.$off('task-contextmenu', this.showTaskContextMenu);
    document.removeEventListener('click', this.hideContextMenu);

    // ESC 키 이벤트 리스너 제거
    document.removeEventListener('keydown', this.handleKeyDown);

    // 스크롤 상태 복원
    document.body.style.overflow = '';
  },

  created() {
    this.root.$on('task-move-confirm', ({ tasks, originalPositions, toRow, callback }) => {
      this.showMoveConfirm = true;
      this.moveConfirmTaskColor = (tasks[0].style && tasks[0].style.base && tasks[0].style.base.fill) || '#42b983';
      this.moveConfirmCallback = callback;

      // 팝업 위치 설정
      const firstTask = tasks[0];
      this.moveConfirmStyle = {
        left: `${firstTask.x}px`,
        top: `${firstTask.y}px`
      };
    });
  }
};
</script>

<style scoped>
/* ... 기존 스타일 유지 ... */

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent; /* 배경은 투명하게 */
  z-index: 999; /* task-context-menu보다 낮은 z-index */
  cursor: default; /* 기본 커서로 변경 */
}

.task-context-menu {
  z-index: 1000;
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.context-menu-header {
  padding: 8px 12px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.context-menu-content {
  padding: 8px 12px;
}

.task-info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
  font-size: 0.9em;
  border: 1px solid black;
}

.task-info-table td {
  padding: 4px 0;
  border-bottom: 1px solid black;
}

.task-info-table td:last-child {
  border-bottom: none;
}

.task-info-table .label {
  color: #666;
  width: 40%;
  font-weight: 500;
  border: 1px solid black;
}

.task-info-table .value {
  color: #333;
  text-align: right;
  border: 1px solid black;
}

.context-menu-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #eee;
}

.context-menu-actions button {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  background: #42b983;
  color: white;
}

.context-menu-actions .delete-btn {
  background: #ff4444;
}

.context-menu-actions button:hover {
  opacity: 0.9;
}

.task-move-confirm-popup {
  position: absolute;
  background: white;
  border: 2px solid black;
  border-radius: 4px;
  padding: 0;
  z-index: 1000;
  min-width: 200px;
}

.task-move-confirm-popup .popup-header {
  padding: 10px;
  color: white;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
}

.task-move-confirm-popup .popup-header h3 {
  margin: 0;
  font-size: 16px;
}

.task-move-confirm-popup .popup-content {
  padding: 15px;
}

.task-move-confirm-popup .button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.task-move-confirm-popup button {
  padding: 5px 15px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
}

.task-move-confirm-popup .confirm-button {
  background-color: #42b983;
  color: white;
}

.task-move-confirm-popup .cancel-button {
  background-color: #dc3545;
  color: white;
}
</style>
