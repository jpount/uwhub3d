import * as THREE from 'three';

export class FilingCabinet {
  private scene: THREE.Scene;
  private cabinetGroup: THREE.Group;
  private drawers: THREE.Mesh[] = [];
  private drawerStates: boolean[] = [false, false, false, false];
  private drawerAnimations: number[] = [0, 0, 0, 0];
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.cabinetGroup = new THREE.Group();
  }
  
  create(): void {
    // Cabinet body - silver grey for better visibility
    const cabinetGeometry = new THREE.BoxGeometry(1, 2, 0.8);
    const cabinetMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,  // Silver grey color
      metalness: 0.6,
      roughness: 0.4
    });
    const cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
    cabinet.position.y = 1;
    cabinet.castShadow = true;
    this.cabinetGroup.add(cabinet);
    
    // Drawers - brighter, more vibrant colors for visibility
    const drawerColors = [0x5fa3f5, 0x6ee86e, 0xffb84d, 0xff8080];  // Lighter versions
    for (let i = 0; i < 4; i++) {
      const drawerGeometry = new THREE.BoxGeometry(0.9, 0.45, 0.75);
      const drawerMaterial = new THREE.MeshStandardMaterial({
        color: drawerColors[i],
        metalness: 0.3,  // Less metallic for better color visibility
        roughness: 0.5,
        emissive: drawerColors[i],  // Add emissive for slight glow
        emissiveIntensity: 0.1
      });
      const drawer = new THREE.Mesh(drawerGeometry, drawerMaterial);
      drawer.position.set(0, 0.25 + i * 0.5, 0.02);
      drawer.castShadow = true;
      drawer.userData = { drawerIndex: i, type: 'drawer' };
      this.drawers.push(drawer);
      
      // Drawer handle - darker for contrast
      const handleGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
      const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,  // Darker grey for handles
        metalness: 0.9,
        roughness: 0.1
      });
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);
      handle.position.set(0, 0.25 + i * 0.5, 0.4);
      
      this.cabinetGroup.add(drawer);
      this.cabinetGroup.add(handle);
    }
    
    // Floating documents effect
    this.createFloatingDocuments();
    
    // Add drawer labels for clarity
    this.addDrawerLabels();
    
    // Position cabinet more visibly on the left side
    this.cabinetGroup.position.set(-7, 0, 0);
    this.cabinetGroup.scale.set(1.2, 1.2, 1.2);  // Make it bigger
    this.scene.add(this.cabinetGroup);
  }
  
  private createFloatingDocuments(): void {
    for (let i = 0; i < 5; i++) {
      const docGeometry = new THREE.PlaneGeometry(0.3, 0.4);
      const docMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const doc = new THREE.Mesh(docGeometry, docMaterial);
      doc.position.set(
        Math.random() * 2 - 1,
        2 + Math.random() * 2,
        Math.random() * 0.5
      );
      doc.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      this.cabinetGroup.add(doc);
    }
  }
  
  private addDrawerLabels(): void {
    const labels = ['HIGH PRIORITY', 'MEDIUM RISK', 'LOW RISK', 'ARCHIVED'];
    const labelColors = ['#ff8080', '#ffb84d', '#6ee86e', '#5fa3f5'];
    
    labels.forEach((label, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      
      // Clear background
      ctx.fillStyle = labelColors[index];
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(label, canvas.width / 2, 40);
      
      // Create texture and sprite
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
      });
      
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.5, 0.125, 1);
      sprite.position.set(0, 0.25 + index * 0.5, 0.5);
      this.cabinetGroup.add(sprite);
    });
  }
  
  update(): void {
    // Animate drawer sliding
    this.drawers.forEach((drawer, index) => {
      const targetZ = this.drawerStates[index] ? 0.5 : 0.02;
      const currentZ = drawer.position.z;
      const newZ = currentZ + (targetZ - currentZ) * 0.1;
      drawer.position.z = newZ;
      this.drawerAnimations[index] = newZ;
    });
    
    // Animate floating documents
    this.cabinetGroup.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) {
        child.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
        child.rotation.y += 0.01;
      }
    });
  }
  
  getDrawers(): THREE.Object3D[] {
    return this.drawers;
  }
  
  getDrawerIndex(object: THREE.Object3D): number {
    if (object.userData && object.userData['drawerIndex'] !== undefined) {
      return object.userData['drawerIndex'];
    }
    return -1;
  }
  
  toggleDrawer(index: number): void {
    if (index >= 0 && index < this.drawerStates.length) {
      // Close all other drawers first
      this.drawerStates = this.drawerStates.map((_, i) => i === index ? !this.drawerStates[index] : false);
      
      // Create opening/closing effect with documents
      if (this.drawerStates[index]) {
        this.showDocuments(index);
      } else {
        this.hideDocuments(index);
      }
    }
  }
  
  private showDocuments(drawerIndex: number): void {
    // Create document particles flying out
    const documentCount = 5;
    for (let i = 0; i < documentCount; i++) {
      const docGeometry = new THREE.PlaneGeometry(0.2, 0.3);
      const docMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      
      const doc = new THREE.Mesh(docGeometry, docMaterial);
      doc.userData = { tempDocument: true, drawerIndex };
      
      // Position above the drawer
      const drawer = this.drawers[drawerIndex];
      doc.position.set(
        drawer.position.x + (Math.random() - 0.5) * 0.5,
        drawer.position.y + 0.5 + i * 0.1,
        drawer.position.z + 0.5
      );
      
      doc.rotation.set(
        Math.random() * 0.2,
        Math.random() * Math.PI,
        Math.random() * 0.2
      );
      
      this.cabinetGroup.add(doc);
    }
  }
  
  private hideDocuments(drawerIndex: number): void {
    // Remove temporary documents
    const toRemove: THREE.Object3D[] = [];
    this.cabinetGroup.children.forEach(child => {
      if (child.userData && child.userData['tempDocument'] && child.userData['drawerIndex'] === drawerIndex) {
        toRemove.push(child);
      }
    });
    
    toRemove.forEach(child => {
      this.cabinetGroup.remove(child);
    });
  }
}