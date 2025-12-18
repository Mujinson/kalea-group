import { useScroll, useTransform, MotionValue } from "framer-motion";
import { RefObject } from "react";
import { useIsMobile } from "./use-mobile";

interface HitobaScrollOptions {
  /** Scroll offset configuration */
  offset?: ["start start" | "start end" | "end start" | "end end", "start start" | "start end" | "end start" | "end end"];
  /** Scale range: [start, end] */
  scaleRange?: [number, number];
  /** Border radius range in pixels: [start, end] */
  borderRadiusRange?: [number, number];
  /** Parallax Y movement percentage: [start, end] */
  parallaxRange?: [string, string];
  /** Content opacity range: [start, end] */
  contentOpacityRange?: [number, number];
  /** Content Y movement in pixels: [start, end] */
  contentYRange?: [number, number];
  /** Whether to disable effects on mobile */
  disableOnMobile?: boolean;
  /** Use simplified effects on mobile */
  simplifiedOnMobile?: boolean;
}

interface HitobaScrollResult {
  scrollYProgress: MotionValue<number>;
  scale: MotionValue<number>;
  borderRadius: MotionValue<string>;
  imageY: MotionValue<string>;
  contentOpacity: MotionValue<number>;
  contentY: MotionValue<number>;
  overlayOpacity: MotionValue<number>;
  isMobile: boolean;
  shouldAnimate: boolean;
}

export function useHitobaScroll(
  ref: RefObject<HTMLElement>,
  options: HitobaScrollOptions = {}
): HitobaScrollResult {
  const isMobile = useIsMobile();
  
  const {
    offset = ["start start", "end start"],
    scaleRange = [1, 0.88],
    borderRadiusRange = [0, 24],
    parallaxRange = ["0%", "15%"],
    contentOpacityRange = [1, 0],
    contentYRange = [0, -80],
    disableOnMobile = false,
    simplifiedOnMobile = true,
  } = options;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset,
  });

  // Calculate effective ranges based on mobile settings
  const effectiveScaleRange = isMobile && simplifiedOnMobile 
    ? [1, 0.95] as [number, number]
    : scaleRange;
  
  const effectiveBorderRadiusRange = isMobile && simplifiedOnMobile
    ? [0, 16] as [number, number]
    : borderRadiusRange;
  
  const effectiveParallaxRange = isMobile && simplifiedOnMobile
    ? ["0%", "8%"] as [string, string]
    : parallaxRange;

  const effectiveContentYRange = isMobile && simplifiedOnMobile
    ? [0, -40] as [number, number]
    : contentYRange;

  const shouldAnimate = !(isMobile && disableOnMobile);

  // Transform values
  const scale = useTransform(
    scrollYProgress, 
    [0, 1], 
    shouldAnimate ? effectiveScaleRange : [1, 1]
  );
  
  const borderRadius = useTransform(
    scrollYProgress, 
    [0, 0.5], 
    shouldAnimate 
      ? [`${effectiveBorderRadiusRange[0]}px`, `${effectiveBorderRadiusRange[1]}px`]
      : ["0px", "0px"]
  );
  
  const imageY = useTransform(
    scrollYProgress, 
    [0, 1], 
    shouldAnimate ? effectiveParallaxRange : ["0%", "0%"]
  );
  
  const contentOpacity = useTransform(
    scrollYProgress, 
    [0, 0.3], 
    shouldAnimate ? contentOpacityRange : [1, 1]
  );
  
  const contentY = useTransform(
    scrollYProgress, 
    [0, 0.4], 
    shouldAnimate ? effectiveContentYRange : [0, 0]
  );

  const overlayOpacity = useTransform(
    scrollYProgress, 
    [0, 0.5], 
    [1, 0.6]
  );

  return {
    scrollYProgress,
    scale,
    borderRadius,
    imageY,
    contentOpacity,
    contentY,
    overlayOpacity,
    isMobile,
    shouldAnimate,
  };
}