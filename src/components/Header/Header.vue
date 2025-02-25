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
      <button
        class="gantt-elastic__header-btn-recenter"
        :style="{ ...style['header-btn-recenter'] }"
        @click.prevent="recenterPosition"
      >
        {{ opts.locale.Now }}
      </button>
      <label class="gantt-elastic__header-label" :style="{ ...style['header-label'] }">
        {{ opts.locale['X-Scale'] }}
        <div
          class="gantt-elastic__header-slider-wrapper"
          :style="{ ...style['header-slider-wrapper'] }"
          @mouseover="showCustomTooltip = true"
          @mouseleave="showCustomTooltip = false"
          ref="sliderWrapper"
        >
          <div v-if="showCustomTooltip" class="custom-tooltip" :style="customTooltipStyle">
            Zoom: {{ scale.toFixed(1) }}
          </div>
          <vue-slider
            class="gantt-elastic__header-slider"
            tooltip="none"
            :style="{ ...style['header-slider'] }"
            :process-style="{ ...style['header-slider--process'] }"
            :slider-style="{ ...style['header-slider--slider'] }"
            v-model="scale"
            :max="3"
            :min="0"
            :step="0.5"
            width="100px"
            @input="updateTooltipPosition"
          ></vue-slider>
        </div>
      </label>
      <label class="gantt-elastic__header-label" :style="{ ...style['header-label'] }">
        {{ opts.locale['Y-Scale'] }}
        <div
          class="gantt-elastic__header-slider-wrapper"
          :style="{ ...style['header-slider-wrapper'] }"
          @mouseover="showYScaleTooltip = true"
          @mouseleave="showYScaleTooltip = false"
          ref="ySliderWrapper"
        >
          <div v-if="showYScaleTooltip" class="custom-tooltip" :style="yScaleTooltipStyle">Height: {{ height }}px</div>
          <vue-slider
            class="gantt-elastic__header-slider"
            tooltip="none"
            :style="{ ...style['header-slider'] }"
            :process-style="{ ...style['header-slider--process'] }"
            :slider-style="{ ...style['header-slider--slider'] }"
            v-model="height"
            :max="100"
            :min="7"
            width="100px"
            @input="updateYScaleTooltipPosition"
          ></vue-slider>
        </div>
      </label>
      <label class="gantt-elastic__header-label" :style="{ ...style['header-label'] }">
        {{ opts.locale['Before/After'] }}
        <div
          class="gantt-elastic__header-slider-wrapper"
          :style="{ ...style['header-slider-wrapper'] }"
          @mouseover="showScopeTooltip = true"
          @mouseleave="showScopeTooltip = false"
          ref="scopeSliderWrapper"
        >
          <div v-if="showScopeTooltip" class="custom-tooltip" :style="scopeTooltipStyle">Expand: {{ scope }} days</div>
          <vue-slider
            class="gantt-elastic__header-slider"
            tooltip="none"
            :style="{ ...style['header-slider'] }"
            :process-style="{ ...style['header-slider--process'] }"
            :slider-style="{ ...style['header-slider--slider'] }"
            v-model="scope"
            :max="2"
            :min="0"
            width="100px"
            @input="updateScopeTooltipPosition"
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
  'header-options': { float: 'right' },
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
    label: 'gantt-elastic',
    html: false
  },
  locale: {
    Now: 'Now',
    'X-Scale': 'Zoom-X',
    'Y-Scale': 'Zoom-Y',
    'Task list width': 'Task list',
    'Before/After': 'Expand',
    'Display task list': 'Show task list'
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
      scaleTimeoutId: null,
      firstScale: false,
      localScale: 0,
      localHeight: 0,
      localBefore: 0,
      localPercent: 0,
      showCustomTooltip: false,
      showYScaleTooltip: false,
      showScopeTooltip: false,
      tooltipLeft: 0,
      yTooltipLeft: 0,
      scopeTooltipLeft: 0,
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
    this.localHeight = this.root.state.options.row.height;
    this.localBefore = this.root.state.options.scope.before;
    this.localPercent = this.root.state.options.taskList.percent;
    this.sliderOptions.xScale.value = this.root.state.options.times.timeZoom;
    this.style = this.root.mergeDeep({}, defaultStyle, this.dynamicStyle);
    this.opts = this.root.mergeDeep({}, defaultOptions, this.options);
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
    setScale(value) {
      if (this.scaleTimeoutId !== null) {
        clearTimeout(this.scaleTimeoutId);
        this.scaleTimeoutId = null;
      }
      // debouncing
      if (this.firstScale) {
        this.scaleTimeoutId = setTimeout(() => {
          this.root.$emit('times-timeZoom-change', value);
          this.scaleTimeoutId = null;
        }, 50);
      } else {
        this.root.$emit('times-timeZoom-change', value);
        this.firstScale = true;
      }
    },
    updateTooltipPosition() {
      if (this.$refs.sliderWrapper) {
        const sliderWidth = this.$refs.sliderWrapper.offsetWidth;
        const percent = (this.scale - 5) / (20 - 5);
        this.tooltipLeft = percent * sliderWidth;
      }
    },
    updateYScaleTooltipPosition() {
      if (this.$refs.ySliderWrapper) {
        const sliderWidth = this.$refs.ySliderWrapper.offsetWidth;
        const percent = (this.height - 7) / (100 - 7);
        this.yTooltipLeft = percent * sliderWidth;
      }
    },
    updateScopeTooltipPosition() {
      if (this.$refs.scopeSliderWrapper) {
        const sliderWidth = this.$refs.scopeSliderWrapper.offsetWidth;
        const percent = this.scope / 2; // max가 2이므로 2로 나눔
        this.scopeTooltipLeft = percent * sliderWidth;
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
    scale: {
      get() {
        return this.localScale;
      },
      set(value) {
        this.localScale = Number(value);
        this.setScale(this.localScale);
      }
    },
    height: {
      get() {
        return this.localHeight;
      },
      set(value) {
        this.localHeight = Number(value);
        this.root.$emit('row-height-change', Number(value));
      }
    },
    scope: {
      get() {
        return this.localBefore;
      },
      set(value) {
        this.localBefore = Number(value);
        this.root.$emit('scope-change', Number(value));
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
    },
    customTooltipStyle() {
      return {
        position: 'absolute',
        left: `${this.tooltipLeft}px`,
        top: '-25px',
        backgroundColor: '#42b983',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '12px',
        transform: 'translateX(-50%)',
        zIndex: 1000
      };
    },
    yScaleTooltipStyle() {
      return {
        position: 'absolute',
        left: `${this.yTooltipLeft}px`,
        top: '-25px',
        backgroundColor: '#42b983',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '12px',
        transform: 'translateX(-50%)',
        zIndex: 1000
      };
    },
    scopeTooltipStyle() {
      return {
        position: 'absolute',
        left: `${this.scopeTooltipLeft}px`,
        top: '-25px',
        backgroundColor: '#42b983',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '12px',
        transform: 'translateX(-50%)',
        zIndex: 1000
      };
    }
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

.custom-tooltip {
  position: absolute;
  background-color: #42b983;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
}

.custom-tooltip:after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #42b983;
}
</style>
