function floor(value) {
  return Math.floor(value)
}

function random(value) {
  return Math.random(value)
}

function abs(value) {
  return Math.abs(value)
}
function GeneratePoints(width, height, row = 3, column = 3, pointGap = 20) {
  this.width = width
  this.height = height
  this.row = row
  this.column = column
  this.pointGap = pointGap
  this.vector = [[pointGap, 0], [pointGap, pointGap], [0, pointGap], [-pointGap, pointGap], [-pointGap, 0], [-pointGap, -pointGap], [0, -pointGap], [pointGap, -pointGap]]
  this.xAxisGap = floor(width / (column + 1))
  this.yAxisGap = floor(height / (row + 1))

  this.pointsOrigin = []
  this.data = []
}
let val = Math.random() * 100
GeneratePoints.prototype.initPoints = function (initPointsValue) {
  for (let r = 0; r < this.row; r++) {
    let colArr = []
    for (let c = 0; c < this.column; c++) {
      // debugger
      // console.log(initPointsValue[r][c])
      colArr.push({
        x: this.xAxisGap * (c + 1),
        y: this.yAxisGap * (r + 1),
        value: val,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        radius: 50
      })
    }
    this.pointsOrigin.push(colArr)
  }
  return this
}
// 右边的点到左边的点的距离
// 用于确定右边点的left,左边点的right
GeneratePoints.prototype._rightToLeftBoundary = function (currentPoint, leftPoint) {
  const leftDistance = currentPoint.x - leftPoint.x
  const leftTotal = currentPoint.value + leftPoint.value
  const leftScale = (currentPoint.value / leftTotal) * leftDistance
  currentPoint.left = floor(currentPoint.x - leftScale)
  leftPoint.right = floor(leftPoint.x + leftDistance - leftScale)
}
// 底部的点到顶部的点的距离
// 用于确定底部点的top, 顶部点的bottom
GeneratePoints.prototype._bottomToTopBoundary = function (currentPoint, topPoint) {
  const topDistance = currentPoint.y - topPoint.y
  const topTotal = currentPoint.value + topPoint.value
  const topScale = (currentPoint.value / topTotal) * topDistance

  currentPoint.top = floor(currentPoint.y - topScale)
  topPoint.bottom = floor(topPoint.y + topDistance - topScale)
}

GeneratePoints.prototype.computedBoundary = function () {
  // 计算外边 上下边界
  for (let c = 0; c < this.column; c++) {
    this.pointsOrigin[0][c].top = 0
    this.pointsOrigin[this.row - 1][c].bottom = this.height
    // 最后一排的上边界
    // const 
    this._bottomToTopBoundary(this.pointsOrigin[this.row - 1][c], this.pointsOrigin[this.row - 2][c])
    if (c > 0) {
      this._rightToLeftBoundary(this.pointsOrigin[0][c], this.pointsOrigin[0][c - 1])
      this._rightToLeftBoundary(this.pointsOrigin[this.row - 1][c], this.pointsOrigin[this.row - 1][c - 1])
    }
  }

  // 计算外边 左右边界
  for (let r = 0; r < this.row; r++) {
    this.pointsOrigin[r][0].left = 0
    this.pointsOrigin[r][this.column - 1].right = this.width
    // 最后一列的左边界
    // const 
    this._rightToLeftBoundary(this.pointsOrigin[r][this.column - 1], this.pointsOrigin[r][this.column - 2])
    if (r > 0) {
      this._bottomToTopBoundary(this.pointsOrigin[r][0], this.pointsOrigin[r - 1][0])
      this._bottomToTopBoundary(this.pointsOrigin[r][this.column - 1], this.pointsOrigin[r - 1][this.column - 1])
    }
  }
  /**
   * 计算内部点的上下左右边界
   * 上下左右边界的距离为
   * 相同方向上点的value占比 * 两点之间同方向的距离
   * 
  */
  for (let r = 1; r < this.row - 1; r++) {
    for (let c = 1; c < this.column - 1; c++) {
      // top
      this._bottomToTopBoundary(this.pointsOrigin[r][c], this.pointsOrigin[r - 1][c])
      // left 
      this._rightToLeftBoundary(this.pointsOrigin[r][c], this.pointsOrigin[r][c - 1])
    }
  }
  return this
}
// 用于计算根据每个原始点的dfs
GeneratePoints.prototype.perOriginPointDfs = function () {
  let points = this.pointsOrigin.flat().sort((p1, p2) => p1.value - p2.value)
  while (points.length) {
    let point = points.pop()
    let randomVal = random() / point.value
    this._bfs(point, randomVal)
  }
  return this
}

GeneratePoints.prototype._bfs = function (currentPoint, randomVal) {
  const {
    value: initValue,
    left: leftBoundary,
    right: rightBoundary,
    top: topBoundary,
    bottom: bottomBoundary
  } = currentPoint
  const queue = [currentPoint]

  const vector = this.vector
  const data = this.data
  data.push(currentPoint)
  const memo = {}

  while (queue.length) {
    const point = queue.pop()
    for (let v of vector) {
      let x = point.x + v[0] // floor(v[0] * random)
      let y = point.y + v[1] // floor(v[1] * random)
      let key = x + '_' + y
      if (memo[key]) continue
      let value = point.value
      if (x >= leftBoundary && x <= rightBoundary && y >= topBoundary && y <= bottomBoundary) {
        memo[key] = true
        data.push({
          x: x,
          y: y,
          value: value - randomVal,
          // radius: Math.abs(floor(value / 50) * 100)
        })
        queue.push({
          x: x,
          y: y,
          value: value - randomVal
        })
      }
    }
  }

  return this
}
