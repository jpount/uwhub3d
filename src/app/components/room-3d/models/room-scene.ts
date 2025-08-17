import * as THREE from 'three';

export class RoomScene {
  private scene: THREE.Scene;
  private roomGroup: THREE.Group;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.roomGroup = new THREE.Group();
  }
  
  create(): void {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.3,
      metalness: 0.8,
      envMapIntensity: 0.5
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.roomGroup.add(floor);
    
    // Add grid pattern to floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x00c6ff, 0x0072ff);
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    this.roomGroup.add(gridHelper);
    
    // Walls
    this.createWalls();
    
    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(20, 20);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f0f23,
      roughness: 0.9
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 8;
    this.roomGroup.add(ceiling);
    
    // Windows with city view
    this.createWindows();
    
    // Add decorative elements
    this.addDecorations();
    
    this.scene.add(this.roomGroup);
  }
  
  private createWalls(): void {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x16213e,
      roughness: 0.7,
      metalness: 0.1
    });
    
    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(20, 8);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 4, -10);
    backWall.receiveShadow = true;
    this.roomGroup.add(backWall);
    
    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(20, 8);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-10, 4, 0);
    leftWall.receiveShadow = true;
    this.roomGroup.add(leftWall);
    
    // Right wall
    const rightWallGeometry = new THREE.PlaneGeometry(20, 8);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(10, 4, 0);
    rightWall.receiveShadow = true;
    this.roomGroup.add(rightWall);
  }
  
  private createWindows(): void {
    // Window frame material
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      metalness: 0.8,
      roughness: 0.2
    });
    
    // Glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      metalness: 0,
      roughness: 0,
      transmission: 0.9,
      transparent: true,
      opacity: 0.3
    });
    
    // Left window
    const windowGroup1 = new THREE.Group();
    
    // Frame
    const frameGeometry = new THREE.BoxGeometry(4, 3, 0.1);
    const frame1 = new THREE.Mesh(frameGeometry, frameMaterial);
    windowGroup1.add(frame1);
    
    // Glass
    const glassGeometry = new THREE.PlaneGeometry(3.8, 2.8);
    const glass1 = new THREE.Mesh(glassGeometry, glassMaterial);
    glass1.position.z = 0.01;
    windowGroup1.add(glass1);
    
    windowGroup1.position.set(-9.95, 4, -3);
    windowGroup1.rotation.y = Math.PI / 2;
    this.roomGroup.add(windowGroup1);
    
    // Right window (clone)
    const windowGroup2 = windowGroup1.clone();
    windowGroup2.position.set(9.95, 4, -3);
    windowGroup2.rotation.y = -Math.PI / 2;
    this.roomGroup.add(windowGroup2);
    
    // Add city skyline silhouette
    this.createCitySkyline();
  }
  
  private createCitySkyline(): void {
    // Simple city skyline visible through windows
    const buildingMaterial = new THREE.MeshBasicMaterial({
      color: 0x0a0a0f,
      transparent: true,
      opacity: 0.8
    });
    
    // Create several building silhouettes
    for (let i = 0; i < 10; i++) {
      const height = 3 + Math.random() * 5;
      const width = 1 + Math.random() * 2;
      const buildingGeometry = new THREE.BoxGeometry(width, height, 2);
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      
      building.position.set(
        -15 + i * 3,
        height / 2,
        -15
      );
      
      this.roomGroup.add(building);
    }
  }
  
  private addDecorations(): void {
    // Add some futuristic light strips
    const lightStripGeometry = new THREE.BoxGeometry(0.1, 0.05, 10);
    const lightStripMaterial = new THREE.MeshStandardMaterial({
      color: 0x00c6ff,
      emissive: 0x00c6ff,
      emissiveIntensity: 2
    });
    
    // Ceiling light strips
    const strip1 = new THREE.Mesh(lightStripGeometry, lightStripMaterial);
    strip1.position.set(-5, 7.9, 0);
    this.roomGroup.add(strip1);
    
    const strip2 = new THREE.Mesh(lightStripGeometry, lightStripMaterial);
    strip2.position.set(5, 7.9, 0);
    this.roomGroup.add(strip2);
    
    // Corner pillars
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      metalness: 0.7,
      roughness: 0.3
    });
    
    const pillar1 = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar1.position.set(-9.5, 4, -9.5);
    pillar1.castShadow = true;
    this.roomGroup.add(pillar1);
    
    const pillar2 = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar2.position.set(9.5, 4, -9.5);
    pillar2.castShadow = true;
    this.roomGroup.add(pillar2);
    
    // Add floating particles for ambiance
    this.createFloatingParticles();
  }
  
  private createFloatingParticles(): void {
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = Math.random() * 8;
      positions[i + 2] = (Math.random() - 0.5) * 20;
      
      // Blue-ish colors
      colors[i] = 0;
      colors[i + 1] = 0.5 + Math.random() * 0.5;
      colors[i + 2] = 1;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.roomGroup.add(particles);
  }
  
  update(): void {
    // Animate floating particles if needed
  }
}