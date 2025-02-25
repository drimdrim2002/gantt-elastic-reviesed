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
    <g v-for="line in dependencyLines" :key="line.id">
      <path
        class="gantt-elastic__chart-dependency-lines-path"
        :style="{
          stroke: getLineColor(line.fromTask),
          strokeWidth: '1.5px',
          strokeOpacity: '0.7',
          fill: 'none',
          strokeDasharray: 'none',
          pointerEvents: 'none'
        }"
        :d="line.path"
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
     * Get line color from task style
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
     * Get path points
     *
     * @param {any} fromTaskId
     * @param {any} toTaskId
     * @returns {string}
     */
    getPoints(fromTaskId, toTaskId) {
      const fromTask = this.root.getTask(fromTaskId);
      const toTask = this.root.getTask(toTaskId);
      if (
        fromTask === null ||
        toTask === null ||
        !this.root.isTaskVisible(toTask) ||
        !this.root.isTaskVisible(fromTask)
      ) {
        return null;
      }
      const startX = fromTask.x + fromTask.width;
      const startY = fromTask.y + fromTask.height / 2;
      const stopX = toTask.x;
      const stopY = toTask.y + toTask.height / 2;
      const distanceX = stopX - startX;
      let distanceY;
      let yMultiplier = 1;
      if (stopY >= startY) {
        distanceY = stopY - startY;
      } else {
        distanceY = startY - stopY;
        yMultiplier = -1;
      }
      const offset = 10;
      const roundness = 4;
      const isBefore = distanceX <= offset + roundness;
      let points = `M ${startX} ${startY}
          L ${startX + offset},${startY} `;
      if (isBefore) {
        points += `Q ${startX + offset + roundness},${startY} ${startX + offset + roundness},${startY +
          roundness * yMultiplier}
            L ${startX + offset + roundness},${startY + (distanceY * yMultiplier) / 2 - roundness * yMultiplier}
            Q ${startX + offset + roundness},${startY + (distanceY * yMultiplier) / 2} ${startX + offset},${startY +
          (distanceY * yMultiplier) / 2}
            L ${startX - offset + distanceX},${startY + (distanceY * yMultiplier) / 2}
            Q ${startX - offset + distanceX - roundness},${startY + (distanceY * yMultiplier) / 2} ${startX -
          offset +
          distanceX -
          roundness},${startY + (distanceY * yMultiplier) / 2 + roundness * yMultiplier}
            L ${startX - offset + distanceX - roundness},${stopY - roundness * yMultiplier}
            Q ${startX - offset + distanceX - roundness},${stopY} ${startX - offset + distanceX},${stopY}
            L ${stopX},${stopY}`;
      } else {
        points += `L ${startX + distanceX / 2 - roundness},${startY}
            Q ${startX + distanceX / 2},${startY} ${startX + distanceX / 2},${startY + roundness * yMultiplier}
            L ${startX + distanceX / 2},${stopY - roundness * yMultiplier}
            Q ${startX + distanceX / 2},${stopY} ${startX + distanceX / 2 + roundness},${stopY}
            L ${stopX},${stopY}`;
      }
      return points;
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
              // 시작점 (의존하는 task의 오른쪽 중앙)
              const startX = dependentTask.x + 24; // task width가 24
              const startY = dependentTask.y + this.root.state.options.row.height / 2; // row의 중앙

              // 끝점 (현재 task의 왼쪽 중앙)
              const endX = task.x;
              const endY = task.y + this.root.state.options.row.height / 2; // row의 중앙

              // 곡선 제어점
              const controlPoint1X = startX + Math.min((endX - startX) * 0.5, 50);
              const controlPoint1Y = startY;
              const controlPoint2X = endX - Math.min((endX - startX) * 0.5, 50);
              const controlPoint2Y = endY;

              // 베지어 곡선 경로 생성
              const path = `M ${startX} ${startY} 
                          C ${controlPoint1X} ${controlPoint1Y},
                            ${controlPoint2X} ${controlPoint2Y},
                            ${endX} ${endY}`;

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
  transition: stroke-width 0.2s;
}

.gantt-elastic__chart-dependency-lines-path:hover {
  stroke-width: 3px;
}
</style>
