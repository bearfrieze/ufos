var THREE = require('three')
var utils = require('./utils.es6')
var materials = require('./materials.es6')

const MAX_POINTS = 500

module.exports = class Route {
  constructor (origin, ufo, scene) {
    this.ufo = ufo
    this.scene = scene
    var geometry = new THREE.BufferGeometry()
    var positions = new Float32Array(MAX_POINTS * 3)
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setDrawRange(0, 2)
    this.mesh = new THREE.Line(geometry, materials.route)
    this.mesh.renderOrder = 1
    scene.add(this.mesh)
    this.reset(origin)
  }
  addPoint (point) {
    var last = this.points[this.points.length - 1]
    if (this.points.length && last.distanceTo(point) < 10.0) return
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
      this.addPoint(utils.edgeVector(
        Math.round(Math.random()),
        Math.round(Math.random()),
        bounds
      ))
    }
    this.position = this.points[1].clone()
      .sub(this.points[0])
      .setLength(this.progress)
      .add(this.points[0])
  }
  render () {
    var positions = this.mesh.geometry.attributes.position.array
    for (var i = 0; i < this.points.length && i < MAX_POINTS; i++) {
      positions[i * 3 + 0] = this.points[i].x
      positions[i * 3 + 1] = this.points[i].y
    }
    this.mesh.geometry.setDrawRange(0, this.points.length)
    this.mesh.geometry.attributes.position.needsUpdate = true
  }
  reset (point) {
    this.progress = 0
    this.points = []
    this.addPoint(point)
    this.position = point
  }
  destroy () {
    this.scene.remove(this.mesh)
  }
}