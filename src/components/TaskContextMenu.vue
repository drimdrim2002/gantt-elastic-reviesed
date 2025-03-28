<template>
  <div v-if="visible" class="context-menu-overlay" @click="onOverlayClick">
    <div
      class="task-context-menu"
      :style="{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`
      }"
      @click.stop
    >
      <div
        class="context-menu-header"
        :style="{
          background: taskInfo.style.fill || '#42b983',
          color: '#ffffff'
        }"
      >
        <strong>{{ taskInfo.label }}</strong>
        <button
          class="close-button"
          @click.stop="onClose"
          :style="{
            color: '#ffffff'
          }"
        >
          ×
        </button>
      </div>
      <div class="context-menu-content">
        <div class="task-info">
          <div>ID: {{ taskInfo.id }}</div>
          <div>차량: {{ taskInfo.vhclId }}</div>
          <div>시작: {{ formatDateTime(taskInfo.start) }}</div>
          <div>진행률: {{ taskInfo.progress }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskContextMenu',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    position: {
      type: Object,
      required: true,
      validator: prop => 'x' in prop && 'y' in prop
    },
    taskInfo: {
      type: Object,
      required: true
    }
  },

  methods: {
    formatDateTime(timestamp) {
      return new Date(timestamp).toLocaleString();
    },

    onClose() {
      this.$emit('close');
    },

    onOverlayClick(event) {
      // 메뉴 영역 클릭시에는 닫지 않음
      if (event.target.closest('.task-context-menu') && !event.target.closest('.close-button')) {
        return;
      }
      this.$emit('close');
    }
  },

  mounted() {
    // ESC 키 이벤트 리스너 추가
    document.addEventListener('keydown', this.handleKeyDown);
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
  },

  beforeDestroy() {
    // ESC 키 이벤트 리스너 제거
    document.removeEventListener('keydown', this.handleKeyDown);
    // 스크롤 복원
    document.body.style.overflow = '';
  },

  methods: {
    handleKeyDown(event) {
      if (event.key === 'Escape' && this.visible) {
        this.$emit('close');
      }
    }
  }
};
</script>

<style scoped>
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
  cursor: default;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: bold;
  transition: background-color 0.3s ease;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 20px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.close-button:focus {
  outline: none;
}

.context-menu-content {
  padding: 8px 12px;
}

.task-info {
  margin-bottom: 12px;
  font-size: 0.9em;
  color: #666;
}

.task-info > div {
  margin: 4px 0;
}

@media (hover: none) {
  .close-button {
    padding: 8px;
  }
}
</style>
