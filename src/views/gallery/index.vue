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
let isInitialized = false; // 跟踪初始化状态

// --- Three.js 核心变量 ---
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let photoMeshes: THREE.Mesh[] = [];
let animationFrameId: number;
let resizeObserver: ResizeObserver;

// --- 目标位置存储 ---
const targets = {
  grid: [] as THREE.Vector3[],
  sphere: [] as THREE.Vector3[],
};

const PHOTO_COUNT = 200;
const SPHERE_RADIUS = 30;

// --- 生命周期钩子 ---
onMounted(() => {
  if (!canvasContainer.value) return;
  
  // 初始化场景、相机、渲染器
  initScene();
  
  // 计算球体目标位置（这些是固定的）
  calculateSphereTargets();
  
  // 创建照片网格（初始位置不重要，稍后会更新）
  createPhotoMeshes();
  
  // 设置事件监听器和开始动画循环
  setupEventListeners();
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  if (resizeObserver && canvasContainer.value) {
    canvasContainer.value.removeEventListener('wheel', handleWheel);
    resizeObserver.unobserve(canvasContainer.value);
  }
  
  // 清理资源
  scene.traverse(object => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      if (object.material instanceof THREE.MeshBasicMaterial) {
        object.material.map?.dispose();
        object.material.dispose();
      }
    }
  });
  renderer.dispose();
});

// --- 初始化函数 ---

function initScene() {
  if (!canvasContainer.value) return;
  const container = canvasContainer.value;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(100, container.clientWidth / container.clientHeight, 0.1, 2000);
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight); // 初始设置尺寸
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = true; // 启用缩放
  controls.enablePan = true;
  controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
  controls.touches.ONE = THREE.TOUCH.PAN;
  
  scene.add(new THREE.AmbientLight(0xffffff, 3));
}

function setupEventListeners() {
  if (!canvasContainer.value) return;
  
  // 添加滚轮事件监听
  canvasContainer.value.addEventListener('wheel', handleWheel, { passive: false });
  
  // 设置ResizeObserver，这是解决初始布局问题的关键
  resizeObserver = new ResizeObserver((entries) => {
    if (entries.length > 0 && canvasContainer.value) {
      const entry = entries[0];
      
      // 获取容器的准确尺寸
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      
      // 只有当尺寸有效时才处理
      if (width > 0 && height > 0) {
        handleResize(width, height);
      }
    }
  });
  
  // 开始观察容器尺寸变化
  resizeObserver.observe(canvasContainer.value);
}

// --- 目标位置计算 ---

function calculateSphereTargets() {
  const phi = Math.PI * (3.0 - Math.sqrt(5.0));
  for (let i = 0; i < PHOTO_COUNT; i++) {
    const y = 1 - (i / (PHOTO_COUNT - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    targets.sphere.push(new THREE.Vector3(x, y, z).multiplyScalar(SPHERE_RADIUS));
  }
}

function calculateGridTargets(containerWidth: number, containerHeight: number) {
  // 清空之前的网格目标
  targets.grid = [];
  
  // 设置照片的宽高比和间距
  const aspectRatio = 4 / 3;
  const gap = 0.5; // 照片间距
  const minPhotoWidth = 2; // 最小照片宽度
  const maxPhotoWidth = 6; // 最大照片宽度
  
  // 根据容器宽度动态计算列数
  const idealPhotoPixelWidth = 120; // 减小理想宽度以增加列数
  const columns = Math.max(1, Math.floor(containerWidth / idealPhotoPixelWidth));
  
  // 计算行数
  const rows = Math.ceil(PHOTO_COUNT / columns);
  
  // 计算照片宽度，基于容器宽度和列数
  const totalGapWidth = (columns - 1) * gap;
  let photoWidth = (containerWidth / columns) * 0.03; // 减小缩放因子以增加密度
  photoWidth = Math.max(minPhotoWidth, Math.min(maxPhotoWidth, photoWidth)); // 限制照片宽度范围
  
  // 根据宽高比计算照片高度
  const photoHeight = photoWidth / aspectRatio;
  
  // 计算网格的总宽高
  const gridWidth = columns * photoWidth + totalGapWidth;
  const gridHeight = rows * photoHeight + (rows - 1) * gap;
  
  // 计算起始位置，使网格居中
  const startX = -gridWidth / 2 + photoWidth / 2;
  const startY = gridHeight / 2 - photoHeight / 2;
  
  // 创建网格位置
  for (let i = 0; i < PHOTO_COUNT; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    
    const x = startX + col * (photoWidth + gap);
    const y = startY - row * (photoHeight + gap);
    
    targets.grid.push(new THREE.Vector3(x, y, 0));
  }
  
  // 更新所有照片网格的几何体，以匹配新的尺寸
  const geometry = new THREE.PlaneGeometry(photoWidth, photoHeight);
  photoMeshes.forEach((mesh) => {
    mesh.geometry.dispose(); // 释放旧的几何体
    mesh.geometry = geometry; // 应用新的几何体
  });
  
  return { gridWidth, gridHeight };
}

// --- 创建照片网格 ---

function createPhotoMeshes() {
  const textureLoader = new THREE.TextureLoader();
  const geometry = new THREE.PlaneGeometry(4, 3); // 4:3 比例的平面
  
  for (let i = 0; i < PHOTO_COUNT; i++) {
    const material = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    
    // 初始位置不重要，会在handleResize中更新
    scene.add(mesh);
    photoMeshes.push(mesh);
    
    // 加载纹理
    textureLoader.load(`https://picsum.photos/400/300?random=${i}`, (texture) => {
      (mesh.material as THREE.MeshBasicMaterial).map = texture;
      (mesh.material as THREE.MeshBasicMaterial).color.set(0xffffff);
      (mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
    });
  }
}

// --- 动画和更新 ---

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  controls.update();
  
  // 根据模式更新照片朝向
  if (displayMode.value === 'grid') {
    // 网格模式：所有照片朝向正面
    for (const mesh of photoMeshes) mesh.quaternion.identity();
  } else {
    // 球体模式：所有照片朝向相机
    for (const mesh of photoMeshes) mesh.quaternion.copy(camera.quaternion);
  }
  
  renderer.render(scene, camera);
}

function transition(mode: 'grid' | 'sphere', duration: number = 1.5) {
  const ease = 'power3.inOut';

  // 为每个照片设置动画到目标位置
  for (let i = 0; i < PHOTO_COUNT; i++) {
    gsap.to(photoMeshes[i].position, { 
      ...targets[mode][i], 
      duration, 
      ease
    });
  }
  
  if (mode === 'grid') {
    // 网格模式：禁用旋转，启用平移
    controls.enableRotate = false;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.touches.ONE = THREE.TOUCH.PAN;
    
    // 计算适合当前网格的相机位置
    if (canvasContainer.value) {
      const { width, height } = canvasContainer.value.getBoundingClientRect();
      const { gridWidth, gridHeight } = calculateGridTargets(width, height);
      
      // 计算能够看到整个网格的相机Z位置
      const fovRad = camera.fov * (Math.PI / 180);
      const zForHeight = (gridHeight / 2) / Math.tan(fovRad / 2);
      const zForWidth = (gridWidth / 2) / Math.tan(fovRad / 2 / camera.aspect);
      const gridZ = Math.max(zForHeight, zForWidth) * 1.05; // 稍微增加一点边距
      
      // 设置相机位置动画
      gsap.to(camera.position, { x: 0, y: 0, z: gridZ * 0.6, duration, ease }); // 进一步放大
      gsap.to(controls.target, { x: 0, y: 0, z: 0, duration, ease });
    }
  } else {
    // 球体模式：启用旋转，禁用平移
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    
    // 设置相机位置动画
    gsap.to(camera.position, { x: 0, y: 0, z: 80, duration, ease });
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration, ease });
  }
  
  // 重置相机缩放
  gsap.to(camera, { 
    zoom: 2.0, // 增加默认缩放级别
    duration, 
    ease, 
    onUpdate: () => camera.updateProjectionMatrix() 
  });
}

function handleResize(width?: number, height?: number) {
  if (!canvasContainer.value || !renderer || !camera) return;
  
  // 使用传入的尺寸或从容器获取尺寸
  const containerWidth = width || canvasContainer.value.clientWidth;
  const containerHeight = height || canvasContainer.value.clientHeight;
  
  // 确保尺寸有效
  if (containerWidth === 0 || containerHeight === 0) return;
  
  // 更新渲染器尺寸
  renderer.setSize(containerWidth, containerHeight);
  
  // 更新相机宽高比
  camera.aspect = containerWidth / containerHeight;
  camera.updateProjectionMatrix();
  
  // 重新计算网格目标位置
  const { gridWidth, gridHeight } = calculateGridTargets(containerWidth, containerHeight);
  
  // 计算适合当前网格的相机Z位置
  const fovRad = camera.fov * (Math.PI / 180);
  const zForHeight = (gridHeight / 2) / Math.tan(fovRad / 2);
  const zForWidth = (gridWidth / 2) / Math.tan(fovRad / 2 / camera.aspect);
  const gridZ = Math.max(zForHeight, zForWidth) * 1.05; // 稍微增加一点边距
  
  if (!isInitialized) {
    // 首次初始化：立即设置位置，无动画
    for (let i = 0; i < PHOTO_COUNT; i++) {
      photoMeshes[i].position.copy(targets.grid[i]);
    }
    
    // 默认放大效果：减小 Z 位置或增加 zoom
    camera.position.set(0, 0, gridZ * 0.5); // 进一步减小 Z 位置以放大
    camera.zoom = 2.5; // 默认放大 2.0 倍
    camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    
    // 设置网格模式的控制器
    controls.enableRotate = false;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.touches.ONE = THREE.TOUCH.PAN;
    
    isInitialized = true;
  } else if (displayMode.value === 'grid') {
    // 后续调整：使用动画
    for (let i = 0; i < PHOTO_COUNT; i++) {
      gsap.to(photoMeshes[i].position, { ...targets.grid[i], duration: 0.5 });
    }
    
    gsap.to(camera.position, { x: 0, y: 0, z: gridZ * 0.6, duration: 0.5 }); // 保持放大
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 0.5 });
    gsap.to(camera, { zoom: 2.0, duration: 0.5, onUpdate: () => camera.updateProjectionMatrix() });
  }
}

function handleWheel(event: WheelEvent) {
  if (displayMode.value !== 'grid') return;
  
  // 在网格模式下自定义滚轮行为
  event.preventDefault();
  
  if (event.ctrlKey) {
    // Ctrl+滚轮：缩放
    const zoomSpeed = 0.1;
    camera.zoom -= event.deltaY > 0 ? zoomSpeed : -zoomSpeed;
    camera.zoom = Math.max(0.2, Math.min(camera.zoom, 5)); // 限制缩放范围
    camera.updateProjectionMatrix();
  } else {
    // 普通滚轮：垂直滚动
    const panSpeed = 0.5;
    const delta = event.deltaY * panSpeed;
    camera.position.y -= delta / 100; // 调整滚动速度
    controls.target.y -= delta / 100;
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
  bottom: 110px; /* 固定在下方 */
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