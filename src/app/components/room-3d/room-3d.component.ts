import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomScene } from './models/room-scene';
import { MonitorDisplay } from './models/monitor-display';
import { DeskWorkspace } from './models/desk-workspace';
import { AIHologram } from './models/ai-hologram';
import { SecretaryAvatar } from './models/secretary-avatar';
import { GlobeVisualization } from './models/globe-visualization';
import { FilingCabinet } from './models/filing-cabinet';
import { SmartWhiteboard } from './models/smart-whiteboard';
import { TaskService } from '../../services/task';
import { Task, DashboardCard, PortfolioCard } from '../../models/task.interface';
import { VoiceInteractionService } from '../../services/voice-interaction.service';
import { ThreeRendererService } from '../../services/three-renderer.service';

@Component({
  selector: 'app-room-3d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-3d.component.html',
  styleUrls: ['./room-3d.component.scss']
})
export class Room3dComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId: number = 0;
  private raycaster!: THREE.Raycaster;
  private mouse!: THREE.Vector2;
  
  // 3D Components
  private roomScene!: RoomScene;
  private monitors: MonitorDisplay[] = [];
  private deskWorkspace!: DeskWorkspace;
  private aiHologram!: AIHologram;
  private secretaryAvatar!: SecretaryAvatar;
  private globeVisualization!: GlobeVisualization;
  private filingCabinet!: FilingCabinet;
  private smartWhiteboard!: SmartWhiteboard;
  
  // UI State
  showVoiceAssistant = false;
  isListening = false;
  voiceMessages: Array<{text: string, type: 'user' | 'ai'}> = [];
  currentView: 'overview' | 'desk' | 'monitors' | 'globe' = 'overview';
  
  // Data
  tasks: Task[] = [];
  dashboardCards: DashboardCard[] = [];
  portfolioCards: PortfolioCard[] = [];
  
  // Stats
  fps = 0;
  private lastTime = performance.now();
  private frameCount = 0;
  
  constructor(
    private taskService: TaskService,
    private voiceService: VoiceInteractionService,
    private threeRenderer: ThreeRendererService
  ) {}
  
  ngOnInit(): void {
    // Data will be loaded after scene creation
  }
  
  ngAfterViewInit(): void {
    this.initializeThreeJS();
    this.createScene();
    this.setupKeyboardControls();
    this.setupMouseInteraction();
    this.animate();
    // Load data after scene is created
    this.loadData();
  }
  
  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    // Clean up Three.js resources
    this.scene?.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });
  }
  
  private loadData(): void {
    // Load tasks
    this.taskService.getAllTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.updateMonitorDisplays();
    });
    
    // Load dashboard cards
    this.taskService.getDashboardCards().subscribe(cards => {
      this.dashboardCards = cards;
      this.updateMonitorDisplays();
    });
    
    // Load portfolio cards
    this.taskService.getPortfolioCards().subscribe(cards => {
      this.portfolioCards = cards;
      this.updateMonitorDisplays();
    });
  }
  
  private initializeThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);
    this.scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);
    
    // Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 5, 15);  // Move camera back to see more of the room
    
    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    // Controls setup
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI * 0.45;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 30;
    this.controls.target.set(0, 0, 0);
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Initialize raycaster for mouse interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }
  
  private createScene(): void {
    // Lighting
    this.setupLighting();
    
    // Create room
    this.roomScene = new RoomScene(this.scene);
    this.roomScene.create();
    
    // Create monitors
    this.createMonitors();
    
    // Create desk workspace
    this.deskWorkspace = new DeskWorkspace(this.scene);
    this.deskWorkspace.create();
    
    // Create AI hologram (combines AI expert and secretary functions)
    this.aiHologram = new AIHologram(this.scene);
    this.aiHologram.create();
    
    // Create globe visualization
    this.globeVisualization = new GlobeVisualization(this.scene);
    this.globeVisualization.create();
    
    // Create filing cabinet
    this.filingCabinet = new FilingCabinet(this.scene);
    this.filingCabinet.create();
    
    // Create smart whiteboard
    this.smartWhiteboard = new SmartWhiteboard(this.scene);
    this.smartWhiteboard.create();
  }
  
  private setupLighting(): void {
    // Ambient light for overall illumination - increased for better visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    this.scene.add(ambientLight);
    
    // Main directional light (simulating ceiling light) - increased intensity
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);
    
    // Point lights for accent lighting
    const blueLight = new THREE.PointLight(0x00c6ff, 1, 15);
    blueLight.position.set(-5, 3, -5);
    this.scene.add(blueLight);
    
    const purpleLight = new THREE.PointLight(0x0072ff, 1, 15);
    purpleLight.position.set(5, 3, -5);
    this.scene.add(purpleLight);
    
    // Spot light for desk area - increased intensity
    const deskLight = new THREE.SpotLight(0xffffff, 1.0);
    deskLight.position.set(0, 5, 2);
    deskLight.target.position.set(0, 1.5, 0);
    deskLight.angle = Math.PI / 4;
    deskLight.penumbra = 0.3;
    deskLight.castShadow = true;
    this.scene.add(deskLight);
    this.scene.add(deskLight.target);
    
    // Additional light for cabinet area
    const cabinetLight = new THREE.PointLight(0xffffff, 0.8, 10);
    cabinetLight.position.set(-7, 3, 0);
    this.scene.add(cabinetLight);
    
    // Additional light for whiteboard area
    const whiteboardLight = new THREE.PointLight(0xffffff, 0.8, 10);
    whiteboardLight.position.set(7, 3, 0);
    this.scene.add(whiteboardLight);
  }
  
  private createMonitors(): void {
    // Create 4 wall-mounted monitors
    const monitorPositions = [
      { x: -6, y: 3, z: -7, rotation: 0 },
      { x: -2, y: 3, z: -7, rotation: 0 },
      { x: 2, y: 3, z: -7, rotation: 0 },
      { x: 6, y: 3, z: -7, rotation: 0 }
    ];
    
    monitorPositions.forEach((pos, index) => {
      const monitor = new MonitorDisplay(this.scene, index);
      monitor.create(pos.x, pos.y, pos.z, pos.rotation);
      this.monitors.push(monitor);
    });
  }
  
  private updateMonitorDisplays(): void {
    if (this.monitors.length > 0 && this.tasks.length > 0) {
      // Update monitor 1 with task data
      this.monitors[0].updateContent({
        type: 'tasks',
        data: this.tasks.slice(0, 5)
      });
      
      // Update monitor 2 with portfolio data
      if (this.portfolioCards.length > 0) {
        this.monitors[1].updateContent({
          type: 'portfolio',
          data: this.portfolioCards
        });
      }
      
      // Update monitor 3 with dashboard metrics
      if (this.dashboardCards.length > 0) {
        this.monitors[2].updateContent({
          type: 'dashboard',
          data: this.dashboardCards
        });
      }
      
      // Update monitor 4 with risk assessment
      this.monitors[3].updateContent({
        type: 'risk',
        data: this.tasks.map(t => ({
          name: t.accountName,
          risk: t.propensityToBind,
          premium: t.premium
        }))
      });
    }
  }
  
  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Update FPS
    this.updateFPS();
    
    // Update controls
    this.controls.update();
    
    // Update animated components
    if (this.aiHologram) {
      this.aiHologram.update();
    }
    
    if (this.globeVisualization) {
      this.globeVisualization.update();
    }
    
    if (this.filingCabinet) {
      this.filingCabinet.update();
    }
    
    this.monitors.forEach(monitor => monitor.update());
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  private updateFPS(): void {
    const currentTime = performance.now();
    this.frameCount++;
    
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }
  
  private onWindowResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  // Camera view methods
  switchView(view: 'overview' | 'desk' | 'monitors' | 'globe'): void {
    this.currentView = view;
    
    const positions = {
      overview: { x: 0, y: 8, z: 15, target: { x: 0, y: 0, z: 0 } },
      desk: { x: 0, y: 3, z: 5, target: { x: 0, y: 1.5, z: 0 } },
      monitors: { x: 0, y: 3, z: -3, target: { x: 0, y: 3, z: -7 } },
      globe: { x: 3, y: 4, z: -1, target: { x: 5, y: 2, z: -5 } }
    };
    
    const pos = positions[view];
    
    // Animate camera movement using GSAP (will import later)
    this.animateCamera(pos.x, pos.y, pos.z, pos.target);
  }
  
  private animateCamera(x: number, y: number, z: number, target: { x: number, y: number, z: number }): void {
    // Simple linear interpolation for now
    const startPos = this.camera.position.clone();
    const endPos = new THREE.Vector3(x, y, z);
    const startTarget = this.controls.target.clone();
    const endTarget = new THREE.Vector3(target.x, target.y, target.z);
    
    let progress = 0;
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    const animateStep = () => {
      progress = Math.min((Date.now() - startTime) / duration, 1);
      
      this.camera.position.lerpVectors(startPos, endPos, progress);
      this.controls.target.lerpVectors(startTarget, endTarget, progress);
      
      if (progress < 1) {
        requestAnimationFrame(animateStep);
      }
    };
    
    animateStep();
  }
  
  // Voice assistant methods
  toggleVoiceAssistant(): void {
    this.showVoiceAssistant = !this.showVoiceAssistant;
    
    if (this.showVoiceAssistant && this.aiHologram) {
      this.aiHologram.setListening(true);
    }
  }
  
  sendVoiceMessage(message: string): void {
    if (!message.trim()) return;
    
    // Add user message
    this.voiceMessages.push({ text: message, type: 'user' });
    
    // Simulate AI response
    setTimeout(() => {
      const response = this.generateAIResponse(message);
      this.voiceMessages.push({ text: response, type: 'ai' });
      
      // Use text-to-speech for AI response
      this.voiceService.speak(response);
      
      if (this.aiHologram) {
        this.aiHologram.speak(response);
      }
    }, 1000);
  }
  
  toggleVoiceInput(): void {
    if (this.isListening) {
      this.voiceService.stopListening();
      this.isListening = false;
      if (this.aiHologram) {
        this.aiHologram.setListening(false);
      }
    } else {
      this.voiceService.startListening();
      this.isListening = true;
      if (this.aiHologram) {
        this.aiHologram.setListening(true);
      }
      
      // Subscribe to voice commands
      this.voiceService.getVoiceCommands().subscribe(command => {
        this.sendVoiceMessage(command);
        this.isListening = false;
        this.voiceService.stopListening();
      });
    }
  }
  
  clearChat(): void {
    this.voiceMessages = [];
  }
  
  stopSpeaking(): void {
    // Stop any ongoing speech synthesis
    this.voiceService.stopSpeaking();
    
    // Reset AI hologram animation
    if (this.aiHologram) {
      this.aiHologram.setListening(false);
    }
  }
  
  private generateAIResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('task')) {
      return `You have ${this.tasks.length} active tasks. The highest priority is "${this.tasks[0]?.accountName}". I can help you prioritize or create a task schedule.`;
    } else if (lowerMessage.includes('portfolio')) {
      return 'Your portfolio is performing well with $2.4M bound YTD and a 58% bound-quote ratio. Would you like me to generate a performance report?';
    } else if (lowerMessage.includes('risk')) {
      return 'Current risk assessment shows 3 high-priority accounts requiring immediate attention: MUJI Hong Kong, Disney Company, and Knight-Swift. Should I schedule review meetings?';
    } else if (lowerMessage.includes('meeting') || lowerMessage.includes('schedule')) {
      return 'I can schedule meetings for you. You have 3 meetings today: 10:30 AM with Knight-Swift, 2:00 PM Disney renewal review, and 3:30 PM MUJI risk assessment.';
    } else if (lowerMessage.includes('note') || lowerMessage.includes('reminder')) {
      return 'I\'ve noted that for you. Your current reminders: Complete MUJI review by EOD, Call Disney contact about renewal terms, Update Knight-Swift sanctions check.';
    } else if (lowerMessage.includes('help')) {
      return 'As your AI assistant and secretary, I can: 1) Manage insurance tasks and policies, 2) Take notes and set reminders, 3) Schedule meetings, 4) Provide risk assessments, 5) Generate reports. What would you like help with?';
    } else {
      return 'I\'m ARIA, your AI assistant and secretary. I can help with insurance expertise, manage tasks, take notes, schedule meetings, and provide analysis. What do you need?';
    }
  }
  
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  private setupKeyboardControls(): void {
    const moveSpeed = 0.5;
    const keys: { [key: string]: boolean } = {};
    
    window.addEventListener('keydown', (e) => {
      // Don't process keyboard controls if user is typing in an input field
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      
      keys[e.key.toLowerCase()] = true;
      
      // Prevent default browser scrolling
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      keys[e.key.toLowerCase()] = false;
    });
    
    // Update camera position based on keys
    const updateMovement = () => {
      if (!this.camera) return;
      
      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();
      
      // Get camera direction
      this.camera.getWorldDirection(forward);
      forward.y = 0; // Keep movement horizontal
      forward.normalize();
      
      // Get right vector
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
      
      // Apply movement
      if (keys['w'] || keys['arrowup']) {
        this.camera.position.addScaledVector(forward, moveSpeed);
        this.controls.target.addScaledVector(forward, moveSpeed);
      }
      if (keys['s'] || keys['arrowdown']) {
        this.camera.position.addScaledVector(forward, -moveSpeed);
        this.controls.target.addScaledVector(forward, -moveSpeed);
      }
      if (keys['a'] || keys['arrowleft']) {
        this.camera.position.addScaledVector(right, -moveSpeed);
        this.controls.target.addScaledVector(right, -moveSpeed);
      }
      if (keys['d'] || keys['arrowright']) {
        this.camera.position.addScaledVector(right, moveSpeed);
        this.controls.target.addScaledVector(right, moveSpeed);
      }
      
      requestAnimationFrame(updateMovement);
    };
    
    updateMovement();
  }
  
  private setupMouseInteraction(): void {
    const canvas = this.canvasRef.nativeElement;
    
    // Track mouse position
    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });
    
    // Handle clicks
    canvas.addEventListener('click', (event) => {
      this.handleClick(event);
    });
    
    // Change cursor on hover
    canvas.addEventListener('mousemove', (event) => {
      this.checkHover();
    });
  }
  
  private handleClick(event: MouseEvent): void {
    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Check filing cabinet interaction
    if (this.filingCabinet) {
      const intersects = this.raycaster.intersectObjects(this.filingCabinet.getDrawers(), true);
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const drawerIndex = this.filingCabinet.getDrawerIndex(clickedObject);
        if (drawerIndex !== -1) {
          this.filingCabinet.toggleDrawer(drawerIndex);
          this.showDrawerContents(drawerIndex);
        }
      }
    }
    
    // Check AI assistant interaction
    if (this.aiHologram) {
      const aiObjects = this.aiHologram.getInteractableObjects();
      const intersects = this.raycaster.intersectObjects(aiObjects, true);
      if (intersects.length > 0) {
        this.toggleVoiceAssistant();
      }
    }
    
    // Check globe interaction
    if (this.globeVisualization) {
      const globeObjects = this.globeVisualization.getInteractableObjects();
      const intersects = this.raycaster.intersectObjects(globeObjects, true);
      if (intersects.length > 0) {
        const clickedCity = intersects[0].object;
        const cityData = this.globeVisualization.getCityData(clickedCity);
        if (cityData) {
          this.showCityDetails(cityData);
        }
      }
    }
  }
  
  private checkHover(): void {
    const canvas = this.canvasRef.nativeElement;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    let isHovering = false;
    
    // Check if hovering over filing cabinet
    if (this.filingCabinet) {
      const intersects = this.raycaster.intersectObjects(this.filingCabinet.getDrawers(), true);
      if (intersects.length > 0) {
        isHovering = true;
      }
    }
    
    // Check if hovering over AI hologram
    if (this.aiHologram) {
      const aiObjects = this.aiHologram.getInteractableObjects();
      const intersects = this.raycaster.intersectObjects(aiObjects, true);
      if (intersects.length > 0) {
        isHovering = true;
      }
    }
    
    // Check if hovering over globe cities
    if (this.globeVisualization) {
      const globeObjects = this.globeVisualization.getInteractableObjects();
      const intersects = this.raycaster.intersectObjects(globeObjects, true);
      if (intersects.length > 0) {
        isHovering = true;
        const hoveredCity = intersects[0].object;
        const cityData = this.globeVisualization.getCityData(hoveredCity);
        if (cityData) {
          this.globeVisualization.showCityInfo(cityData);
        }
      } else {
        this.globeVisualization.hideCityInfo();
      }
    }
    
    // Update cursor
    canvas.style.cursor = isHovering ? 'pointer' : 'default';
  }
  
  private showDrawerContents(drawerIndex: number): void {
    const drawerContents = [
      { title: 'HIGH PRIORITY', items: ['MUJI Hong Kong - Urgent Review', 'Disney Renewal - Due Today', 'Knight-Swift - Sanctions Required'] },
      { title: 'MEDIUM RISK', items: ['Amazon D&O Policy', 'Staples Workers Comp', 'RPW Group Liability'] },
      { title: 'LOW RISK', items: ['Small Business Policies', 'Standard Renewals', 'Routine Reviews'] },
      { title: 'ARCHIVED', items: ['2024 Completed Policies', 'Historical Claims', 'Past Assessments'] }
    ];
    
    if (drawerIndex >= 0 && drawerIndex < drawerContents.length) {
      const content = drawerContents[drawerIndex];
      // Add to voice messages to show the contents
      this.voiceMessages.push({
        text: `📁 ${content.title} Drawer Contents:\n${content.items.join('\n• ')}`,
        type: 'ai'
      });
      
      // Show the voice assistant panel if not visible
      if (!this.showVoiceAssistant) {
        this.showVoiceAssistant = true;
      }
    }
  }
  
  private showCityDetails(cityData: any): void {
    // Add city details to chat panel
    const message = `🌍 ${cityData.name} Insurance Portfolio:
    
📊 Active Policies: ${cityData.policies}
💰 Total Premium: ${cityData.premium}
⚠️ Risk Level: ${cityData.risk}
📝 Recent Claims: ${cityData.claims}
    
${cityData.risk === 'High' ? '⚠️ HIGH RISK: This region requires immediate attention!' : 
  cityData.risk === 'Medium' ? '📊 MEDIUM RISK: Monitor closely for changes.' : 
  '✅ LOW RISK: Region performing well.'}`;
    
    this.voiceMessages.push({
      text: message,
      type: 'ai'
    });
    
    // Show the voice assistant panel if not visible
    if (!this.showVoiceAssistant) {
      this.showVoiceAssistant = true;
    }
  }
}