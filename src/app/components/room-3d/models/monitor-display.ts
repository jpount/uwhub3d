import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

export class MonitorDisplay {
  private scene: THREE.Scene;
  private monitorGroup: THREE.Group;
  private screenMesh!: THREE.Mesh;
  private monitorId: number;
  private contentType: string = '';
  private glowLight!: THREE.PointLight;
  
  constructor(scene: THREE.Scene, id: number) {
    this.scene = scene;
    this.monitorId = id;
    this.monitorGroup = new THREE.Group();
  }
  
  create(x: number, y: number, z: number, rotation: number): void {
    // Monitor frame
    const frameGeometry = new THREE.BoxGeometry(3, 2, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    this.monitorGroup.add(frame);
    
    // Monitor screen
    const screenGeometry = new THREE.PlaneGeometry(2.8, 1.8);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x0072ff,
      emissiveIntensity: 0.2
    });
    this.screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    this.screenMesh.position.z = 0.06;
    this.monitorGroup.add(this.screenMesh);
    
    // Add screen glow effect
    this.glowLight = new THREE.PointLight(0x0072ff, 0.5, 3);
    this.glowLight.position.z = 0.5;
    this.monitorGroup.add(this.glowLight);
    
    // Monitor stand
    const standGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.5);
    const standMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c2c2c,
      metalness: 0.7,
      roughness: 0.3
    });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.y = -1.25;
    stand.castShadow = true;
    this.monitorGroup.add(stand);
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05);
    const base = new THREE.Mesh(baseGeometry, standMaterial);
    base.position.y = -1.5;
    base.castShadow = true;
    this.monitorGroup.add(base);
    
    // Add initial content
    this.createInitialContent();
    
    // Position the monitor
    this.monitorGroup.position.set(x, y, z);
    this.monitorGroup.rotation.y = rotation;
    
    this.scene.add(this.monitorGroup);
  }
  
  private createInitialContent(): void {
    // Create a canvas texture for the screen content
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d')!;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a0f');
    gradient.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title based on monitor ID
    const titles = [
      'Task Dashboard',
      'Portfolio Analytics',
      'Team Metrics',
      'Risk Assessment'
    ];
    
    ctx.fillStyle = '#00c6ff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(titles[this.monitorId] || 'Monitor ' + (this.monitorId + 1), canvas.width / 2, 80);
    
    // Loading animation placeholder
    ctx.strokeStyle = '#00c6ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 1.5);
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('Loading data...', canvas.width / 2, canvas.height / 2 + 100);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    this.screenMesh.material = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: 0x0072ff,
      emissiveIntensity: 0.1
    });
  }
  
  updateContent(data: any): void {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d')!;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a0f');
    gradient.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Render content based on type
    switch (data.type) {
      case 'tasks':
        this.renderTaskContent(ctx, data.data);
        break;
      case 'portfolio':
        this.renderPortfolioContent(ctx, data.data);
        break;
      case 'dashboard':
        this.renderDashboardContent(ctx, data.data);
        break;
      case 'risk':
        this.renderRiskContent(ctx, data.data);
        break;
    }
    
    // Update texture
    const texture = new THREE.CanvasTexture(canvas);
    this.screenMesh.material = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: this.getEmissiveColor(data.type),
      emissiveIntensity: 0.1
    });
    
    // Update glow light color
    this.glowLight.color.setHex(this.getEmissiveColor(data.type));
  }
  
  private renderTaskContent(ctx: CanvasRenderingContext2D, tasks: any[]): void {
    // Title
    ctx.fillStyle = '#00c6ff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Active Tasks', 50, 60);
    
    // Task list
    tasks.forEach((task, index) => {
      const y = 120 + index * 80;
      
      // Task card background
      ctx.fillStyle = 'rgba(0, 198, 255, 0.1)';
      ctx.fillRect(40, y - 30, 944, 70);
      
      // Task ID
      ctx.fillStyle = '#00c6ff';
      ctx.font = '14px Arial';
      ctx.fillText(task.id, 60, y - 10);
      
      // Account name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(task.accountName, 60, y + 15);
      
      // Status
      const statusColors: any = {
        'Pending': '#ffa502',
        'Quoted': '#05c46b',
        'Referred': '#ff4757'
      };
      ctx.fillStyle = statusColors[task.status] || '#ffffff';
      ctx.font = '16px Arial';
      ctx.fillText(task.status, 850, y);
      
      // Premium
      ctx.fillStyle = '#00c6ff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`$${task.premium.toLocaleString()}`, 930, y + 15);
      ctx.textAlign = 'left';
    });
  }
  
  private renderPortfolioContent(ctx: CanvasRenderingContext2D, portfolios: any[]): void {
    // Title
    ctx.fillStyle = '#00c6ff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Portfolio Performance', 512, 60);
    
    portfolios.forEach((portfolio, index) => {
      const x = 100 + index * 450;
      const y = 150;
      
      // Card background
      ctx.fillStyle = 'rgba(0, 198, 255, 0.1)';
      ctx.fillRect(x - 50, y - 50, 400, 300);
      
      // Portfolio title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(portfolio.title, x + 150, y);
      
      // Value
      ctx.fillStyle = '#00c6ff';
      ctx.font = 'bold 48px Arial';
      ctx.fillText(portfolio.value, x + 150, y + 60);
      
      // Metrics
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText(portfolio.boundAmount, x + 150, y + 100);
      ctx.fillText(portfolio.boundQuoteRatio, x + 150, y + 130);
      ctx.fillText(portfolio.openQuote, x + 150, y + 160);
    });
  }
  
  private renderDashboardContent(ctx: CanvasRenderingContext2D, cards: any[]): void {
    // Title
    ctx.fillStyle = '#00c6ff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Dashboard Metrics', 512, 60);
    
    // Render cards in a grid
    cards.forEach((card, index) => {
      const x = 200 + (index % 2) * 400;
      const y = 150 + Math.floor(index / 2) * 200;
      
      // Card background
      ctx.fillStyle = 'rgba(0, 198, 255, 0.1)';
      ctx.fillRect(x - 150, y - 50, 300, 150);
      
      // Card title
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(card.title, x, y);
      
      // Card value
      ctx.fillStyle = '#00c6ff';
      ctx.font = 'bold 48px Arial';
      ctx.fillText(card.value, x, y + 50);
      
      // Card change
      if (card.change) {
        ctx.fillStyle = '#05c46b';
        ctx.font = '16px Arial';
        ctx.fillText(card.change, x, y + 80);
      }
    });
  }
  
  private renderRiskContent(ctx: CanvasRenderingContext2D, risks: any[]): void {
    // Title
    ctx.fillStyle = '#00c6ff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Risk Assessment Matrix', 512, 60);
    
    // Create risk heat map
    const riskColors: any = {
      'Almost certain': '#ff4757',
      'Likely': '#ffa502',
      'Even chance': '#ffd32c',
      'Unlikely': '#05c46b',
      'Remote': '#0fbcf9'
    };
    
    // Draw risk items
    risks.forEach((risk, index) => {
      const y = 120 + index * 60;
      
      // Risk bar
      const riskLevel = risk.risk || 'Even chance';
      ctx.fillStyle = riskColors[riskLevel] || '#ffffff';
      ctx.fillRect(50, y - 20, 600, 40);
      
      // Account name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(risk.name, 70, y + 5);
      
      // Risk level
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'right';
      ctx.fillText(riskLevel, 620, y + 5);
      
      // Premium at risk
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.fillText(`$${risk.premium.toLocaleString()}`, 900, y + 5);
    });
  }
  
  private getEmissiveColor(type: string): number {
    const colors: any = {
      'tasks': 0x00c6ff,
      'portfolio': 0x05c46b,
      'dashboard': 0xffa502,
      'risk': 0xff4757
    };
    return colors[type] || 0x0072ff;
  }
  
  update(): void {
    // Animate screen glow
    if (this.glowLight) {
      this.glowLight.intensity = 0.5 + Math.sin(Date.now() * 0.001) * 0.1;
    }
  }
}