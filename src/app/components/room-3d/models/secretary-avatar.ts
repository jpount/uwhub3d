import * as THREE from 'three';

export class SecretaryAvatar {
  private scene: THREE.Scene;
  private avatarGroup: THREE.Group;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.avatarGroup = new THREE.Group();
  }
  
  create(): void {
    // Secretary desk
    const deskGeometry = new THREE.BoxGeometry(2, 0.05, 1);
    const deskMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.5
    });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.y = 1.5;
    desk.castShadow = true;
    this.avatarGroup.add(desk);
    
    // Secretary avatar (simplified)
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8);
    const avatarMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, avatarMaterial);
    body.position.set(0, 2.5, -0.3);
    body.castShadow = true;
    this.avatarGroup.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.25);
    const head = new THREE.Mesh(headGeometry, avatarMaterial);
    head.position.set(0, 3.5, -0.3);
    this.avatarGroup.add(head);
    
    // Notepad
    const notepadGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.02);
    const notepadMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });
    const notepad = new THREE.Mesh(notepadGeometry, notepadMaterial);
    notepad.position.set(-0.5, 1.55, 0);
    notepad.rotation.x = -Math.PI / 6;
    this.avatarGroup.add(notepad);
    
    this.avatarGroup.position.set(4, 0, 3);
    this.scene.add(this.avatarGroup);
  }
  
  update(): void {
    // Animation for writing motion
    const time = Date.now() * 0.001;
    if (this.avatarGroup.children[1]) {
      this.avatarGroup.children[1].rotation.y = Math.sin(time) * 0.1;
    }
  }
}