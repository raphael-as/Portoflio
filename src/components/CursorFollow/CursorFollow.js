import { useEffect, useState, useContext } from "react";
import { ThemeContext } from '../../contexts/ThemeContext';

function useCursorFollow({
  isEnabled,
  size = 16,
  borderRadius = "50%",
  easingFactor = 0.15,
  hideCursor = true,
  transitionSpeed = 300,
}) {
  const { theme } = useContext(ThemeContext);
  
  useEffect(() => {
    if (!isEnabled) return;
    
    const color = theme?.primary600 || '#3b82f6';
    
    // Créer le curseur personnalisé
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    
    // Styles de base
    Object.assign(cursor.style, {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: borderRadius,
      backgroundColor: color,
      position: "fixed",
      top: "0",
      left: "0",
      pointerEvents: "none",
      zIndex: "999999",
      opacity: "1",
      transition: `width ${transitionSpeed}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                   height ${transitionSpeed}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                   border-radius ${transitionSpeed}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                   opacity ${transitionSpeed}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      willChange: "transform"
    });
    
    document.body.appendChild(cursor);
    
    // Cacher le curseur natif
    if (hideCursor) {
      document.body.style.cursor = "none";
      // Appliquer aussi sur tous les éléments
      const style = document.createElement('style');
      style.innerHTML = '* { cursor: none !important; }';
      style.id = 'custom-cursor-style';
      document.head.appendChild(style);
    }
    
    // Variables de position
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isHoveringInteractive = false;
    let currentSize = size;
    
    // Gestion du mouvement de la souris
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Détecter les éléments interactifs
      const target = e.target;
      const isInteractive = checkIfInteractive(target);
      
      if (isInteractive && !isHoveringInteractive) {
        isHoveringInteractive = true;
        currentSize = size * 2.5;
        cursor.style.width = `${currentSize}px`;
        cursor.style.height = `${currentSize}px`;
        cursor.style.borderRadius = "50%";
        cursor.style.opacity = "0.6";
      } else if (!isInteractive && isHoveringInteractive) {
        isHoveringInteractive = false;
        currentSize = size;
        cursor.style.width = `${size}px`;
        cursor.style.height = `${size}px`;
        cursor.style.borderRadius = borderRadius;
        cursor.style.opacity = "1";
      }
    };
    
    // Vérifier si un élément est interactif
    const checkIfInteractive = (element) => {
      if (!element || !element.tagName) return false;
      
      const tagName = element.tagName?.toLowerCase();
      const interactiveTags = ['button', 'a', 'input', 'textarea', 'select', 'label'];
      
      // Vérifier le tag
      if (interactiveTags.includes(tagName)) return true;
      
      // Vérifier les attributs et propriétés
      if (element.onclick || 
          element.type === 'submit' || 
          element.role === 'button') return true;
      
      // Vérifier getAttribute seulement si la méthode existe
      if (typeof element.getAttribute === 'function' && 
          element.getAttribute('role') === 'button') return true;
      
      // Vérifier le cursor CSS
      try {
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.cursor === 'pointer') return true;
      } catch (e) {
        // Ignorer les erreurs de getComputedStyle
      }
      
      // Vérifier les parents proches
      if (typeof element.closest === 'function' &&
          element.closest('button, a, input, textarea, select, [role="button"]')) return true;
      
      return false;
    };
    
    // Animation frame
    let animationId;
    const animate = () => {
      // Interpolation smooth
      const dx = mouseX - currentX;
      const dy = mouseY - currentY;
      
      currentX += dx * easingFactor;
      currentY += dy * easingFactor;
      
      // Appliquer la transformation (centré sur le curseur)
      cursor.style.transform = `translate3d(${currentX - currentSize / 2}px, ${currentY - currentSize / 2}px, 0)`;
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Démarrer l'animation
    document.addEventListener("mousemove", handleMouseMove);
    animate();
    
    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
      cursor.remove();
      
      if (hideCursor) {
        document.body.style.cursor = "";
        const style = document.getElementById('custom-cursor-style');
        if (style) style.remove();
      }
    };
  }, [isEnabled, size, borderRadius, easingFactor, transitionSpeed, hideCursor, theme]);
}

function CursorFollow() {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    // Vérifier l'environnement
    if (typeof window === "undefined") {
      setEnabled(false);
      return;
    }
    
    // Détecter si c'est un appareil mobile/tactile
    const isTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };
    
    // Détecter si c'est un pointer grossier (doigt vs souris)
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    
    // Activer uniquement sur desktop avec souris précise
    if (isTouchDevice() || isCoarsePointer) {
      setEnabled(false);
    } else {
      setEnabled(true);
    }
  }, []);
  
  useCursorFollow({
    isEnabled: enabled,
    size: 16,
    borderRadius: "50%",
    easingFactor: 0.18,
    hideCursor: true,
    transitionSpeed: 350,
  });
  
  return null;
}

export default CursorFollow;