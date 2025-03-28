<!--
/**
 * @fileoverview Header component
 * @license MIT
 * @author Rafal Pospiech <neuronet.io@gmail.com>
 * @package GanttElasticHeader
 */
-->
<template>
  <div class="gantt-elastic__header" :style="{ ...style['header'] }">
    <div class="gantt-elastic__header-title" :style="{ ...style['header-title'] }">
      <div
        class="gantt-elastic__header-title--text"
        :style="{ ...style['header-title--text'] }"
        v-if="!opts.title.html"
      >
        {{ opts.title.label }}
      </div>
      <div
        class="gantt-elastic__header-title--html"
        :style="{ ...style['header-title--html'] }"
        v-if="opts.title.html"
        v-html="opts.title.label"
      ></div>
    </div>
    <div class="gantt-elastic__header-options" :style="{ ...style['header-options'] }">
      <div class="gantt-elastic__header-controls" :style="{ ...style['header-controls'] }">
        <label class="gantt-elastic__header-label" :style="{ ...style['header-label'] }">
          {{ opts.locale['X-Scale'] }}
          <div class="gantt-elastic__header-slider-wrapper" :style="{ ...style['header-slider-wrapper'] }">
            <vue-slider
              class="gantt-elastic__header-slider"
              tooltip="none"
              :style="{ ...style['header-slider'] }"
              :process-style="{ ...style['header-slider--process'] }"
              :slider-style="{ ...style['header-slider--slider'] }"
              v-model="scale"
              :max="this.zoomMax"
              :min="this.zoomMin"
              :step="0.1"
              :interval="0.1"
              :duration="0"
              width="100px"
            ></vue-slider>
          </div>
        </label>
        <label class="gantt-elastic__header-label" :style="{ ...style['header-label'] }">
          {{ opts.locale['Task list width'] }}
          <div class="gantt-elastic__header-slider-wrapper" :style="{ ...style['header-slider-wrapper'] }">
            <vue-slider
              class="gantt-elastic__header-slider"
              tooltip="none"
              :style="{ ...style['header-slider'] }"
              :process-style="{ ...style['header-slider--process'] }"
              :slider-style="{ ...style['header-slider--slider'] }"
              v-model="divider"
              :max="100"
              :min="0"
              width="100px"
            ></vue-slider>
          </div>
        </label>
        <label
          class="gantt-elastic__header-task-list-switch--wrapper"
          :style="{ ...style['header-task-list-switch--label'] }"
        >
          <switches
            class="gantt-elastic__header-task-list-switch"
            :style="{ ...style['header-task-list-switch'] }"
            v-model="root.state.options.taskList.display"
          ></switches>
          {{ opts.locale['Display task list'] }}
        </label>
      </div>
      <div class="gantt-elastic__header-buttons" :style="{ ...style['header-buttons'] }">
        <button
          class="gantt-elastic__header-btn-recenter"
          :style="{ ...style['header-btn-recenter'] }"
          @click.prevent="recenterPosition"
        >
          {{ opts.locale.Now }}
        </button>
        <button
          class="gantt-elastic__header-btn-save"
          :style="{ ...style['header-btn-save'] }"
          @click.prevent="saveState"
        >
          {{ opts.locale.Save }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import vueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';
import Switches from 'vue-switches';

const defaultStyle = {
  header: {
    margin: '0px auto',
    background: '#f3f5f747',
    padding: '10px',
    overflow: 'hidden',
    clear: 'both',
    display: 'flex',
    'justify-content': 'space-between'
  },
  'header-title': { float: 'left' },
  'header-options': {
    float: 'right',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-between',
    width: '100%'
  },
  'header-controls': {
    display: 'flex',
    'align-items': 'center',
    'margin-right': 'auto'
  },
  'header-buttons': {
    display: 'flex',
    'align-items': 'center',
    'margin-left': '20px'
  },
  'header-title--text': {
    'font-size': '20px',
    'vertical-align': 'middle',
    'font-weight': '400',
    'line-height': '35px',
    'padding-left': '22px',
    'letter-spacing': '1px'
  },
  'header-title--html': {
    'font-size': '20px',
    'vertical-align': 'middle',
    'font-weight': '400',
    'line-height': '35px',
    'padding-left': '22px',
    'letter-spacing': '1px'
  },
  'header-btn-recenter': {
    background: '#95A5A6',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    color: 'white',
    'border-radius': '3px',
    'margin-right': '27px',
    'font-size': '16px',
    padding: '8px 12px'
  },
  'header-btn-save': {
    background: '#42b983',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    color: 'white',
    'border-radius': '3px',
    'margin-right': '27px',
    'font-size': '16px',
    padding: '8px 12px'
  },
  'header-slider': {
    'box-sizing': 'content-box'
  },
  'header-slider-wrapper': {
    display: 'inline-block',
    'vertical-align': 'middle'
  },
  'header-slider--slider': { 'box-sizing': 'content-box' },
  'header-slider--process': { 'box-sizing': 'content-box' },
  'header-task-list-switch--label': { 'box-sizing': 'content-box' },
  'header-task-list-switch': {
    margin: '0px 15px',
    'vertical-align': 'middle'
  },
  'header-label': {}
};
const defaultOptions = {
  title: {
    label: '',
    html: false
  },
  locale: {
    Now: 'Back to Start',
    'X-Scale': 'Zoom',
    'Task list width': 'Vehicle List',
    'Display task list': 'Show Vehicle List',
    Save: 'Save'
  }
};
export default {
  name: 'GanttHeader',
  components: {
    vueSlider,
    Switches
  },
  props: ['options', 'dynamicStyle'],
  inject: ['root'],
  data() {
    return {
      zoomMin: 1,
      zoomStep: 0.1,
      scaleTimeoutId: null,
      firstScale: false,
      localScale: 0,
      localPercent: 0,
      sliderOptions: {
        xScale: {
          value: 0
        }
      },
      style: {},
      opts: {}
    };
  },
  created() {
    this.localScale = this.root.state.options.times.timeZoom;
    this.localPercent = this.root.state.options.taskList.percent;
    this.sliderOptions.xScale.value = this.root.state.options.times.timeZoom;
    this.style = this.root.mergeDeep({}, defaultStyle, this.dynamicStyle);
    this.opts = this.root.mergeDeep({}, defaultOptions, this.options);

    this.root.$on('times-timeZoom-updated', newZoom => {
      this.localScale = newZoom;
    });
  },
  methods: {
    getImage() {
      this.root.getImage('image/png').then(imgB64 => {
        const link = document.createElement('a');
        link.href = imgB64;
        link.download = 'gantt-elastic.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    },
    recenterPosition() {
      this.root.$emit('recenterPosition');
    },
    saveState() {
      const state = {
        timeZoom: this.localScale,
        taskListPercent: this.localPercent,
        taskListDisplay: this.root.state.options.taskList.display,
        currentTime: this.root.state.options.times.currentTime
      };

      localStorage.setItem('ganttState', JSON.stringify(state));
      alert('상태가 저장되었습니다.');
    },
    setScale(value) {
      if (this.scaleTimeoutId !== null) {
        clearTimeout(this.scaleTimeoutId);
        this.scaleTimeoutId = null;
      }
      // debouncing
      if (this.firstScale) {
        this.scaleTimeoutId = setTimeout(() => {
          this.root.$emit('times-timeZoom-change', parseFloat(value.toFixed(1)));
          this.scaleTimeoutId = null;
        }, 50);
      } else {
        this.root.$emit('times-timeZoom-change', parseFloat(value.toFixed(1)));
        this.firstScale = true;
      }
    }
  },
  computed: {
    /**
     * If there is a component slot specified for header
     * @returns {bool}
     */
    beforeOptionsIsComponent() {
      const headerSlot = this.options.slots.header;
      if (typeof headerSlot.beforeOptions === 'object' && !Array.isArray(headerSlot.beforeOptions)) {
        return true;
      }
      return false;
    },
    /**
     * If there is a slot with beforeOptions html content
     * @returns {bool}
     */
    beforeOptionsIsHtml() {
      if (typeof this.options.slots.header.beforeOptions === 'string') {
        return true;
      }
      return false;
    },

    zoomMax() {
      const steps = this.root.state.options.times.steps || [];
      const daysCount = steps.length;
      if (steps.length <= 1) {
        return 2;
      } else {
        return 2 * daysCount;
      }
    },

    scale: {
      get() {
        return this.localScale;
      },
      set(value) {
        this.localScale = parseFloat(value.toFixed(1));
        this.setScale(this.localScale);
      }
    },
    divider: {
      get() {
        return this.localPercent;
      },
      set(value) {
        this.localPercent = Number(value);
        this.root.$emit('taskList-width-change', Number(value));
      }
    }
  },

  /**
   * 컴포넌트가 제거되기 전에 이벤트 리스너 정리
   */
  beforeDestroy() {
    // 이벤트 리스너 제거
    this.root.$off('times-timeZoom-updated');
  }
};
</script>

<style>
/* Tooltip 스타일 커스터마이즈 */
.vue-slider-tooltip {
  background-color: #42b983 !important;
  border-color: #42b983 !important;
  padding: 2px 6px !important;
  font-size: 12px !important;
}

.vue-slider-tooltip-top::before {
  border-top-color: #42b983 !important;
}

.gantt-elastic__header-slider-wrapper {
  position: relative;
}
</style>
