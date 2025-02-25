<template>
  <!-- No changes to template section -->
</template>

<script>
export default {
  methods: {
    updateSelectedTasks(tasks) {
      // 명시적으로 새 배열 생성
      this.state.selectedTasks = Array.isArray(tasks) ? [...tasks] : [];

      // 모든 task의 선택 상태 초기화 (스타일 적용 해제를 위해)
      if (this.state.selectedTasks.length === 0) {
        // 모든 visible task에 대해 isSelected 속성 초기화
        this.visibleTasks.forEach(task => {
          task.isSelected = false;
        });
      }

      // 상태 변경 알림
      this.$nextTick(() => {
        // 선택된 task들에 isSelected 속성 설정
        this.state.selectedTasks.forEach(task => {
          task.isSelected = true;
        });

        // 이벤트 발생
        this.$emit('tasks-selected', this.state.selectedTasks);
      });
    }
  }
};
</script>

<style>
/* No changes to style section */
</style>
