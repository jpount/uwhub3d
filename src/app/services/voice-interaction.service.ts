import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoiceInteractionService {
  private speechRecognition: any;
  private speechSynthesis: SpeechSynthesis;
  private voiceCommandSubject = new Subject<string>();
  private isListening = false;
  
  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.initSpeechRecognition();
  }
  
  private initSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-US';
      
      this.speechRecognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        if (event.results[event.results.length - 1].isFinal) {
          this.voiceCommandSubject.next(transcript);
        }
      };
      
      this.speechRecognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
      };
      
      this.speechRecognition.onend = () => {
        this.isListening = false;
      };
    }
  }
  
  startListening(): void {
    if (this.speechRecognition && !this.isListening) {
      this.speechRecognition.start();
      this.isListening = true;
    }
  }
  
  stopListening(): void {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop();
      this.isListening = false;
    }
  }
  
  speak(text: string, voice?: string): void {
    if (this.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Set voice if specified
      if (voice) {
        const voices = this.speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.name === voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      this.speechSynthesis.speak(utterance);
    }
  }
  
  stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }
  
  getVoiceCommands(): Observable<string> {
    return this.voiceCommandSubject.asObservable();
  }
  
  isListeningActive(): boolean {
    return this.isListening;
  }
}