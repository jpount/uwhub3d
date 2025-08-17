import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeRendererService {
  private renderer!: THREE.WebGLRenderer;
  private composer!: EffectComposer;
  
  constructor() {}
  
  initRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    return this.renderer;
  }
  
  initPostProcessing(scene: THREE.Scene, camera: THREE.Camera): EffectComposer {
    this.composer = new EffectComposer(this.renderer);
    
    // Render pass
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);
    
    // Bloom pass for glow effects
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    this.composer.addPass(bloomPass);
    
    return this.composer;
  }
  
  resize(width: number, height: number): void {
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
    
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }
  
  render(scene: THREE.Scene, camera: THREE.Camera): void {
    if (this.composer) {
      this.composer.render();
    } else if (this.renderer) {
      this.renderer.render(scene, camera);
    }
  }
  
  dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.composer) {
      this.composer.passes.forEach(pass => {
        if ((pass as any).dispose) {
          (pass as any).dispose();
        }
      });
    }
  }
  
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
  
  getComposer(): EffectComposer {
    return this.composer;
  }
}