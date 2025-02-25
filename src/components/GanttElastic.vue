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
