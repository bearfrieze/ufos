var THREE = require('three')
var utils = require('./utils.es6')
var materials = require('./materials.es6')

const POINTS_MAX = 500
const SEGMENT_MIN = 10.0
const SEGMENT_MAX = 20.0

module.exports = class Route {
  constructor (start, ufo, game) {
    this.ufo = ufo
    this.game = game
    this.position = new THREE.Vector3()
    var geometry = new THREE.BufferGeometry()
    var positions = new Float32Array(POINTS_MAX * 3)
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.mesh = new THREE.Line(geometry, materials.route)
    this.mesh.renderOrder = 0
    this.game.scene.add(this.mesh)
    this.reset(start)
  }
  addPoint (point) {
    if (this.points.length) {
      var last = this.points[this.points.length - 1]
      var distance = last.distanceTo(point)
      if (distance < SEGMENT_MIN) return
      if (distance > SEGMENT_MAX) {
        var segment = point.clone().sub(last).setLength(SEGMENT_MAX)
        last = last.clone()
        while (distance > SEGMENT_MAX) {
          this.points.push(last.add(segment).clone())
          distance -= SEGMENT_MAX
        }
      }
    }
    this.points.push(point)
    this.render()
  }
  travel (units) {
    if (this.drawing && this.points.length === 1) return
    this.progress += units
    var changed = false
    while (this.points.length > 1) {
      var dist = this.points[0].distanceTo(this.points[1])
      if (this.progress < dist) break
      this.progress -= dist
      this.points.shift()
      changed = true
    }
    if (changed) this.render()
    if (this.ufo.goal && this.points.length === 1) return this.ufo.landed = true
    while(this.points.length === 1) {
      this.random = true
      this.addPoint(this.game.ufoLocation())
    }
    this.position.copy(this.points[1])
      .sub(this.points[0])
      .setLength(this.progress)
      .add(this.points[0])
  }
  render () {
    var positions = this.mesh.geometry.attributes.position.array
    for (var i = 0; i < this.points.length && i < POINTS_MAX; i++) {
      positions[i * 3 + 0] = this.points[i].x
      positions[i * 3 + 1] = this.points[i].y
    }
    this.mesh.geometry.setDrawRange(0, this.random ? 0 : this.points.length)
    this.mesh.geometry.attributes.position.needsUpdate = true
  }
  reset (point) {
    this.progress = 0
    this.points = []
    this.addPoint(point.clone())
    this.position.copy(point)
    this.random = false
  }
  destroy () {
    this.game.scene.remove(this.mesh)
  }
}
