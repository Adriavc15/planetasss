// Configuración del Sistema Solar 3D
const SolarSystemConfig = {
  // Configuración general
  general: {
    title: "Sistema Solar 3D",
    version: "1.0.0",
    author: "Desarrollador",
    description: "Exploración interactiva del sistema solar"
  },

  // Configuración de renderizado
  rendering: {
    fps: 60,
    antialiasing: true,
    shadows: true,
    bloom: true,
    motionBlur: false,
    depthOfField: false
  },

  // Configuración de la cámara
  camera: {
    defaultDistance: 50,
    minDistance: 10,
    maxDistance: 200,
    fov: 45,
    near: 0.1,
    far: 1000,
    sensitivity: 0.5
  },

  // Configuración de planetas con colores mejorados y más identificables
  planets: {
    sun: {
      name: "Sol",
      radius: 5,
      distance: 0,
      color: [1.0, 0.8, 0.0], // Amarillo dorado brillante
      speed: 0.01,
      texture: null,
      hasRings: false,
      id: [1.0, 0.0, 0.0], // Rojo para identificación
      description: "Estrella central del sistema solar",
      facts: {
        type: "Enana amarilla",
        diameter: "1.392.700 km",
        temperature: "5.778 K",
        mass: "1.989 × 10³⁰ kg"
      }
    },
    mercury: {
      name: "Mercurio",
      radius: 0.8,
      distance: 8,
      color: [0.6, 0.6, 0.6], // Gris metálico
      speed: 0.04,
      texture: null,
      hasRings: false,
      id: [0.0, 1.0, 0.0], // Verde para identificación
      description: "Planeta más cercano al Sol",
      facts: {
        distance: "57.9 millones km",
        orbitalPeriod: "88 días",
        diameter: "4.879 km",
        temperature: "-180°C a 430°C"
      }
    },
    venus: {
      name: "Venus",
      radius: 1.2,
      distance: 12,
      color: [0.9, 0.7, 0.4], // Naranja dorado
      speed: 0.015,
      texture: null,
      hasRings: false,
      id: [0.0, 0.0, 1.0], // Azul para identificación
      description: "Planeta gemelo de la Tierra",
      facts: {
        distance: "108.2 millones km",
        orbitalPeriod: "225 días",
        diameter: "12.104 km",
        temperature: "462°C (superficie)"
      }
    },
    earth: {
      name: "Tierra",
      radius: 1.3,
      distance: 16,
      color: [0.2, 0.6, 1.0], // Azul oceánico
      speed: 0.01,
      texture: null,
      hasRings: false,
      id: [1.0, 1.0, 0.0], // Amarillo para identificación
      description: "Nuestro hogar en el universo",
      facts: {
        distance: "149.6 millones km",
        orbitalPeriod: "365.25 días",
        diameter: "12.742 km",
        satellites: "1 (Luna)"
      }
    },
    mars: {
      name: "Marte",
      radius: 1.0,
      distance: 20,
      color: [0.8, 0.2, 0.2], // Rojo marciano
      speed: 0.008,
      texture: null,
      hasRings: false,
      id: [1.0, 0.0, 1.0], // Magenta para identificación
      description: "El planeta rojo",
      facts: {
        distance: "227.9 millones km",
        orbitalPeriod: "687 días",
        diameter: "6.780 km",
        satellites: "2 (Fobos, Deimos)"
      }
    },
    jupiter: {
      name: "Júpiter",
      radius: 3.0,
      distance: 28,
      color: [0.8, 0.6, 0.4], // Marrón jupiteriano
      speed: 0.002,
      texture: null,
      hasRings: false,
      id: [0.0, 1.0, 1.0], // Cian para identificación
      description: "El planeta más grande",
      facts: {
        distance: "778.5 millones km",
        orbitalPeriod: "12 años",
        diameter: "139.820 km",
        satellites: "79 conocidos"
      }
    },
    saturn: {
      name: "Saturno",
      radius: 2.5,
      distance: 36,
      color: [0.9, 0.8, 0.6], // Dorado saturniano
      speed: 0.0009,
      texture: null,
      hasRings: true,
      id: [0.5, 0.5, 0.0], // Verde amarillento para identificación
      description: "Señor de los anillos",
      facts: {
        distance: "1.434 millones km",
        orbitalPeriod: "29.5 años",
        diameter: "116.460 km",
        rings: "Sí, muy visibles"
      }
    },
    uranus: {
      name: "Urano",
      radius: 1.8,
      distance: 44,
      color: [0.4, 0.7, 0.8], // Azul verdoso uraniano
      speed: 0.0004,
      texture: null,
      hasRings: true,
      id: [0.5, 0.0, 0.5], // Púrpura para identificación
      description: "Planeta inclinado",
      facts: {
        distance: "2.871 millones km",
        orbitalPeriod: "84 años",
        diameter: "50.724 km",
        inclination: "97.8°"
      }
    },
    neptune: {
      name: "Neptuno",
      radius: 1.7,
      distance: 52,
      color: [0.2, 0.4, 0.8], // Azul profundo neptuniano
      speed: 0.0001,
      texture: null,
      hasRings: true,
      id: [0.0, 0.5, 0.5], // Verde azulado para identificación
      description: "El planeta más lejano",
      facts: {
        distance: "4.495 millones km",
        orbitalPeriod: "165 años",
        diameter: "49.244 km",
        winds: "Hasta 2.100 km/h"
      }
    }
  },

  // Configuración de estrellas de fondo
  stars: {
    count: 1000,
    minBrightness: 0.3,
    maxBrightness: 1.0,
    twinkleSpeed: 3,
    distribution: "random"
  },

  // Configuración de órbitas
  orbits: {
    visible: true,
    opacity: 0.3,
    color: [0.3, 0.3, 0.3],
    segments: 64,
    thickness: 1
  },

  // Configuración de efectos
  effects: {
    sunGlow: true,
    planetGlow: false,
    ringGlow: true,
    starTwinkle: true,
    bloomIntensity: 0.5,
    motionBlurStrength: 0.1
  },

  // Configuración de controles
  controls: {
    autoRotate: true,
    defaultSpeed: 5,
    minSpeed: 0,
    maxSpeed: 10,
    speedStep: 0.1,
    enableZoom: true,
    enablePan: true,
    enableRotate: true
  },

  // Configuración de UI
  ui: {
    showFPS: true,
    showStats: true,
    showInfoPanel: true,
    showControls: true,
    showSpeedControl: true,
    theme: "dark",
    language: "es"
  },

  // Configuración de animaciones
  animations: {
    loadingDuration: 2000,
    transitionDuration: 0.3,
    hoverScale: 1.02,
    clickScale: 0.98,
    smoothTransitions: true
  },

  // Configuración de sonido (futuro)
  audio: {
    enabled: false,
    volume: 0.5,
    ambientSounds: false,
    planetSounds: false,
    uiSounds: false
  },

  // Configuración de exportación
  export: {
    screenshotQuality: 0.9,
    videoFPS: 30,
    videoDuration: 10,
    format: "png"
  },

  // Configuración de rendimiento
  performance: {
    maxFPS: 60,
    targetFPS: 60,
    adaptiveQuality: true,
    lowQualityMode: false,
    mobileOptimization: true
  }
};

// Funciones de utilidad para la configuración
const ConfigUtils = {
  // Obtener configuración de un planeta
  getPlanetConfig(planetName) {
    return SolarSystemConfig.planets[planetName] || null;
  },

  // Obtener todos los planetas
  getAllPlanets() {
    return Object.keys(SolarSystemConfig.planets);
  },

  // Verificar si un planeta tiene anillos
  hasRings(planetName) {
    const planet = this.getPlanetConfig(planetName);
    return planet ? planet.hasRings : false;
  },

  // Obtener configuración de renderizado
  getRenderingConfig() {
    return SolarSystemConfig.rendering;
  },

  // Obtener configuración de la cámara
  getCameraConfig() {
    return SolarSystemConfig.camera;
  },

  // Actualizar configuración
  updateConfig(path, value) {
    const keys = path.split('.');
    let current = SolarSystemConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  },

  // Guardar configuración en localStorage
  saveConfig() {
    try {
      localStorage.setItem('solarSystemConfig', JSON.stringify(SolarSystemConfig));
      return true;
    } catch (error) {
      console.error('Error guardando configuración:', error);
      return false;
    }
  },

  // Cargar configuración desde localStorage
  loadConfig() {
    try {
      const saved = localStorage.getItem('solarSystemConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(SolarSystemConfig, parsed);
        return true;
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
    return false;
  },

  // Restablecer configuración por defecto
  resetConfig() {
    localStorage.removeItem('solarSystemConfig');
    location.reload();
  },

  // Obtener configuración para dispositivos móviles
  getMobileConfig() {
    return {
      ...SolarSystemConfig,
      performance: {
        ...SolarSystemConfig.performance,
        mobileOptimization: true,
        maxFPS: 30
      },
      stars: {
        ...SolarSystemConfig.stars,
        count: 500
      }
    };
  },

  // Verificar si es un dispositivo móvil
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SolarSystemConfig, ConfigUtils };
} 