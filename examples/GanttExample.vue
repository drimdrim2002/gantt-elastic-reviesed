<template>
  <div style="width:100%;height:100%">
    <gantt-elastic :tasks="tasks" :options="options">
      <gantt-header slot="header"></gantt-header>
    </gantt-elastic>
  </div>
</template>

<script>
import GanttElastic from '../src/GanttElastic.vue';
import Header from 'gantt-elastic-header';
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
      options: {
        title: {
          label: 'Your project title as html (link or whatever...)',
          html: false
        },
        taskList: {
          columns: [
            {
              id: 1,
              label: 'ID',
              value: 'id',
              width: 40
            },
            {
              id: 2,
              label: 'Description',
              value: 'label',
              width: 200,
              expander: true
            },
            {
              id: 3,
              label: 'Assigned to',
              value: 'user',
              width: 130,
              html: true
            },
            {
              id: 3,
              label: 'Start',
              value: task => dayjs(task.start).format('YYYY-MM-DD'),
              width: 78
            },
            {
              id: 4,
              label: 'Type',
              value: 'type',
              width: 68
            },
            {
              id: 5,
              label: '%',
              value: 'progress',
              width: 35,
              style: {
                'task-list-header-label': {
                  'text-align': 'center',
                  width: '100%'
                },
                'task-list-item-value-container': {
                  'text-align': 'center'
                }
              }
            }
          ]
        }
      }
    };
  },
  methods: {
    getDate(hours) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      const timeStamp = new Date(`${currentYear}-${currentMonth}-${currentDay} 00:00:00`).getTime();
      return new Date(timeStamp + hours * 60 * 60 * 1000).getTime();
    },
    getTasks() {
      return [
        {
          id: 1,
          label: 'Make some noise',
          user:
            '<a href="https://www.google.com/search?q=John+Doe" target="_blank" style="color:#0077c0;">John Doe</a>',
          start: this.getDate(-24 * 5),
          duration: 5 * 24 * 60 * 60 * 1000,
          progress: 85,
          type: 'project'
        },
        {
          id: 2,
          label: 'With great power comes great responsibility',
          user:
            '<a href="https://www.google.com/search?q=Peter+Parker" target="_blank" style="color:#0077c0;">Peter Parker</a>',
          parentId: 1,
          start: this.getDate(-24 * 4),
          duration: 4 * 24 * 60 * 60 * 1000,
          progress: 50,
          type: 'milestone',
          style: {
            base: {
              fill: '#1EBC61',
              stroke: '#0EAC51'
            }
          }
        },
        {
          id: 3,
          label: 'Courage is being scared to death, but saddling up anyway.',
          user:
            '<a href="https://www.google.com/search?q=John+Wayne" target="_blank" style="color:#0077c0;">John Wayne</a>',
          parentId: 2,
          start: this.getDate(-24 * 3),
          duration: 2 * 24 * 60 * 60 * 1000,
          progress: 100,
          type: 'task'
        },
        {
          id: 4,
          label: 'Put that toy AWAY!',
          user:
            '<a href="https://www.google.com/search?q=Clark+Kent" target="_blank" style="color:#0077c0;">Clark Kent</a>',
          start: this.getDate(-24 * 2),
          duration: 2 * 24 * 60 * 60 * 1000,
          progress: 50,
          type: 'task',
          dependentOn: [3]
        }
      ];
    }
  },
  mounted() {
    // 이벤트 리스너 설정
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
</style>
