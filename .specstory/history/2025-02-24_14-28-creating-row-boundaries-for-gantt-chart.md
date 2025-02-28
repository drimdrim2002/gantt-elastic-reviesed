## SpecStory

## Creating Row Boundaries for Gantt Chart (2/24/2025, 2:28:42 PM)

_**User**_

rowBoundaries를 만드는 함수를 만들고 싶습니다.
0번째 row는 0이상 40미만
1번째 row는 40이상 80 미만
이렇게 100개 row까지 만들고 싶습니다.

---

_**Assistant**_

<think>
The user wants to create a function that defines row boundaries for their Gantt chart. They want to create boundaries for up to 100 rows where:
- Row 0 is from y-coordinate 0 (inclusive) to 40 (exclusive)
- Row 1 is from y-coordinate 40 (inclusive) to 80 (exclusive)
- ...and so on up to row 99

This suggests a pattern where each row has a height of 40 pixels, and the boundaries are calculated by multiplying the row index by 40 for the lower bound, and (row index + 1) * 40 for the upper bound.

I'll create a function that generates these row boundaries and can be used in the Task component to determine which row a task should be placed in when dragging.
</think>

I'll implement a function to create row boundaries as you described. This will be useful for accurately determining which row a task should be placed in during drag operations.

```vue:src/components/Chart/Row/Task.vue
// ... existing code ...

methods: {
  /**
   * Creates row boundaries for up to 100 rows
   * @returns {Array} Array of row boundary objects
   */
  createRowBoundaries() {
    const rowHeight = this.root.state.options.row.height +
      (this.root.state.options.calendar.gap || 0) +
      (this.root.state.options.chart.grid.horizontal.gap || 0);
    
    const boundaries = [];
    for (let i = 0; i < 100; i++) {
      boundaries.push({
        row: i,
        min: i * rowHeight,
        max: (i + 1) * rowHeight - 1 // -1 to make it exclusive
      });
    }
    return boundaries;
  },
  
  /**
   * Finds the row index based on y coordinate
   * @param {Number} y - Y coordinate
   * @returns {Number} Row index
   */
  findRowByYCoordinate(y) {
    const boundaries = this.createRowBoundaries();
    for (const boundary of boundaries) {
      if (y >= boundary.min && y < boundary.max) {
        return boundary.row;
      }
    }
    // Default to first row if not found
    return 0;
  },

  /**
   * Show tooltip
   */
  showTooltip(event) {
    // ... existing code ...
  },
// ... existing code ...

  onDragStart(event) {
    // ... existing code ...
    
    const onMouseUp = e => {
      e.preventDefault();
      e.stopPropagation();

      // 드래그 상태 해제
      this.isDragging = false;

      // 실제 드래그 이동이 없었으면 원래 위치로 복원하고 종료
      if (!this.hasMoved) {
        // ... existing code ...
      }

      // 마우스를 놓았을 때 가장 가까운 row에 배치
      const rowHeight =
        this.root.state.options.row.height +
        (this.root.state.options.calendar.gap || 0) +
        (this.root.state.options.chart.grid.horizontal.gap || 0);
      
      // 생성한 row boundaries 활용
      const rowBoundaries = this.createRowBoundaries();
      
      // ... existing code ...

      // 1. 먼저 각 task의 row 계산
      selectedTasks.forEach(selectedTask => {
        console.log(`task 배치 전: y=${selectedTask.y}, height=${selectedTask.height}`);

        // 현재 y 위치에 해당하는 row 계산 (boundaries 활용)
        const rowIndex = this.findRowByYCoordinate(selectedTask.y);

        // row의 시작 y 좌표 계산
        const rowStartY = rowIndex * rowHeight;

        // task의 높이 (SVG 높이)
        const taskHeight = 24; // SVG 높이

        // row의 중앙에 task 배치
        // row 시작 위치 + (row 높이 - task 높이) / 2
        const centerY = rowStartY + (this.root.state.options.row.height - taskHeight) / 2;

        // task 위치 업데이트
        selectedTask.y = centerY;
        selectedTask.row = rowIndex;

        console.log(`task 배치 후: y=${selectedTask.y}, row=${selectedTask.row}`);
      });
      
      // ... existing code ...
    };
    
    // ... existing code ...
  },
// ... existing code ...
```

This implementation adds:

1. `createRowBoundaries()` - Generates an array of 100 row boundary objects, each with:
   - `row`: The row index (0-99)
   - `min`: The minimum y-coordinate for this row (inclusive)
   - `max`: The maximum y-coordinate for this row (exclusive)

2. `findRowByYCoordinate(y)` - A helper function that determines which row a given y-coordinate belongs to

The code modifies the existing drag handling to use these new functions when calculating which row to place a task in during drag operations. This will provide a more accurate row placement, especially when dealing with different row heights or gaps.

---



---

