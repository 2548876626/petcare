<template>
  <div class="interactive-gallery">
    <!-- Three.js Canvas 的挂载点 -->
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- 悬浮的UI控制面板，固定在下方 -->
    <div class="controls">
      <div class="control-bg" :class="displayMode"></div>
      <button @click="setMode('grid')" :class="{ active: displayMode === 'grid' }">网格</button>
      <button @click="setMode('sphere')" :class="{ active: displayMode === 'sphere' }">球体</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';

// --- 状态定义 ---
const canvasContainer = ref<HTMLDivElement | null>(null);
const displayMode = ref<'grid' | 'sphere'>('grid');
let isInitialized = false;

// 默认和当前缩放值的状态
const defaultGridZoom = ref(2.5); // 你可以设置一个基础的默认放大倍数
const currentGridZoom = ref(defaultGridZoom.value); // 初始时，当前缩放等于默认缩放

// --- Three.js 核心变量 ---
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
let controls: OrbitControls, photoMeshes: THREE.Mesh[] = [];
let animationFrameId: number, resizeObserver: ResizeObserver;

// --- 目标位置存储 ---
const targets = { grid: [] as THREE.Vector3[], sphere: [] as THREE.Vector3[] };

const PHOTO_COUNT = 200;
const SPHERE_RADIUS = 30;
const PHOTO_SIZE = 8;
const PHOTO_GAP = 0.2;

// --- 生命周期钩子 ---
onMounted(() => {
  if (!canvasContainer.value) return;
  initScene();
  calculateSphereTargets();
  createPhotoMeshes();
  setupEventListeners();
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  if (resizeObserver && canvasContainer.value) {
    canvasContainer.value.removeEventListener('wheel', handleWheel);
    resizeObserver.unobserve(canvasContainer.value);
  }
  scene.traverse(o => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      if (o.material instanceof THREE.MeshBasicMaterial) o.material.map?.dispose();
    }
  });
  renderer.dispose();
});

// --- 初始化函数 ---
function initScene() {
  const container = canvasContainer.value!;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  scene.add(new THREE.AmbientLight(0xffffff, 3));
}

function setupEventListeners() {
  const container = canvasContainer.value!;
  container.addEventListener('wheel', handleWheel, { passive: false });
  resizeObserver = new ResizeObserver(entries => {
    if (entries.length > 0 && container) {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) handleResize(width, height);
    }
  });
  resizeObserver.observe(container);
}

// --- 目标位置计算 ---
function calculateSphereTargets() {
  const phi = Math.PI * (3.0 - Math.sqrt(5.0));
  for (let i = 0; i < PHOTO_COUNT; i++) {
    const y = 1 - (i / (PHOTO_COUNT - 1)) * 2, r = Math.sqrt(1 - y * y), t = phi * i;
    targets.sphere.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r).multiplyScalar(SPHERE_RADIUS));
  }
}

function calculateGridTargets() {
  targets.grid = [];
  const columns = Math.ceil(Math.sqrt(PHOTO_COUNT * (4 / 3)));
  const rows = Math.ceil(PHOTO_COUNT / columns);
  const gridWidth = columns * (PHOTO_SIZE + PHOTO_GAP) - PHOTO_GAP;
  const gridHeight = rows * (PHOTO_SIZE / (4/3) + PHOTO_GAP) - PHOTO_GAP;
  const startX = -gridWidth / 2 + PHOTO_SIZE / 2;
  const startY = gridHeight / 2 - (PHOTO_SIZE / (4/3)) / 2;

  for (let i = 0; i < PHOTO_COUNT; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = startX + col * (PHOTO_SIZE + PHOTO_GAP);
    const y = startY - row * (PHOTO_SIZE / (4/3) + PHOTO_GAP);
    targets.grid.push(new THREE.Vector3(x, y, 0));
  }
  return { gridWidth, gridHeight };
}

// --- 创建照片网格 ---
function createPhotoMeshes() {
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.PlaneGeometry(PHOTO_SIZE, PHOTO_SIZE / (4/3));
  for (let i = 0; i < PHOTO_COUNT; i++) {
    const material = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    photoMeshes.push(mesh);
    loader.load(`https://picsum.photos/400/300?random=${i}`, t => {
      (mesh.material as any).map = t;
      (mesh.material as any).color.set(0xffffff);
      (mesh.material as any).needsUpdate = true;
    });
  }
}

// --- 动画和更新 ---
function animate() {
  animationFrameId = requestAnimationFrame(animate);
  controls.update();
  if (displayMode.value === 'grid') for (const m of photoMeshes) m.quaternion.identity();
  else for (const m of photoMeshes) m.quaternion.copy(camera.quaternion);
  renderer.render(scene, camera);
}

function transition(mode: 'grid' | 'sphere', duration: number = 1.5) {
  const ease = 'power3.inOut';
  for (let i = 0; i < PHOTO_COUNT; i++) {
    gsap.to(photoMeshes[i].position, { ...targets[mode][i], duration, ease });
  }

  if (mode === 'grid') {
    controls.enableRotate = false;
    controls.enableZoom = true;
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.touches.ONE = THREE.TOUCH.PAN;

    const { gridWidth, gridHeight } = calculateGridTargets();
    const fovRad = camera.fov * (Math.PI / 180);
    const zForHeight = (gridHeight / 2) / Math.tan(fovRad / 2);
    const zForWidth = (gridWidth / 2) / Math.tan(fovRad / 2 / camera.aspect);
    const gridZ = Math.max(zForHeight, zForWidth);
    
    gsap.to(camera.position, { x: 0, y: 0, z: gridZ, duration, ease });
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration, ease });
    
    gsap.to(camera, { zoom: currentGridZoom.value, duration, ease, onUpdate: () => camera.updateProjectionMatrix() });
    
  } else {
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    gsap.to(camera.position, { x: 0, y: 0, z: 80, duration, ease });
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration, ease });
    gsap.to(camera, { zoom: 1, duration, ease, onUpdate: () => camera.updateProjectionMatrix() });
  }
}

function handleResize(width: number, height: number) {
  if (!renderer || !camera) return;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  if (!isInitialized) {
    const { gridWidth, gridHeight } = calculateGridTargets();
    for (let i = 0; i < PHOTO_COUNT; i++) photoMeshes[i].position.copy(targets.grid[i]);
    
    const fovRad = camera.fov * (Math.PI / 180);
    const zForHeight = (gridHeight / 2) / Math.tan(fovRad / 2);
    const zForWidth = (gridWidth / 2) / Math.tan(fovRad / 2 / camera.aspect);
    
    camera.position.z = Math.max(zForHeight, zForWidth);
    camera.zoom = defaultGridZoom.value;
    camera.updateProjectionMatrix();
    
    controls.target.set(0, 0, 0);
    controls.enableRotate = false;
    controls.enableZoom = true;
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.touches.ONE = THREE.TOUCH.PAN;
    isInitialized = true;
  } else if (displayMode.value === 'grid') {
    transition('grid', 0.5);
  }
}

// *** 关键修改: handleWheel 函数的逻辑被交换 ***
function handleWheel(event: WheelEvent) {
  event.preventDefault();
  if (displayMode.value !== 'grid') {
      // 在球体模式下，滚轮直接缩放相机Z轴
      const zoomSpeed = 0.05;
      camera.position.z += event.deltaY * zoomSpeed;
      camera.position.z = Math.max(20, Math.min(camera.position.z, 150));
      return;
  }
  
  // 在网格模式下
  if (event.ctrlKey) {
    // 按住Ctrl + 滚轮 = 上下平移
    const panSpeed = 0.5;
    const delta = event.deltaY * panSpeed;
    camera.position.y -= delta / 100;
    controls.target.y -= delta / 100;
  } else {
    // 默认滚轮 = 放大/缩小
    const zoomSpeed = 0.1;
    // 更新我们记录的当前zoom值
    currentGridZoom.value -= event.deltaY > 0 ? zoomSpeed : -zoomSpeed;
    currentGridZoom.value = Math.max(0.5, Math.min(currentGridZoom.value, 5));
    
    // 应用新的zoom值到相机
    camera.zoom = currentGridZoom.value;
    camera.updateProjectionMatrix();
  }
}

function setMode(mode: 'grid' | 'sphere') {
  if (displayMode.value === mode) return;
  displayMode.value = mode;
  transition(mode);
}
</script>

<style scoped>
.interactive-gallery {
  position: relative;
  width: 100vw !important; /* 强制使用视口宽度 */
  height: 100vh !important; /* 强制使用视口高度 */
  background-color: #111;
  overflow: hidden;
  margin: 0; /* 去除默认边距 */
  padding: 0; /* 去除默认内边距 */
}
.canvas-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.controls {
  position: absolute;
  bottom: 110px; /* 固定在下方，距离底部 10px */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(30, 30, 30, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 99px;
  padding: 5px;
  display: flex;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10; /* 确保控件在画布之上 */
}
.controls button {
  position: relative;
  z-index: 2;
  border: none;
  background-color: transparent;
  color: #a0a0a0;
  padding: 10px 25px;
  border-radius: 99px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.4s ease;
}
.controls button.active {
  color: #fff;
}
.control-bg {
  position: absolute;
  z-index: 1;
  top: 5px;
  left: 5px;
  width: calc(50% - 5px);
  height: calc(100% - 10px);
  background-color: #444;
  border-radius: 99px;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.control-bg.sphere {
  transform: translateX(100%);
}
.control-bg.grid {
  transform: translateX(0%);
}
</style>