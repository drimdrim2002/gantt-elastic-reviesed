<template>
  <!-- No changes to template section -->
</template>

<script>
export default {
  methods: {
    updateSelectedTasks(tasks) {
      console.log('Root updateSelectedTasks called with:', tasks.map(t => t.id));

      // 명시적으로 새 배열 생성
      this.state.selectedTasks = Array.isArray(tasks) ? [...tasks] : [];

      // 모든 task의 선택 상태 초기화 (스타일 적용 해제를 위해)
      if (this.state.selectedTasks.length === 0) {
        // 모든 visible task에 대해 isSelected 속성 초기화
        this.visibleTasks.forEach(task => {
          if (task.$set) {
            task.$set(task, 'isSelected', false);
          } else {
            task.isSelected = false;
          }
        });
      }

      // 상태 변경 알림
      this.$nextTick(() => {
        console.log('Root selectedTasks updated to:', this.state.selectedTasks.map(t => t.id));
      });
    }
  }
};
</script>

<style>
/* No changes to style section */
</style>
