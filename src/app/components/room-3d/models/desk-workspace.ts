import * as THREE from 'three';

export class DeskWorkspace {
  private scene: THREE.Scene;
  private deskGroup: THREE.Group;
  private laptopScreen!: THREE.Mesh;
  private hologramDisplay!: THREE.Mesh;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.deskGroup = new THREE.Group();
  }
  
  create(): void {
    // Desk surface
    const deskGeometry = new THREE.BoxGeometry(6, 0.1, 3);
    const deskMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b6f47,  // Changed to wood brown color
      roughness: 0.6,
      metalness: 0.1    // Reduced metalness for wood appearance
    });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.y = 1.5;
    desk.castShadow = true;
    desk.receiveShadow = true;
    this.deskGroup.add(desk);
    
    // Desk legs
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x34495e,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const legPositions = [
      { x: -2.8, z: -1.3 },
      { x: 2.8, z: -1.3 },
      { x: -2.8, z: 1.3 },
      { x: 2.8, z: 1.3 }
    ];
    
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos.x, 0.75, pos.z);
      leg.castShadow = true;
      this.deskGroup.add(leg);
    });
    
    // Laptop
    this.createLaptop();
    
    // Holographic displays
    this.createHologramDisplays();
    
    // Desk accessories
    this.addDeskAccessories();
    
    // Position desk in room
    this.deskGroup.position.set(0, 0, 0);
    this.scene.add(this.deskGroup);
  }
  
  private createLaptop(): void {
    const laptopGroup = new THREE.Group();
    
    // Laptop base
    const baseGeometry = new THREE.BoxGeometry(1.5, 0.05, 1);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    laptopGroup.add(base);
    
    // Keyboard area
    const keyboardGeometry = new THREE.PlaneGeometry(1.3, 0.8);
    const keyboardMaterial = new THREE.MeshBasicMaterial({
      color: 0x0a0a0a
    });
    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
    keyboard.rotation.x = -Math.PI / 2;
    keyboard.position.y = 0.03;
    laptopGroup.add(keyboard);
    
    // Screen
    const screenGeometry = new THREE.BoxGeometry(1.5, 1, 0.02);
    const screenFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2
    });
    const screenFrame = new THREE.Mesh(screenGeometry, screenFrameMaterial);
    screenFrame.position.set(0, 0.5, -0.48);
    screenFrame.rotation.x = -Math.PI / 12;
    screenFrame.castShadow = true;
    laptopGroup.add(screenFrame);
    
    // Screen display
    const displayGeometry = new THREE.PlaneGeometry(1.4, 0.9);
    const displayCanvas = this.createLaptopDisplay();
    const displayTexture = new THREE.CanvasTexture(displayCanvas);
    const displayMaterial = new THREE.MeshStandardMaterial({
      map: displayTexture,
      emissive: 0x0072ff,
      emissiveIntensity: 0.2
    });
    this.laptopScreen = new THREE.Mesh(displayGeometry, displayMaterial);
    this.laptopScreen.position.set(0, 0.5, -0.47);
    this.laptopScreen.rotation.x = -Math.PI / 12;
    laptopGroup.add(this.laptopScreen);
    
    // Position laptop on desk
    laptopGroup.position.set(0, 1.56, 0);
    this.deskGroup.add(laptopGroup);
  }
  
  private createLaptopDisplay(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;
    
    // Background - brighter gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a3e');
    gradient.addColorStop(1, '#2a2a5e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Window frame
    ctx.fillStyle = '#2a2a4e';
    ctx.fillRect(0, 0, canvas.width, 40);
    
    // Title bar
    ctx.fillStyle = '#00c6ff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('UWHub Task Manager v3.0 - Active Tasks', 20, 27);
    
    // Task cards with better visibility
    const tasks = [
      { name: 'MUJI Hong Kong - General Liability', status: 'PENDING', color: '#ffa502', y: 80 },
      { name: 'Knight-Swift Transportation - Sanctions', status: 'IN PROGRESS', color: '#05c46b', y: 200 },
      { name: 'Disney Company - Renewal Quote', status: 'URGENT', color: '#ff4757', y: 320 },
      { name: 'Amazon Hong Kong - D&O Review', status: 'PENDING', color: '#ffa502', y: 440 },
      { name: 'Staples - Workers Compensation', status: 'REVIEW', color: '#00c6ff', y: 560 }
    ];
    
    tasks.forEach(task => {
      // Card background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(20, task.y - 20, canvas.width - 40, 90);
      
      // Card border
      ctx.strokeStyle = task.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(20, task.y - 20, canvas.width - 40, 90);
      
      // Task name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(task.name, 40, task.y + 10);
      
      // Task details
      ctx.font = '14px Arial';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('Premium: $12,500 | Due: 2 days', 40, task.y + 35);
      
      // Status badge
      ctx.fillStyle = task.color;
      ctx.fillRect(canvas.width - 180, task.y - 5, 140, 30);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(task.status, canvas.width - 110, task.y + 12);
      ctx.textAlign = 'left';
    });
    
    // Bottom status bar
    ctx.fillStyle = '#2a2a4e';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = '#00c6ff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('✓ Connected to UWHub Server | 23 Active Tasks | Last sync: Just now', 20, canvas.height - 15);
    
    return canvas;
  }
  
  private createHologramDisplays(): void {
    // Left hologram display
    const hologram1 = this.createHologramPanel(-2, 2.5, 0);
    this.deskGroup.add(hologram1);
    
    // Right hologram display
    const hologram2 = this.createHologramPanel(2, 2.5, 0);
    this.deskGroup.add(hologram2);
    
    // Center floating display
    const floatingDisplay = this.createFloatingDataDisplay();
    floatingDisplay.position.set(0, 3, -0.5);
    this.deskGroup.add(floatingDisplay);
  }
  
  private createHologramPanel(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    
    // Hologram base projector
    const projectorGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.1);
    const projectorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0072ff,
      emissive: 0x0072ff,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1
    });
    const projector = new THREE.Mesh(projectorGeometry, projectorMaterial);
    projector.position.y = -1;
    group.add(projector);
    
    // Hologram screen
    const screenGeometry = new THREE.PlaneGeometry(1.5, 2);
    const screenMaterial = new THREE.MeshBasicMaterial({
      color: 0x00c6ff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.hologramDisplay = new THREE.Mesh(screenGeometry, screenMaterial);
    group.add(this.hologramDisplay);
    
    // Add hologram content
    const contentCanvas = this.createHologramContent();
    const contentTexture = new THREE.CanvasTexture(contentCanvas);
    const contentMaterial = new THREE.MeshBasicMaterial({
      map: contentTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const content = new THREE.Mesh(screenGeometry, contentMaterial);
    content.position.z = 0.01;
    group.add(content);
    
    group.position.set(x, y, z);
    return group;
  }
  
  private createHologramContent(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw holographic UI elements
    ctx.strokeStyle = '#00c6ff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    
    // Draw chart
    ctx.beginPath();
    ctx.moveTo(50, 400);
    ctx.lineTo(100, 350);
    ctx.lineTo(150, 380);
    ctx.lineTo(200, 320);
    ctx.lineTo(250, 340);
    ctx.lineTo(300, 280);
    ctx.lineTo(350, 300);
    ctx.lineTo(400, 250);
    ctx.stroke();
    
    // Draw grid
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(50, 200 + i * 30);
      ctx.lineTo(450, 200 + i * 30);
      ctx.stroke();
    }
    
    // Add text
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#00c6ff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PORTFOLIO ANALYTICS', 256, 100);
    
    ctx.font = '18px Arial';
    ctx.fillText('58% Bound Rate', 256, 150);
    ctx.fillText('$2.4M YTD', 256, 180);
    
    return canvas;
  }
  
  private createFloatingDataDisplay(): THREE.Group {
    const group = new THREE.Group();
    
    // Create floating rings
    const ringGeometry = new THREE.TorusGeometry(0.5, 0.02, 8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00c6ff,
      transparent: true,
      opacity: 0.6
    });
    
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.y = i * 0.3;
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      group.add(ring);
    }
    
    // Central data sphere
    const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x0072ff,
      transparent: true,
      opacity: 0.8,
      wireframe: true
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(sphere);
    
    return group;
  }
  
  private addDeskAccessories(): void {
    // Coffee mug
    const mugGroup = new THREE.Group();
    const mugGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.25);
    const mugMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1
    });
    const mug = new THREE.Mesh(mugGeometry, mugMaterial);
    mug.castShadow = true;
    mugGroup.add(mug);
    
    // Mug handle
    const handleGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
    const handle = new THREE.Mesh(handleGeometry, mugMaterial);
    handle.position.set(0.15, 0, 0);
    handle.rotation.z = -Math.PI / 2;
    mugGroup.add(handle);
    
    mugGroup.position.set(1.5, 1.68, 0.8);
    this.deskGroup.add(mugGroup);
    
    // Desk lamp
    const lampGroup = new THREE.Group();
    
    // Lamp base
    const lampBaseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05);
    const lampMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      metalness: 0.7,
      roughness: 0.3
    });
    const lampBase = new THREE.Mesh(lampBaseGeometry, lampMaterial);
    lampGroup.add(lampBase);
    
    // Lamp arm
    const lampArmGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1);
    const lampArm = new THREE.Mesh(lampArmGeometry, lampMaterial);
    lampArm.position.y = 0.5;
    lampArm.rotation.z = Math.PI / 6;
    lampGroup.add(lampArm);
    
    // Lamp head
    const lampHeadGeometry = new THREE.ConeGeometry(0.15, 0.2, 8);
    const lampHead = new THREE.Mesh(lampHeadGeometry, lampMaterial);
    lampHead.position.set(-0.25, 0.95, 0);
    lampHead.rotation.z = Math.PI / 3;
    lampGroup.add(lampHead);
    
    // Lamp light
    const lampLight = new THREE.SpotLight(0xffffff, 0.5, 3, Math.PI / 6);
    lampLight.position.set(-0.25, 0.95, 0);
    lampLight.target.position.set(-0.5, 1.5, 0);
    lampGroup.add(lampLight);
    lampGroup.add(lampLight.target);
    
    lampGroup.position.set(-2, 1.55, -0.5);
    this.deskGroup.add(lampGroup);
  }
  
  update(): void {
    // Animate hologram displays
    if (this.hologramDisplay) {
      this.hologramDisplay.rotation.y += 0.005;
    }
  }
}