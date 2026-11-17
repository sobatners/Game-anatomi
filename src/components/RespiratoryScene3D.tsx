import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ORGAN_DETAILS, type OrganId } from '../data/respiratoryData';

export interface RespiratoryScene3DProps {
  selectedOrgan: OrganId;
  onSelectOrgan: (organ: OrganId) => void;
  xrayMode: boolean;
  breathMode: 'auto' | 'inspirasi' | 'ekspirasi';
  breathRate: 'normal' | 'olahraga';
  autoRotate?: boolean;
}

// Pre-allocated scratch helpers outside render loop (zero GC)
const _camTargetPos = new THREE.Vector3();
const _camTargetLook = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _tmpVec = new THREE.Vector3();

function createLungPleuraTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Organic soft pleural rose-coral base gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#e38a98');
  grad.addColorStop(0.5, '#d67485');
  grad.addColorStop(1, '#c36175');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle lobular polygons
  ctx.strokeStyle = 'rgba(136, 38, 60, 0.22)';
  ctx.lineWidth = 1.5;
  for (let y = 0; y < 512; y += 32) {
    for (let x = 0; x < 512; x += 32) {
      const ox = ((y / 32) % 2) * 16;
      ctx.beginPath();
      ctx.moveTo(x + ox, y + 6);
      ctx.lineTo(x + ox + 14, y);
      ctx.lineTo(x + ox + 28, y + 8);
      ctx.lineTo(x + ox + 24, y + 24);
      ctx.lineTo(x + ox + 8, y + 28);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Fine capillary branches
  ctx.strokeStyle = 'rgba(190, 45, 75, 0.28)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 45; i++) {
    let px = (i * 97) % 512;
    let py = (i * 53) % 512;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let s = 0; s < 5; s++) {
      px += Math.sin(i + s * 1.4) * 18;
      py += Math.cos(i * 0.7 + s) * 16;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 126);
  grad.addColorStop(0, 'rgba(2, 6, 23, 0.72)');
  grad.addColorStop(0.5, 'rgba(2, 6, 23, 0.32)');
  grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPedestalGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#111c31';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
  ctx.lineWidth = 2;
  [100, 175, 240].forEach((r) => {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(a) * 60, 256 + Math.sin(a) * 60);
    ctx.lineTo(256 + Math.cos(a) * 245, 256 + Math.sin(a) * 245);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function tagOrgan(obj: THREE.Object3D, organId: OrganId, clickables: THREE.Object3D[]) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.userData.organId = organId;
      clickables.push(child);
    }
  });
}

export default function RespiratoryScene3D({
  selectedOrgan,
  onSelectOrgan,
  xrayMode,
  breathMode,
  breathRate,
  autoRotate = false,
}: RespiratoryScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Live props refs so WebGL loop never tears down on UI updates
  const propsRef = useRef({
    selectedOrgan,
    onSelectOrgan,
    xrayMode,
    breathMode,
    breathRate,
    autoRotate,
  });
  propsRef.current = {
    selectedOrgan,
    onSelectOrgan,
    xrayMode,
    breathMode,
    breathRate,
    autoRotate,
  };

  // Trigger camera transition whenever selectedOrgan prop changes
  const camTransitionRef = useRef<{ active: boolean; organ: OrganId }>({
    active: true,
    organ: selectedOrgan,
  });

  useEffect(() => {
    camTransitionRef.current = { active: true, organ: selectedOrgan };
  }, [selectedOrgan]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL (SwiftShader/llvmpipe/WARP)
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1220);
    scene.fog = new THREE.FogExp2(0x0b1220, 0.032);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 7.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    // 3-Point Studio Lighting (Warm Key + Cool Hemisphere Fill + Rim Light)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1e6, 1.9);
    keyLight.position.set(4.5, 6.5, 5.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4.5;
    keyLight.shadow.camera.bottom = -4.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.95);
    rimLight.position.set(-4.5, 3.0, -4.5);
    scene.add(rimLight);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.1;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI * 0.72;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.target.set(0, 0.2, 0);

    controls.addEventListener('start', () => {
      camTransitionRef.current.active = false;
    });

    // Clickable meshes registry
    const clickables: THREE.Object3D[] = [];
    const highlightables = new Map<OrganId, THREE.MeshStandardMaterial[]>();
    const registerMat = (id: OrganId, mat: THREE.MeshStandardMaterial) => {
      const arr = highlightables.get(id) ?? [];
      arr.push(mat);
      highlightables.set(id, arr);
    };

    // Disposables registry
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const pleuraTex = createLungPleuraTexture();
    pleuraTex.anisotropy = maxAniso;
    const shadowTex = createContactShadowTexture();
    const pedestalTex = createPedestalGridTexture();
    pedestalTex.anisotropy = maxAniso;
    textures.push(pleuraTex, shadowTex, pedestalTex);

    // Studio Pedestal & Grounding Contact Shadow
    const studioGroup = new THREE.Group();
    const pedestalGeo = new THREE.CylinderGeometry(2.65, 2.85, 0.16, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      map: pedestalTex,
      roughness: 0.42,
      metalness: 0.45,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.set(0, -2.05, 0);
    pedestalMesh.receiveShadow = true;
    studioGroup.add(pedestalMesh);

    const rimRingGeo = new THREE.TorusGeometry(2.68, 0.028, 12, 64);
    const rimRingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.85,
    });
    const rimRing = new THREE.Mesh(rimRingGeo, rimRingMat);
    rimRing.rotation.x = Math.PI / 2;
    rimRing.position.set(0, -1.96, 0);
    studioGroup.add(rimRing);

    const shadowPlaneGeo = new THREE.PlaneGeometry(4.4, 4.4);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -1.94, 0);
    studioGroup.add(shadowPlane);
    scene.add(studioGroup);
    geometries.push(pedestalGeo, rimRingGeo, shadowPlaneGeo);
    materials.push(pedestalMat, rimRingMat, shadowPlaneMat);

    // Main Respiratory Assembly Group
    const anatomyRoot = new THREE.Group();
    scene.add(anatomyRoot);

    // 1. NASAL CAVITY & PHARYNX (Composite 5-part Group)
    const nasalGroup = new THREE.Group();
    const nasalMat = new THREE.MeshStandardMaterial({
      color: 0xf4a29e,
      roughness: 0.55,
      metalness: 0.05,
    });
    const nasalInnerMat = new THREE.MeshStandardMaterial({
      color: 0xe17078,
      roughness: 0.42,
      metalness: 0.08,
    });
    registerMat('nasal', nasalMat);
    registerMat('nasal', nasalInnerMat);

    const nasalChamberGeo = new THREE.CapsuleGeometry(0.28, 0.36, 10, 18);
    const nasalChamber = new THREE.Mesh(nasalChamberGeo, nasalMat);
    nasalChamber.position.set(0, 2.86, 0.34);
    nasalChamber.rotation.x = Math.PI * 0.44;
    nasalGroup.add(nasalChamber);

    // Conchae ridges (3 shelves)
    const conchaGeo = new THREE.BoxGeometry(0.18, 0.045, 0.26);
    for (let i = 0; i < 3; i++) {
      const concha = new THREE.Mesh(conchaGeo, nasalInnerMat);
      concha.position.set(0, 2.79 + i * 0.075, 0.32);
      nasalGroup.add(concha);
    }

    // Pharynx curved tube descending from nasopharynx to larynx
    const pharynxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.88, 0.16),
      new THREE.Vector3(0, 2.75, -0.02),
      new THREE.Vector3(0, 2.38, -0.05),
      new THREE.Vector3(0, 2.1, 0),
    ]);
    const pharynxGeo = new THREE.TubeGeometry(pharynxCurve, 20, 0.17, 14, false);
    const pharynxMesh = new THREE.Mesh(pharynxGeo, nasalInnerMat);
    nasalGroup.add(pharynxMesh);

    // Nostril rim accent
    const nostrilGeo = new THREE.TorusGeometry(0.14, 0.04, 10, 20);
    const nostrilMesh = new THREE.Mesh(nostrilGeo, nasalMat);
    nostrilMesh.position.set(0, 2.75, 0.58);
    nostrilMesh.rotation.x = Math.PI * 0.35;
    nasalGroup.add(nostrilMesh);

    tagOrgan(nasalGroup, 'nasal', clickables);
    anatomyRoot.add(nasalGroup);
    geometries.push(nasalChamberGeo, conchaGeo, pharynxGeo, nostrilGeo);
    materials.push(nasalMat, nasalInnerMat);

    // 2. LARYNX (Composite 5-part Group: Thyroid shield, Cricoid ring, Epiglottis, Vocal Folds)
    const larynxGroup = new THREE.Group();
    const cartilageMat = new THREE.MeshStandardMaterial({
      color: 0xdce7f5,
      roughness: 0.32,
      metalness: 0.12,
    });
    const vocalMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xca8a04,
      emissiveIntensity: 0.35,
      roughness: 0.28,
      metalness: 0.1,
    });
    registerMat('larynx', cartilageMat);
    registerMat('larynx', vocalMat);

    const thyroidGeo = new THREE.CylinderGeometry(0.22, 0.2, 0.28, 16);
    const thyroid = new THREE.Mesh(thyroidGeo, cartilageMat);
    thyroid.position.set(0, 1.92, 0.04);
    thyroid.scale.set(1.05, 1, 0.9);
    larynxGroup.add(thyroid);

    // Adam's apple ridge
    const notchGeo = new THREE.ConeGeometry(0.1, 0.22, 8);
    const notch = new THREE.Mesh(notchGeo, cartilageMat);
    notch.position.set(0, 1.95, 0.19);
    notch.rotation.x = Math.PI * 0.2;
    larynxGroup.add(notch);

    const cricoidGeo = new THREE.TorusGeometry(0.19, 0.042, 10, 24);
    const cricoid = new THREE.Mesh(cricoidGeo, cartilageMat);
    cricoid.position.set(0, 1.72, 0.01);
    cricoid.rotation.x = Math.PI / 2;
    larynxGroup.add(cricoid);

    const epiglottisGeo = new THREE.BoxGeometry(0.18, 0.18, 0.04);
    const epiglottis = new THREE.Mesh(epiglottisGeo, nasalInnerMat);
    epiglottis.position.set(0, 2.09, 0.07);
    epiglottis.rotation.x = -0.38;
    larynxGroup.add(epiglottis);

    const vocalFoldGeo = new THREE.BoxGeometry(0.22, 0.035, 0.06);
    const vocalFold = new THREE.Mesh(vocalFoldGeo, vocalMat);
    vocalFold.position.set(0, 1.91, 0.02);
    larynxGroup.add(vocalFold);

    tagOrgan(larynxGroup, 'larynx', clickables);
    anatomyRoot.add(larynxGroup);
    geometries.push(thyroidGeo, notchGeo, cricoidGeo, epiglottisGeo, vocalFoldGeo);
    materials.push(cartilageMat, vocalMat);

    // 3. TRACHEA (Airway Tube + InstancedMesh 12 Hyaline C-Rings)
    const tracheaGroup = new THREE.Group();
    const tracheaTubeMat = new THREE.MeshStandardMaterial({
      color: 0xe9969a,
      roughness: 0.48,
      metalness: 0.06,
    });
    const tracheaRingMat = new THREE.MeshStandardMaterial({
      color: 0xe2ecf7,
      roughness: 0.28,
      metalness: 0.16,
    });
    registerMat('trachea', tracheaTubeMat);
    registerMat('trachea', tracheaRingMat);

    const tracheaGeo = new THREE.CylinderGeometry(0.16, 0.16, 1.15, 20);
    const tracheaTube = new THREE.Mesh(tracheaGeo, tracheaTubeMat);
    tracheaTube.position.set(0, 1.12, 0);
    tracheaTube.castShadow = true;
    tracheaGroup.add(tracheaTube);

    const ringGeo = new THREE.TorusGeometry(0.175, 0.024, 8, 24, Math.PI * 1.65);
    const ringCount = 12;
    const ringsInstanced = new THREE.InstancedMesh(ringGeo, tracheaRingMat, ringCount);
    for (let i = 0; i < ringCount; i++) {
      _dummy.position.set(0, 1.62 - i * 0.088, 0);
      _dummy.rotation.set(Math.PI / 2, 0, Math.PI * 0.68);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      ringsInstanced.setMatrixAt(i, _dummy.matrix);
    }
    ringsInstanced.instanceMatrix.needsUpdate = true;
    ringsInstanced.computeBoundingSphere();
    tracheaGroup.add(ringsInstanced);

    tagOrgan(tracheaGroup, 'trachea', clickables);
    anatomyRoot.add(tracheaGroup);
    geometries.push(tracheaGeo, ringGeo);
    materials.push(tracheaTubeMat, tracheaRingMat);

    // 4. BRONCHI & BRONCHIAL TREE (Composite branching TubeGeometry)
    const bronchiGroup = new THREE.Group();
    const bronchiMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.28,
      roughness: 0.35,
      metalness: 0.18,
    });
    registerMat('bronchi', bronchiMat);

    const branchDefs: { pts: [number, number, number][]; r: number }[] = [
      // Right main & lobar bronchi (viewer left = patient right = -X)
      { pts: [[0, 0.58, 0], [-0.36, 0.36, 0.02], [-0.72, 0.2, 0.04]], r: 0.11 },
      { pts: [[-0.54, 0.28, 0.03], [-0.88, 0.68, 0.05], [-1.05, 0.92, 0.02]], r: 0.065 },
      { pts: [[-0.65, 0.24, 0.04], [-1.05, 0.1, 0.12], [-1.25, -0.05, 0.14]], r: 0.06 },
      { pts: [[-0.72, 0.2, 0.04], [-0.95, -0.25, -0.02], [-1.15, -0.62, -0.04]], r: 0.065 },
      { pts: [[-0.95, -0.25, -0.02], [-0.72, -0.58, 0.12]], r: 0.045 },
      // Left main & lobar bronchi (+X = patient left)
      { pts: [[0, 0.58, 0], [0.42, 0.34, 0.02], [0.82, 0.18, 0.04]], r: 0.105 },
      { pts: [[0.62, 0.25, 0.03], [0.95, 0.65, 0.04], [1.1, 0.88, 0.0]], r: 0.062 },
      { pts: [[0.82, 0.18, 0.04], [1.14, -0.15, 0.08], [1.26, -0.55, 0.02]], r: 0.062 },
      { pts: [[1.02, -0.02, 0.06], [0.85, -0.45, -0.08]], r: 0.045 },
    ];

    branchDefs.forEach((b) => {
      const curve = new THREE.CatmullRomCurve3(b.pts.map((p) => new THREE.Vector3(...p)));
      const geo = new THREE.TubeGeometry(curve, 16, b.r, 10, false);
      const mesh = new THREE.Mesh(geo, bronchiMat);
      mesh.renderOrder = 2;
      bronchiGroup.add(mesh);
      geometries.push(geo);
    });

    tagOrgan(bronchiGroup, 'bronchi', clickables);
    anatomyRoot.add(bronchiGroup);
    materials.push(bronchiMat);

    // 5. LUNGS (Right 3 Lobes & Left 2 Lobes with Procedural Pleura Texture + X-Ray translucency)
    const lungsGroup = new THREE.Group();
    const lungMat = new THREE.MeshPhysicalMaterial({
      map: pleuraTex,
      color: 0xf4a5b2,
      roughness: 0.44,
      metalness: 0.04,
      clearcoat: 0.35,
      clearcoatRoughness: 0.28,
      transparent: true,
      opacity: 0.96,
      depthWrite: true,
    });
    const fissureMat = new THREE.MeshStandardMaterial({
      color: 0x9f3a51,
      roughness: 0.65,
      metalness: 0.05,
    });
    registerMat('lungs', lungMat);

    const buildLobe = (
      rx: number,
      ry: number,
      rz: number,
      px: number,
      py: number,
      pz: number,
      rotZ = 0
    ) => {
      const geo = new THREE.SphereGeometry(1, 28, 22);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) * rx;
        let y = pos.getY(i) * ry;
        let z = pos.getZ(i) * rz;
        // Taper top apex & flatten medial/diaphragmatic side
        const t = (y / ry + 1) * 0.5; // 0 bottom -> 1 top
        const taper = 1.12 - t * 0.42;
        x *= taper;
        z *= taper;
        if (y < -ry * 0.55) {
          y = -ry * 0.55 + (y + ry * 0.55) * 0.35;
        }
        pos.setXYZ(i, x, y, z);
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, lungMat);
      mesh.position.set(px, py, pz);
      mesh.rotation.z = rotZ;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.renderOrder = 4;
      geometries.push(geo);
      return mesh;
    };

    // Right Lung (-X side, 3 lobes: superior, middle, inferior)
    const rightLungGroup = new THREE.Group();
    rightLungGroup.add(buildLobe(0.56, 0.68, 0.58, -0.96, 0.72, 0, -0.14));
    rightLungGroup.add(buildLobe(0.62, 0.5, 0.64, -1.04, 0.04, 0.08, -0.06));
    rightLungGroup.add(buildLobe(0.68, 0.62, 0.68, -1.06, -0.52, -0.05, 0.04));

    // Left Lung (+X side, 2 lobes + subtle cardiac notch)
    const leftLungGroup = new THREE.Group();
    leftLungGroup.add(buildLobe(0.54, 0.72, 0.58, 0.96, 0.66, 0.02, 0.14));
    leftLungGroup.add(buildLobe(0.64, 0.68, 0.66, 1.08, -0.35, -0.02, -0.05));

    // Cardiac highlight hint in notch (subtle anatomical heart silhouette)
    const heartGeo = new THREE.SphereGeometry(0.32, 18, 16);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      roughness: 0.45,
      metalness: 0.08,
      transparent: true,
      opacity: 0.78,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.set(0.32, -0.22, 0.18);
    heartMesh.scale.set(0.95, 1.25, 0.85);
    heartMesh.rotation.z = -0.32;
    lungsGroup.add(heartMesh);

    lungsGroup.add(rightLungGroup, leftLungGroup);
    tagOrgan(rightLungGroup, 'lungs', clickables);
    tagOrgan(leftLungGroup, 'lungs', clickables);
    anatomyRoot.add(lungsGroup);
    geometries.push(heartGeo);
    materials.push(lungMat, fissureMat, heartMat);

    // 6. ALVEOLI CLUSTER & O2/CO2 GAS EXCHANGE PARTICLES
    const alveoliGroup = new THREE.Group();
    const alveolusMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.42,
      roughness: 0.25,
      metalness: 0.15,
    });
    registerMat('alveoli', alveolusMat);

    const sacGeo = new THREE.SphereGeometry(0.085, 12, 10);
    const sacOffsets: [number, number, number][] = [
      [-1.08, -0.1, 0.16],
      [-1.18, -0.18, 0.12],
      [-0.98, -0.2, 0.22],
      [-1.12, -0.26, 0.2],
      [-1.04, -0.04, 0.08],
      [-1.22, -0.08, 0.22],
      [1.14, -0.45, 0.1],
      [1.24, -0.52, 0.04],
      [1.06, -0.56, 0.14],
    ];
    sacOffsets.forEach(([x, y, z]) => {
      const m = new THREE.Mesh(sacGeo, alveolusMat);
      m.position.set(x, y, z);
      m.renderOrder = 3;
      alveoliGroup.add(m);
    });
    tagOrgan(alveoliGroup, 'alveoli', clickables);
    anatomyRoot.add(alveoliGroup);
    geometries.push(sacGeo);
    materials.push(alveolusMat);

    // O2 & CO2 Gas Particles (InstancedMesh)
    const particleGeo = new THREE.SphereGeometry(0.032, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const particleCount = 36;
    const gasParticles = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
    const o2Color = new THREE.Color(0x38bdf8);
    const co2Color = new THREE.Color(0xfb7185);
    for (let i = 0; i < particleCount; i++) {
      gasParticles.setColorAt(i, i % 2 === 0 ? o2Color : co2Color);
    }
    if (gasParticles.instanceColor) gasParticles.instanceColor.needsUpdate = true;
    gasParticles.frustumCulled = false;
    anatomyRoot.add(gasParticles);
    geometries.push(particleGeo);
    materials.push(particleMat);

    // 7. DIAPHRAGM (Composite Dome Muscle + Central Tendon)
    const diaphragmGroup = new THREE.Group();
    const diaphragmMat = new THREE.MeshStandardMaterial({
      color: 0xc2415c,
      roughness: 0.52,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });
    const tendonMat = new THREE.MeshStandardMaterial({
      color: 0xf1d4da,
      roughness: 0.35,
      metalness: 0.12,
    });
    registerMat('diaphragm', diaphragmMat);
    registerMat('diaphragm', tendonMat);

    const domeGeo = new THREE.SphereGeometry(1.78, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42);
    const domeMesh = new THREE.Mesh(domeGeo, diaphragmMat);
    domeMesh.position.set(0, -1.85, 0);
    domeMesh.scale.set(1.02, 0.52, 0.52);
    domeMesh.receiveShadow = true;
    diaphragmGroup.add(domeMesh);

    const tendonGeo = new THREE.CylinderGeometry(0.55, 0.62, 0.06, 20);
    const tendonMesh = new THREE.Mesh(tendonGeo, tendonMat);
    tendonMesh.position.set(0, -0.96, 0.02);
    tendonMesh.scale.set(1.15, 1, 0.65);
    diaphragmGroup.add(tendonMesh);

    tagOrgan(diaphragmGroup, 'diaphragm', clickables);
    anatomyRoot.add(diaphragmGroup);
    geometries.push(domeGeo, tendonGeo);
    materials.push(diaphragmMat, tendonMat);

    // Pre-warm shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting for hover & click
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoveredOrgan: OrganId | null = null;
    let lastHoverTime = 0;
    let pointerDownPos = { x: 0, y: 0 };

    const updatePointer = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (ev: PointerEvent) => {
      pointerDownPos = { x: ev.clientX, y: ev.clientY };
    };

    const onPointerUp = (ev: PointerEvent) => {
      const dist = Math.hypot(ev.clientX - pointerDownPos.x, ev.clientY - pointerDownPos.y);
      if (dist > 6) return; // Was dragging OrbitControls
      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickables, false);
      if (hits.length > 0) {
        const hitOrgan = hits[0].object.userData.organId as OrganId | undefined;
        if (hitOrgan) {
          propsRef.current.onSelectOrgan(hitOrgan);
        }
      }
    };

    const onPointerMove = (ev: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 65) return;
      lastHoverTime = now;
      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickables, false);
      const hitOrgan = hits.length > 0 ? (hits[0].object.userData.organId as OrganId) : null;
      hoveredOrgan = hitOrgan;
      renderer.domElement.style.cursor = hitOrgan ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    // Ikuti perubahan ukuran wadah (rotasi layar HP, panel dibuka/ditutup)
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(container);
    }

    // Animation loop state
    let frameId = 0;
    let disposed = false;
    let breathPhase = 0;
    let currentExpansion = 0.5;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const {
        selectedOrgan: sel,
        xrayMode: xray,
        breathMode: bMode,
        breathRate: bRate,
        autoRotate: rot,
      } = propsRef.current;

      // 1. Breathing Kinematics (Diaphragm + Lung Expansion)
      const speedMult = bRate === 'olahraga' ? 2.4 : 1.15;
      let targetExpansion = 0.5;
      if (bMode === 'auto') {
        breathPhase += dt * speedMult * Math.PI * 0.72;
        targetExpansion = 0.5 + 0.5 * Math.sin(breathPhase);
      } else if (bMode === 'inspirasi') {
        targetExpansion = 1.0;
      } else {
        targetExpansion = 0.0;
      }
      currentExpansion = THREE.MathUtils.damp(currentExpansion, targetExpansion, 5.5, dt);

      const lungScaleXZ = 0.94 + currentExpansion * 0.12;
      const lungScaleY = 0.95 + currentExpansion * 0.09;
      rightLungGroup.scale.set(lungScaleXZ, lungScaleY, lungScaleXZ);
      leftLungGroup.scale.set(lungScaleXZ, lungScaleY, lungScaleXZ);

      // Diaphragm contracts DOWNWARD (flattens) during inspiration (expansion -> 1)
      const diaOffsetY = -currentExpansion * 0.24;
      const diaDomeScaleY = 1.08 - currentExpansion * 0.34;
      diaphragmGroup.position.y = diaOffsetY;
      domeMesh.scale.set(1.02 + currentExpansion * 0.06, 0.52 * diaDomeScaleY, 0.52);

      // Gentle heartbeat pulse on cardiac silhouette
      const heartPulse = 1 + Math.pow(Math.max(0, Math.sin(now * 0.0048)), 6) * 0.065;
      heartMesh.scale.set(0.95 * heartPulse, 1.25 * heartPulse, 0.85 * heartPulse);

      // 2. X-Ray Mode Material Transition
      const targetOpacity = xray ? 0.22 : 0.96;
      lungMat.opacity = THREE.MathUtils.damp(lungMat.opacity, targetOpacity, 7, dt);
      lungMat.depthWrite = lungMat.opacity > 0.7;

      // 3. Organ Selection / Hover Highlight
      highlightables.forEach((mats, organId) => {
        const isSelected = sel === organId;
        const isHovered = hoveredOrgan === organId;
        const targetGlow = isSelected ? 0.35 : isHovered ? 0.18 : 0.0;
        mats.forEach((m) => {
          if (organId === 'alveoli' || organId === 'bronchi') {
            m.emissiveIntensity = THREE.MathUtils.damp(
              m.emissiveIntensity,
              0.28 + targetGlow * 1.4,
              8,
              dt
            );
          } else {
            m.emissive.setHex(isSelected ? 0x0284c7 : isHovered ? 0x38bdf8 : 0x000000);
            m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, targetGlow, 8, dt);
          }
        });
      });

      // 4. O2 / CO2 Gas Particle Flow along airway -> alveoli
      const tSec = now * 0.001;
      for (let i = 0; i < particleCount; i++) {
        const isO2 = i % 2 === 0;
        const pPhase = ((tSec * (bRate === 'olahraga' ? 0.55 : 0.32) + i / particleCount) % 1);
        const u = isO2 ? pPhase : 1 - pPhase;
        const side = i % 4 < 2 ? -1 : 1;

        if (u < 0.32) {
          // Nasal -> Trachea
          const k = u / 0.32;
          _tmpVec.set(
            Math.sin(i * 2.1 + u * 8) * 0.05,
            THREE.MathUtils.lerp(2.75, 0.65, k),
            THREE.MathUtils.lerp(0.32, 0.02, k)
          );
        } else if (u < 0.68) {
          // Bronchi split
          const k = (u - 0.32) / 0.36;
          _tmpVec.set(
            THREE.MathUtils.lerp(0, side * 1.08, k),
            THREE.MathUtils.lerp(0.58, -0.18, k),
            THREE.MathUtils.lerp(0.02, 0.15, k)
          );
        } else {
          // Alveoli swirl
          const k = (u - 0.68) / 0.32;
          const angle = k * Math.PI * 2 + i;
          _tmpVec.set(
            side * 1.08 + Math.cos(angle) * 0.18,
            -0.18 + Math.sin(angle) * 0.18,
            0.15 + Math.sin(angle * 1.5) * 0.1
          );
        }
        const s = 0.85 + Math.sin(tSec * 4 + i) * 0.25;
        _dummy.position.copy(_tmpVec);
        _dummy.scale.setScalar(s);
        _dummy.updateMatrix();
        gasParticles.setMatrixAt(i, _dummy.matrix);
      }
      gasParticles.instanceMatrix.needsUpdate = true;

      // 5. Damped Camera Preset Transition
      if (camTransitionRef.current.active) {
        const detail = ORGAN_DETAILS[camTransitionRef.current.organ];
        _camTargetPos.set(...detail.cameraPos);
        _camTargetLook.set(...detail.cameraTarget);
        // Layar potret (HP): mundurkan kamera agar organ tidak terpotong di sisi kiri-kanan
        const fit = camera.aspect < 1.2 ? Math.min(2.2, 1.2 / camera.aspect) : 1;
        if (fit !== 1) {
          _camTargetPos.sub(_camTargetLook).multiplyScalar(fit).add(_camTargetLook);
        }

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _camTargetPos.x, 4.5, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _camTargetPos.y, 4.5, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _camTargetPos.z, 4.5, dt);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _camTargetLook.x, 4.5, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _camTargetLook.y, 4.5, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _camTargetLook.z, 4.5, dt);

        if (
          camera.position.distanceTo(_camTargetPos) < 0.03 &&
          controls.target.distanceTo(_camTargetLook) < 0.03
        ) {
          camTransitionRef.current.active = false;
        }
      }

      if (rot && !camTransitionRef.current.active) {
        anatomyRoot.rotation.y += dt * 0.22;
      } else {
        anatomyRoot.rotation.y = THREE.MathUtils.damp(anatomyRoot.rotation.y, 0, 5, dt);
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full relative select-none touch-none overflow-hidden" />;
}
