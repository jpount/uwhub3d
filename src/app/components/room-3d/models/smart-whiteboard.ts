import * as THREE from 'three';

export class SmartWhiteboard {
  private scene: THREE.Scene;
  private whiteboardGroup: THREE.Group;
  private boardSurface!: THREE.Mesh;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.whiteboardGroup = new THREE.Group();
  }
  
  create(): void {
    // Whiteboard frame
    const frameGeometry = new THREE.BoxGeometry(4, 2.5, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      metalness: 0.7,
      roughness: 0.3
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    this.whiteboardGroup.add(frame);
    
    // Whiteboard surface
    const surfaceGeometry = new THREE.PlaneGeometry(3.8, 2.3);
    const canvas = this.createWhiteboardContent();
    const texture = new THREE.CanvasTexture(canvas);
    const surfaceMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      color: 0xffffff
    });
    this.boardSurface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    this.boardSurface.position.z = 0.06;
    this.whiteboardGroup.add(this.boardSurface);
    
    // Markers tray
    const trayGeometry = new THREE.BoxGeometry(3, 0.1, 0.2);
    const trayMaterial = new THREE.MeshStandardMaterial({
      color: 0x34495e,
      metalness: 0.5,
      roughness: 0.5
    });
    const tray = new THREE.Mesh(trayGeometry, trayMaterial);
    tray.position.set(0, -1.3, 0.1);
    this.whiteboardGroup.add(tray);
    
    // Markers
    const markerColors = [0xff0000, 0x00ff00, 0x0000ff, 0x000000];
    markerColors.forEach((color, index) => {
      const markerGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3);
      const markerMaterial = new THREE.MeshStandardMaterial({ color });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(-1 + index * 0.5, -1.3, 0.2);
      marker.rotation.z = Math.PI / 2;
      this.whiteboardGroup.add(marker);
    });
    
    // Position whiteboard more visibly on the right side
    this.whiteboardGroup.position.set(7, 2.5, 0);
    this.whiteboardGroup.rotation.y = -Math.PI / 6;  // Angle it towards the center
    this.whiteboardGroup.scale.set(1.3, 1.3, 1.3);  // Make it bigger
    this.scene.add(this.whiteboardGroup);
  }
  
  private createWhiteboardContent(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d')!;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw some planning content
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText('Q3 2025 Strategy', 50, 60);
    
    // Draw flowchart
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 3;
    
    // Box 1
    ctx.strokeRect(50, 100, 200, 80);
    ctx.font = '20px Arial';
    ctx.fillText('Risk Assessment', 80, 145);
    
    // Box 2
    ctx.strokeRect(300, 100, 200, 80);
    ctx.fillText('Underwriting', 340, 145);
    
    // Box 3
    ctx.strokeRect(550, 100, 200, 80);
    ctx.fillText('Approval', 610, 145);
    
    // Arrows
    ctx.beginPath();
    ctx.moveTo(250, 140);
    ctx.lineTo(300, 140);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(500, 140);
    ctx.lineTo(550, 140);
    ctx.stroke();
    
    // Notes section
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '24px Arial';
    ctx.fillText('Key Metrics:', 50, 250);
    
    ctx.fillStyle = '#333333';
    ctx.font = '18px Arial';
    ctx.fillText('• Bind Rate: 58%', 70, 290);
    ctx.fillText('• Avg Premium: $12,500', 70, 320);
    ctx.fillText('• Processing Time: 48hrs', 70, 350);
    
    // Sticky notes
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(600, 250, 150, 150);
    ctx.fillStyle = '#333333';
    ctx.font = '16px Arial';
    ctx.fillText('TODO:', 620, 280);
    ctx.fillText('- Review MUJI', 620, 310);
    ctx.fillText('- Call Disney', 620, 340);
    ctx.fillText('- Update KPIs', 620, 370);
    
    return canvas;
  }
  
  update(): void {
    // Could add interactive drawing functionality here
  }
}