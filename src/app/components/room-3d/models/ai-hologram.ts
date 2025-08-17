import * as THREE from 'three';

export class AIHologram {
  private scene: THREE.Scene;
  private hologramGroup: THREE.Group;
  private avatar!: THREE.Mesh;
  private particles!: THREE.Points;
  private glowLight!: THREE.PointLight;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private animationTime: number = 0;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.hologramGroup = new THREE.Group();
  }
  
  create(): void {
    // Create hologram platform
    const platformGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x0072ff,
      emissive: 0x0072ff,
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.1
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.castShadow = true;
    this.hologramGroup.add(platform);
    
    // Create avatar body
    this.createAvatar();
    
    // Create particle system around avatar
    this.createParticleSystem();
    
    // Add glow light
    this.glowLight = new THREE.PointLight(0x00c6ff, 2, 5);
    this.glowLight.position.y = 2;
    this.hologramGroup.add(this.glowLight);
    
    // Create energy rings
    this.createEnergyRings();
    
    // Create data streams
    this.createDataStreams();
    
    // Add label above hologram
    this.createLabel();
    
    // Position hologram in room - smaller and more central
    this.hologramGroup.position.set(3, 0.5, 2);
    this.hologramGroup.scale.set(0.7, 0.7, 0.7);  // Make it smaller
    this.scene.add(this.hologramGroup);
  }
  
  private createLabel(): void {
    // Create a floating text label
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'rgba(0, 198, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(0, 114, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 198, 255, 0.8)');
    
    // Draw background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ARIA', canvas.width / 2, 80);
    
    ctx.font = '28px Arial';
    ctx.fillText('AI Assistant & Secretary', canvas.width / 2, 120);
    
    ctx.font = '20px Arial';
    ctx.fillText('Insurance Expert • Note Taker • Meeting Scheduler', canvas.width / 2, 160);
    
    ctx.font = 'italic 24px Arial';
    ctx.fillText('"How may I assist you today?"', canvas.width / 2, 210);
    
    // Create texture and sprite
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 1, 1);
    sprite.position.y = 5.5;
    
    this.hologramGroup.add(sprite);
  }
  
  private createAvatar(): void {
    const avatarGroup = new THREE.Group();
    
    // Head - smaller
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const hologramMaterial = this.createHologramMaterial();
    const head = new THREE.Mesh(headGeometry, hologramMaterial);
    head.position.y = 3.2;
    avatarGroup.add(head);
    
    // Body (torso) - smaller
    const bodyGeometry = new THREE.CylinderGeometry(0.35, 0.3, 1.0, 8);
    const body = new THREE.Mesh(bodyGeometry, hologramMaterial);
    body.position.y = 2.4;
    avatarGroup.add(body);
    
    // Arms - smaller
    const armGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.7);
    const leftArm = new THREE.Mesh(armGeometry, hologramMaterial);
    leftArm.position.set(-0.4, 2.6, 0);
    leftArm.rotation.z = Math.PI / 8;
    avatarGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, hologramMaterial);
    rightArm.position.set(0.4, 2.6, 0);
    rightArm.rotation.z = -Math.PI / 8;
    avatarGroup.add(rightArm);
    
    // Lower body - smaller
    const lowerBodyGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.8, 8);
    const lowerBody = new THREE.Mesh(lowerBodyGeometry, hologramMaterial);
    lowerBody.position.y = 1.5;
    avatarGroup.add(lowerBody);
    
    // Add wireframe overlay for holographic effect
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00c6ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    const headWireframe = new THREE.Mesh(headGeometry, wireframeMaterial);
    headWireframe.position.y = 3.2;  // Match the smaller head position
    headWireframe.scale.setScalar(1.05);
    avatarGroup.add(headWireframe);
    
    // Face display
    this.createFaceDisplay(avatarGroup);
    
    this.avatar = head;
    this.hologramGroup.add(avatarGroup);
  }
  
  private createHologramMaterial(): THREE.Material {
    return new THREE.MeshPhongMaterial({
      color: 0x00c6ff,
      emissive: 0x0072ff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
      shininess: 100,
      specular: 0x00ffff
    });
  }
  
  private createFaceDisplay(parent: THREE.Group): void {
    // Create a simple face display with eyes and mouth
    const faceGroup = new THREE.Group();
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 3.2, 0.25);  // Adjusted for smaller head
    faceGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 3.2, 0.25);  // Adjusted for smaller head
    faceGroup.add(rightEye);
    
    // Mouth (simple line)
    const mouthGeometry = new THREE.BoxGeometry(0.2, 0.02, 0.02);
    const mouth = new THREE.Mesh(mouthGeometry, eyeMaterial);
    mouth.position.set(0, 3.0, 0.25);  // Adjusted for smaller head
    faceGroup.add(mouth);
    
    parent.add(faceGroup);
  }
  
  private createParticleSystem(): void {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Create particles in a cylinder around the avatar
      const angle = (i / 3) * 0.1;
      const radius = 1.5 + Math.random() * 0.5;
      const height = Math.random() * 4;
      
      positions[i] = Math.cos(angle) * radius;
      positions[i + 1] = height;
      positions[i + 2] = Math.sin(angle) * radius;
      
      // Blue-cyan gradient colors
      colors[i] = 0;
      colors[i + 1] = 0.7 + Math.random() * 0.3;
      colors[i + 2] = 1;
      
      sizes[i / 3] = Math.random() * 0.05;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.hologramGroup.add(this.particles);
  }
  
  private createEnergyRings(): void {
    const ringCount = 3;
    
    for (let i = 0; i < ringCount; i++) {
      const ringGeometry = new THREE.TorusGeometry(
        1.2 + i * 0.2,
        0.02,
        8,
        32
      );
      
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x00c6ff,
        transparent: true,
        opacity: 0.5 - i * 0.1,
        blending: THREE.AdditiveBlending
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.y = 2 + i * 0.5;
      ring.rotation.x = Math.PI / 2;
      
      this.hologramGroup.add(ring);
    }
  }
  
  private createDataStreams(): void {
    // Create flowing data visualization
    const streamCount = 4;
    
    for (let i = 0; i < streamCount; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(i * Math.PI / 2) * 2,
          2,
          Math.sin(i * Math.PI / 2) * 2
        ),
        new THREE.Vector3(
          Math.cos(i * Math.PI / 2) * 1,
          4,
          Math.sin(i * Math.PI / 2) * 1
        )
      ]);
      
      const geometry = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
      const material = new THREE.MeshBasicMaterial({
        color: 0x0072ff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      
      const stream = new THREE.Mesh(geometry, material);
      this.hologramGroup.add(stream);
    }
  }
  
  setListening(listening: boolean): void {
    this.isListening = listening;
    
    if (listening) {
      // Enhance glow when listening
      this.glowLight.intensity = 3;
      this.glowLight.color.setHex(0x00ff00);
    } else {
      this.glowLight.intensity = 2;
      this.glowLight.color.setHex(0x00c6ff);
    }
  }
  
  speak(text: string): void {
    this.isSpeaking = true;
    
    // Animate speaking
    setTimeout(() => {
      this.isSpeaking = false;
    }, text.length * 50); // Approximate speaking duration
  }
  
  update(): void {
    this.animationTime += 0.016; // ~60fps
    
    // Rotate particles
    if (this.particles) {
      this.particles.rotation.y += 0.002;
      
      // Update particle positions for flowing effect
      const positions = this.particles.geometry.attributes['position'].array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(this.animationTime + i) * 0.001;
      }
      this.particles.geometry.attributes['position'].needsUpdate = true;
    }
    
    // Animate avatar
    if (this.avatar) {
      // Gentle floating animation
      this.avatar.position.y = 3.2 + Math.sin(this.animationTime) * 0.05;  // Adjusted for smaller avatar
      
      // Scale animation when speaking
      if (this.isSpeaking) {
        const scale = 1 + Math.sin(this.animationTime * 10) * 0.02;
        this.avatar.scale.setScalar(scale);
      } else {
        this.avatar.scale.setScalar(1);
      }
    }
    
    // Pulse glow light
    if (this.glowLight) {
      this.glowLight.intensity = 2 + Math.sin(this.animationTime * 2) * 0.5;
    }
    
    // Rotate energy rings
    this.hologramGroup.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
        child.rotation.z += 0.01 * (index + 1);
      }
    });
  }
  
  getInteractableObjects(): THREE.Object3D[] {
    // Return the hologram group for click detection
    return [this.hologramGroup];
  }
}