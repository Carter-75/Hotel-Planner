import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appHorizontalScroll]',
  standalone: true
})
export class HorizontalScrollDirective implements OnInit, OnDestroy {
  private el: HTMLElement;

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.el.addEventListener('wheel', this.onWheel, { passive: false });
  }

  private isScrolling = false;

  private onWheel = (event: WheelEvent) => {
    // If we have vertical movement, redirect it horizontally
    if (event.deltaY !== 0) {
      event.preventDefault();

      // Debounce to prevent one flick from skipping 10 reviews
      if (this.isScrolling) return;
      this.isScrolling = true;

      const direction = event.deltaY > 0 ? 1 : -1;
      const cardWidth = this.el.clientWidth;
      
      // Calculate current slide index
      const currentIndex = Math.round(this.el.scrollLeft / cardWidth);
      const targetIndex = currentIndex + direction;

      this.el.scrollTo({
        left: targetIndex * cardWidth,
        behavior: 'smooth'
      });

      // 300ms cooldown for natural feel
      setTimeout(() => {
        this.isScrolling = false;
      }, 300);
    }
  };

  ngOnDestroy() {
    this.el.removeEventListener('wheel', this.onWheel);
  }
}
