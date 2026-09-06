import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appTiltCard]'
})
export class TiltCard {
  private readonly maxRotation = 5;

  constructor(
    private readonly elementRef:
      ElementRef<HTMLElement>,

    private readonly renderer:
      Renderer2
  ) {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'transform-style',
      'preserve-3d'
    );

    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'transition',
      'transform 180ms ease, box-shadow 250ms ease'
    );

    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'will-change',
      'transform'
    );
  }

  @HostListener(
    'mousemove',
    ['$event']
  )
  onMouseMove(
    event: MouseEvent
  ): void {
    if (
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
    ) {
      return;
    }

    const element =
      this.elementRef.nativeElement;

    const rect =
      element.getBoundingClientRect();

    const x =
      event.clientX -
      rect.left;

    const y =
      event.clientY -
      rect.top;

    const centerX =
      rect.width / 2;

    const centerY =
      rect.height / 2;

    const rotateY =
      ((x - centerX) /
        centerX) *
      this.maxRotation;

    const rotateX =
      -(
        (y - centerY) /
        centerY
      ) *
      this.maxRotation;

    this.renderer.setStyle(
      element,
      'transform',
      `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-6px)
      `
    );
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'transform',
      `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        translateY(0)
      `
    );
  }
}