import * as THREE from 'three';

export class GlobeVisualization {
  private scene: THREE.Scene;
  private globeGroup: THREE.Group;
  private globe!: THREE.Mesh;
  private dataPoints: THREE.Mesh[] = [];
  private cityData: any[] = [];
  private hoveredCity: THREE.Mesh | null = null;
  private infoPanel!: THREE.Sprite;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.globeGroup = new THREE.Group();
  }
  
  create(): void {
    // Globe sphere
    const globeGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x0072ff,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    this.globe = new THREE.Mesh(globeGeometry, globeMaterial);
    this.globeGroup.add(this.globe);
    
    // Add continents outline
    const continentGeometry = new THREE.SphereGeometry(1.51, 32, 32);
    const continentMaterial = new THREE.MeshBasicMaterial({
      color: 0x00c6ff,
      transparent: true,
      opacity: 0.2
    });
    const continents = new THREE.Mesh(continentGeometry, continentMaterial);
    this.globeGroup.add(continents);
    
    // Add data points for major cities
    this.createDataPoints();
    
    // Add connection lines
    this.createConnectionLines();
    
    // Position globe
    this.globeGroup.position.set(5, 2, -5);
    this.scene.add(this.globeGroup);
  }
  
  private createDataPoints(): void {
    this.cityData = [
      { 
        name: 'New York', 
        lat: 40.7128, 
        lon: -74.0060, 
        size: 0.1,
        policies: 342,
        premium: '$4.2M',
        risk: 'Medium',
        claims: 12
      },
      { 
        name: 'London', 
        lat: 51.5074, 
        lon: -0.1278, 
        size: 0.08,
        policies: 218,
        premium: '$2.8M',
        risk: 'Low',
        claims: 5
      },
      { 
        name: 'Tokyo', 
        lat: 35.6762, 
        lon: 139.6503, 
        size: 0.09,
        policies: 186,
        premium: '$3.1M',
        risk: 'High',
        claims: 18
      },
      { 
        name: 'Hong Kong', 
        lat: 22.3193, 
        lon: 114.1694, 
        size: 0.07,
        policies: 156,
        premium: '$2.4M',
        risk: 'Medium',
        claims: 8
      },
      { 
        name: 'Singapore', 
        lat: 1.3521, 
        lon: 103.8198, 
        size: 0.06,
        policies: 98,
        premium: '$1.5M',
        risk: 'Low',
        claims: 3
      }
    ];
    
    this.cityData.forEach((city, index) => {
      const phi = (90 - city.lat) * Math.PI / 180;
      const theta = (city.lon + 180) * Math.PI / 180;
      
      const x = -1.5 * Math.sin(phi) * Math.cos(theta);
      const y = 1.5 * Math.cos(phi);
      const z = 1.5 * Math.sin(phi) * Math.sin(theta);
      
      // Create clickable city marker
      const pointGeometry = new THREE.SphereGeometry(city.size, 8, 8);
      const riskColors: any = {
        'High': 0xff4757,
        'Medium': 0xffa502,
        'Low': 0x05c46b
      };
      
      const pointMaterial = new THREE.MeshStandardMaterial({
        color: riskColors[city.risk] || 0xff4757,
        emissive: riskColors[city.risk] || 0xff4757,
        emissiveIntensity: 1
      });
      
      const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
      pointMesh.position.set(x, y, z);
      pointMesh.userData = { 
        type: 'city', 
        cityIndex: index,
        cityData: city
      };
      
      this.dataPoints.push(pointMesh);
      this.globeGroup.add(pointMesh);
      
      // Add city label
      this.createCityLabel(city.name, x, y + 0.2, z);
    });
    
    // Create info panel (initially hidden)
    this.createInfoPanel();
  }
  
  private createCityLabel(name: string, x: number, y: number, z: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, canvas.width / 2, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5, 0.125, 1);
    sprite.position.set(x, y, z);
    this.globeGroup.add(sprite);
  }
  
  private createInfoPanel(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    
    // This will be updated when hovering
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0
    });
    
    this.infoPanel = new THREE.Sprite(spriteMaterial);
    this.infoPanel.scale.set(2, 1.5, 1);
    this.infoPanel.position.set(0, 3, 0);
    this.globeGroup.add(this.infoPanel);
  }
  
  private createConnectionLines(): void {
    const material = new THREE.LineBasicMaterial({
      color: 0x00c6ff,
      transparent: true,
      opacity: 0.3
    });
    
    // Create curved lines between cities
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1, 0.5, 0.5),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(1, 0.5, -0.5)
    ]);
    
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    this.globeGroup.add(line);
  }
  
  update(): void {
    // Rotate globe
    if (this.globe) {
      this.globe.rotation.y += 0.002;
    }
    
    // Animate data points with pulsing
    this.dataPoints.forEach((point, index) => {
      const scale = point.userData['cityData'].size * (1 + Math.sin(Date.now() * 0.002 + index) * 0.3);
      point.scale.setScalar(scale / point.userData['cityData'].size);
    });
  }
  
  getInteractableObjects(): THREE.Object3D[] {
    return this.dataPoints;
  }
  
  getCityData(object: THREE.Object3D): any {
    if (object.userData && object.userData['cityData']) {
      return object.userData['cityData'];
    }
    return null;
  }
  
  showCityInfo(cityData: any): void {
    if (!this.infoPanel || !cityData) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 30, 60, 0.95)');
    gradient.addColorStop(1, 'rgba(0, 15, 30, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#00c6ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // City name
    ctx.fillStyle = '#00c6ff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(cityData.name, canvas.width / 2, 50);
    
    // Data rows
    const data = [
      { label: 'Active Policies:', value: cityData.policies },
      { label: 'Total Premium:', value: cityData.premium },
      { label: 'Risk Level:', value: cityData.risk },
      { label: 'Recent Claims:', value: cityData.claims }
    ];
    
    ctx.textAlign = 'left';
    ctx.font = '24px Arial';
    
    data.forEach((item, index) => {
      const y = 120 + index * 50;
      
      // Label
      ctx.fillStyle = '#ffffff';
      ctx.fillText(item.label, 50, y);
      
      // Value
      const valueColors: any = {
        'High': '#ff4757',
        'Medium': '#ffa502',
        'Low': '#05c46b'
      };
      
      ctx.fillStyle = item.label.includes('Risk') ? valueColors[item.value] || '#00c6ff' : '#00c6ff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(item.value.toString(), 250, y);
      ctx.font = '24px Arial';
    });
    
    // Update texture
    const texture = new THREE.CanvasTexture(canvas);
    (this.infoPanel.material as THREE.SpriteMaterial).map = texture;
    (this.infoPanel.material as THREE.SpriteMaterial).opacity = 1;
    (this.infoPanel.material as THREE.SpriteMaterial).needsUpdate = true;
  }
  
  hideCityInfo(): void {
    if (this.infoPanel) {
      (this.infoPanel.material as THREE.SpriteMaterial).opacity = 0;
    }
  }
  
  zoomToCity(cityIndex: number): THREE.Vector3 | undefined {
    if (cityIndex >= 0 && cityIndex < this.dataPoints.length) {
      const city = this.dataPoints[cityIndex];
      // This would trigger camera animation in the main component
      return city.position;
    }
    return undefined;
  }
}