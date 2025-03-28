<template>
  <div v-if="visible" class="move-confirmation-popup">
    <div class="popup-content">
      <h3>Move Confirmation</h3>
      <div class="task-move-info">
        <ul>
          <li v-for="task in tasks" :key="task.id">
            Task {{ task.label }} is moved from {{ getRowName(fromRow) }} → {{ getRowName(toRow) }}
          </li>
        </ul>
      </div>
      <div class="popup-buttons">
        <button class="confirm-btn" @click="confirm">Confirm</button>
        <button class="cancel-btn" @click="cancel">Cancle</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MoveConfirmationPopup',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    tasks: {
      type: Array,
      default: () => []
    },
    originalTasks: {
      type: Array,
      default: () => []
    },
    fromRow: {
      type: Number,
      default: -1
    },
    toRow: {
      type: Number,
      default: -1
    },
    vhclIdByRow: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      originalRowMap: {}
    };
  },
  watch: {
    originalTasks: {
      handler(tasks) {
        // 원래 위치 정보 매핑
        this.originalRowMap = {};
        tasks.forEach(task => {
          this.originalRowMap[task.id] = task.row;
        });
      },
      immediate: true
    }
  },
  methods: {
    getRowName(rowId) {
      // 여기서는 row ID를 차량 이름으로 변환하는 로직을 구현
      // 실제 구현에서는 차량 데이터에 따라 적절히 수정
      return this.vhclIdByRow[rowId];
    },
    confirm() {
      this.$emit('confirm');
    },
    cancel() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.move-confirmation-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  min-width: 400px;
  max-width: 600px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

h3 {
  margin-top: 0;
  color: #333;
}

.task-move-info {
  margin: 15px 0;
}

.popup-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  margin-left: 10px;
}

.confirm-btn {
  background-color: #42b983;
  color: white;
}

.cancel-btn {
  background-color: #f3f3f3;
  color: #333;
}
</style>
