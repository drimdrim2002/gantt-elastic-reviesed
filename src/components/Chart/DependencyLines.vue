<!--
/**
 * @fileoverview DependencyLines component
 * @license MIT
 * @author Rafal Pospiech <neuronet.io@gmail.com>
 * @package GanttElastic
 */
-->
<template>
  <svg
    x="0"
    y="0"
    width="100%"
    height="100%"
    class="gantt-elastic__chart-dependency-lines-container"
    :style="{ ...root.style['chart-dependency-lines-container'] }"
  >
    <g class="gantt-elastic__chart-dependency-lines">
      <path
        v-for="line in dependencyLines"
        :key="line.id"
        :d="line.path"
        class="gantt-elastic__chart-dependency-lines-path"
        :style="{
          stroke: getLineColor(line.toTask),
          strokeWidth: '2px',
          fill: 'none'
        }"
      ></path>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'DependencyLines',
  inject: ['root'],
  props: ['tasks'],
  data() {
    return {};
  },
  methods: {
    /**
     * Get line color from task
     * @param {Object} task
     * @returns {string}
     */
    getLineColor(task) {
      // task의 스타일에서 색상 가져오기
      if (task && task.style && task.style.base) {
        return task.style.base.fill || '#42b983'; // 기본 색상은 task의 기본 색상과 동일
      }
      // task에서 색상을 찾을 수 없는 경우 기본 색상 반환
      return '#42b983';
    },
    /**
     * Get path between two tasks
     *
     * @param {object} fromTask
     * @param {object} toTask
     * @returns {string}
     */
    getPath(fromTask, toTask) {
      // 시작점 (의존하는 task의 오른쪽 중앙)
      const startX = fromTask.x + 24; // task width가 24
      const startY = fromTask.y + this.root.state.options.row.height / 2; // row의 중앙

      // 끝점 (현재 task의 왼쪽 중앙)
      const endX = toTask.x;
      const endY = toTask.y + this.root.state.options.row.height / 2; // row의 중앙

      // 중간 지점 계산
      const midX = startX + (endX - startX) / 2;

      // 단순한 꺾인 선 경로 생성 (ㄱ자 형태)
      const path = `M ${startX} ${startY} 
                   L ${midX} ${startY} 
                   L ${midX} ${endY} 
                   L ${endX} ${endY}`;

      return path;
    }
  },
  computed: {
    /**
     * Get tasks which are dependent on other tasks
     *
     * @returns {array}
     */
    dependencyLines() {
      const lines = [];
      this.root.visibleTasks.forEach(task => {
        if (task.dependentOn && task.dependentOn.length > 0) {
          task.dependentOn.forEach(dependentId => {
            const dependentTask = this.root.visibleTasks.find(t => t.id === dependentId);
            if (dependentTask) {
              // 메서드를 사용하여 경로 생성
              const path = this.getPath(dependentTask, task);

              lines.push({
                id: `${dependentTask.id}-${task.id}`,
                path: path,
                fromTask: dependentTask,
                toTask: task
              });
            }
          });
        }
      });
      return lines;
    }
  }
};
</script>

<style scoped>
.gantt-elastic__chart-dependency-lines-container {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 2;
}

.gantt-elastic__chart-dependency-lines-path {
  fill: none;
  stroke: #42b983;
  stroke-width: 2px;
}

.gantt-elastic__chart-dependency-lines-path:hover {
  stroke-width: 3px;
  transition: stroke-width 0.2s;
}
</style>
