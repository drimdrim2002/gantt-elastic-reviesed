<template>
  <div style="width:100%;height:100%">
    <gantt-elastic :tasks="tasks" :options="options" @task-selected="onTaskSelected">
      <gantt-header slot="header"></gantt-header>
    </gantt-elastic>
    <!-- 선택된 task 개수 표시 -->
    <div class="selected-tasks-count">선택된 Task: {{ selectedTasksCount }}개</div>
  </div>
</template>

<script>
import GanttElastic from '../src/GanttElastic.vue';
import Header from '../src/components/Header/Header.vue';
import dayjs from 'dayjs';

export default {
  name: 'GanttExample',
  components: {
    'gantt-elastic': GanttElastic,
    'gantt-header': Header
  },
  data() {
    return {
      tasks: this.getTasks(),
      selectedTasksCount: 0,
      options: {
        times: {
          timeZoom: 2,
          scope: {
            before: 0,
            after: 0
          }
        },
        scope: {
          before: 0,
          after: 0
        },
        title: {
          label: 'Your project title as html (link or whatever...)',
          html: false
        },
        row: {
          height: 34
        },
        maxRows: 100,
        maxHeight: 0,
        taskList: {
          columns: [
            {
              id: 1,
              label: 'ID',
              value: 'id',
              width: 40
            },
              
          ]
        },
        calendar: {
          gap: 3
        },
        chart: {
          grid: {
            horizontal: {
              gap: 3
            }
          }
        }
      }
    };
  },
  methods: {
    getDate({ year, month, day, hour = 0, minute = 0, second = 0 }) {
      // month는 0부터 시작하므로 1을 빼줍니다
      const date = new Date(year, month - 1, day, hour, minute, second);
      return date.getTime();
    },
    getTasks() {
      return [
        {
          id: 1,
          label: '1',
          user:
            '<a href="https://www.google.com/search?q=John+Doe" target="_blank" style="color:#0077c0;">John Doe</a>',
          start: this.getDate({ year: 2024, month: 1, day: 1, hour: 6 }), // 2024년 3월 1일 09:00:00
          duration: 0.1 * 24 * 60 * 60 * 1000,
          progress: 85,
          type: 'task',
          row: 0,
          style: {
            base: {
              fill: '#42b983' // 초록색 (row 0)
            }
          }
        },
        {
          id: 2,
          label: '2',
          user:
            '<a href="https://www.google.com/search?q=Peter+Parker" target="_blank" style="color:#0077c0;">Peter Parker</a>',
          start: this.getDate({ year: 2024, month: 1, day: 1, hour: 10, minute: 30 }), // 2024년 3월 1일 13:30:00
          duration: 0.1 * 24 * 60 * 60 * 1000,
          progress: 50,
          type: 'task',
          row: 0,
          dependentOn: [1],
          style: {
            base: {
              fill: '#42b983' // 초록색 (row 0)
            }
          }
        },
        {
          id: 3,
          label: '3',
          user:
            '<a href="https://www.google.com/search?q=John+Wayne" target="_blank" style="color:#0077c0;">John Wayne</a>',
          start: this.getDate({ year: 2024, month: 1, day: 1, hour: 6, minute: 0, second: 0 }),
          duration: 0.05 * 24 * 60 * 60 * 1000,
          progress: 100,
          type: 'task',
          row: 1,
          style: {
            base: {
              fill: '#FF0000' // 빨간색 (row 1)
            }
          }
        },
        {
          id: 4,
          label: '4',
          user:
            '<a href="https://www.google.com/search?q=Clark+Kent" target="_blank" style="color:#0077c0;">Clark Kent</a>',
          start: this.getDate({ year: 2024, month: 1, day: 1, hour: 8, minute: 0, second: 0 }),
          duration: 0.1 * 24 * 60 * 60 * 1000,
          progress: 50,
          type: 'task',
          dependentOn: [3],
          row: 1,
          style: {
            base: {
              fill: '#FF0000' // 빨간색 (row 1)
            }
          }
        },
        {
          id: 5,
          label: '5',
          user:
            '<a href="https://www.google.com/search?q=John+Wayne" target="_blank" style="color:#0077c0;">John Wayne</a>',
          start: this.getDate({ year: 2024, month: 1, day: 1, hour: 6, minute: 0, second: 0 }),
          duration: 0.05 * 24 * 60 * 60 * 1000,
          progress: 100,
          type: 'task',
          row: 2,
          style: {
            base: {
              fill: '#0000FF' // 파란색 (row 2)
            }
          }
        },
        {
          id: 6,
          label: '6',
          user:
            '<a href="https://www.google.com/search?q=Clark+Kent" target="_blank" style="color:#0077c0;">Clark Kent</a>',
          start: this.getDate({ year: 2024, month: 1, day: 1, hour: 8, minute: 0, second: 0 }),
          duration: 0.05 * 24 * 60 * 60 * 1000,
          progress: 50,
          type: 'task',
          row: 2,
          dependentOn: [5],
          style: {
            base: {
              fill: '#0000FF' // 파란색 (row 2)
            }
          }
        },
        {
          id: 7,
          label: '7',
          user:
            '<a href="https://www.google.com/search?q=Clark+Kent" target="_blank" style="color:#0077c0;">Clark Kent</a>',
          start: this.getDate({ year: 2024, month: 1, day: 1, hour: 10, minute: 0, second: 0 }),
          duration: 0.05 * 24 * 60 * 60 * 1000,
          progress: 50,
          type: 'task',
          row: 2,
          dependentOn: [6],
          style: {
            base: {
              fill: '#0000FF' // 파란색 (row 2)
            }
          }
        }
      ];
    },
    onTaskSelected({ selectedTasks, count }) {
      console.log('Task selected:', selectedTasks, count);
      this.selectedTasksCount = count;
    }
  },
  mounted() {
    this.$root.$on('gantt-elastic-ready', ganttElasticInstance => {
      ganttElasticInstance.$on('tasks-changed', tasks => {
        this.tasks = tasks;
      });
      ganttElasticInstance.$on('options-changed', options => {
        this.options = options;
      });
    });
  }
};
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.selected-tasks-count {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background-color: #42b983;
  color: red;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
</style>
