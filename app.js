// Sistema Solar 3D - Aplicación Principal
class SolarSystem {
  constructor() {
    this.canvas = document.getElementById('solarSystem');
    this.gl = this.canvas.getContext('webgl2');
    this.isRunning = true;
    this.speed = 5;
    this.currentPlanet = 'sun';
    // Variables de cámara para rotación
    this.camera = {
      distance: 50,
      azimuth: Math.PI / 4, // ángulo horizontal
      elevation: Math.PI / 6, // ángulo vertical
      target: { x: 0, y: 0, z: 0 }
    };
    this.cameraPos = { x: 0, y: 0, z: 0 };
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };
    this.planets = {};
    this.stars = [];
    this.orbits = [];
    this.selectedPlanet = null;
    this.raycaster = {
      mouse: { x: 0, y: 0 },
      camera: null,
      raycaster: null
    };
    
    this.init();
  }

  init() {
    this.setupCanvas();
    this.createShaders();
    this.createPlanets();
    this.createStars();
    this.createOrbits();
    this.setupEventListeners();
    this.startLoading();
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  createShaders() {
    // Vertex shader mejorado
    const vertexShaderSource = `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      attribute vec2 aTexCoord;
      
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform float uTime;
      uniform float uSelected;
      uniform float uHovered;
      uniform float uPulseEffect;
      uniform vec3 uPlanetId;
      
      varying vec3 vColor;
      varying vec2 vTexCoord;
      varying float vSelected;
      varying float vHovered;
      varying float vPulseEffect;
      varying vec3 vPlanetId;
      
      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
        vColor = aColor;
        vTexCoord = aTexCoord;
        vSelected = uSelected;
        vHovered = uHovered;
        vPulseEffect = uPulseEffect;
        vPlanetId = uPlanetId;
      }
    `;

    // Fragment shader mejorado
    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec3 vColor;
      varying vec2 vTexCoord;
      varying float vSelected;
      varying float vHovered;
      varying float vPulseEffect;
      varying vec3 vPlanetId;
      uniform float uTime;
      
      void main() {
        vec3 color = vColor;
        
        // Efecto de selección - borde brillante
        if (vSelected > 0.5) {
          float edge = length(vTexCoord - vec2(0.5));
          if (edge > 0.4) {
            color = mix(color, vec3(1.0, 1.0, 0.0), 0.8);
          }
        }
        
        // Efecto de hover - brillo suave
        if (vHovered > 0.5) {
          color = mix(color, vec3(1.0, 1.0, 1.0), 0.3);
        }
        
        // Efecto de pulso - expansión
        if (vPulseEffect > 0.0) {
          float pulse = sin(uTime * 10.0) * 0.5 + 0.5;
          color = mix(color, vec3(1.0, 1.0, 0.0), pulse * vPulseEffect * 0.5);
        }
        
        // Efecto de brillo para el sol
        if (vColor.r > 0.8 && vColor.g > 0.6) {
          float glow = sin(uTime * 2.0) * 0.2 + 0.8;
          color = vColor * glow;
        }
        
        // Efecto de anillos para Saturno
        if (vColor.b > 0.7 && vColor.r < 0.3) {
          float ring = abs(sin(vTexCoord.x * 10.0 + uTime));
          color = mix(color, vec3(0.8, 0.7, 0.5), ring * 0.3);
        }
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    this.vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    this.fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.program = this.createProgram(this.vertexShader, this.fragmentShader);
    this.gl.useProgram(this.program);
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Error compilando shader:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  createProgram(vertexShader, fragmentShader) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Error enlazando programa:', this.gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  createPlanets() {
    // Colores mejorados y más identificables para cada planeta
    const planetData = {
      sun: { 
        radius: 5, 
        distance: 0, 
        color: [1.0, 0.8, 0.0], // Amarillo dorado brillante
        speed: 0.01,
        id: [1.0, 0.0, 0.0] // Rojo para identificación
      },
      mercury: { 
        radius: 0.8, 
        distance: 8, 
        color: [0.6, 0.6, 0.6], // Gris metálico
        speed: 0.04,
        id: [0.0, 1.0, 0.0] // Verde para identificación
      },
      venus: { 
        radius: 1.2, 
        distance: 12, 
        color: [0.9, 0.7, 0.4], // Naranja dorado
        speed: 0.015,
        id: [0.0, 0.0, 1.0] // Azul para identificación
      },
      earth: { 
        radius: 1.3, 
        distance: 16, 
        color: [0.2, 0.6, 1.0], // Azul oceánico
        speed: 0.01,
        id: [1.0, 1.0, 0.0] // Amarillo para identificación
      },
      mars: { 
        radius: 1.0, 
        distance: 20, 
        color: [0.8, 0.2, 0.2], // Rojo marciano
        speed: 0.008,
        id: [1.0, 0.0, 1.0] // Magenta para identificación
      },
      jupiter: { 
        radius: 3.0, 
        distance: 28, 
        color: [0.8, 0.6, 0.4], // Marrón jupiteriano
        speed: 0.002,
        id: [0.0, 1.0, 1.0] // Cian para identificación
      },
      saturn: { 
        radius: 2.5, 
        distance: 36, 
        color: [0.9, 0.8, 0.6], // Dorado saturniano
        speed: 0.0009,
        id: [0.5, 0.5, 0.0] // Verde amarillento para identificación
      },
      uranus: { 
        radius: 1.8, 
        distance: 44, 
        color: [0.4, 0.7, 0.8], // Azul verdoso uraniano
        speed: 0.0004,
        id: [0.5, 0.0, 0.5] // Púrpura para identificación
      },
      neptune: { 
        radius: 1.7, 
        distance: 52, 
        color: [0.2, 0.4, 0.8], // Azul profundo neptuniano
        speed: 0.0001,
        id: [0.0, 0.5, 0.5] // Verde azulado para identificación
      }
    };

    for (const [name, data] of Object.entries(planetData)) {
      this.planets[name] = {
        ...data,
        angle: Math.random() * Math.PI * 2,
        vertices: this.createSphere(data.radius, 32, 16),
        colors: this.createColors(data.color, 32 * 16),
        texCoords: this.createTexCoords(32, 16),
        idColors: this.createColors(data.id, 32 * 16),
        isSelected: false
      };
    }
  }

  createSphere(radius, latSegments, lonSegments) {
    const vertices = [];
    
    for (let lat = 0; lat <= latSegments; lat++) {
      const theta = lat * Math.PI / latSegments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      for (let lon = 0; lon <= lonSegments; lon++) {
        const phi = lon * 2 * Math.PI / lonSegments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        
        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;
        
        vertices.push(x * radius, y * radius, z * radius);
      }
    }
    
    return vertices;
  }

  createColors(color, count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(...color);
    }
    return colors;
  }

  createTexCoords(latSegments, lonSegments) {
    const texCoords = [];
    
    for (let lat = 0; lat <= latSegments; lat++) {
      for (let lon = 0; lon <= lonSegments; lon++) {
        const u = lon / lonSegments;
        const v = lat / latSegments;
        texCoords.push(u, v);
      }
    }
    
    return texCoords;
  }

  createStars() {
    for (let i = 0; i < 1000; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 200,
        brightness: Math.random()
      });
    }
  }

  createOrbits() {
    for (const [name, planet] of Object.entries(this.planets)) {
      if (name !== 'sun') {
        const orbitPoints = [];
        for (let i = 0; i <= 64; i++) {
          const angle = (i / 64) * Math.PI * 2;
          orbitPoints.push(
            Math.cos(angle) * planet.distance,
            0,
            Math.sin(angle) * planet.distance
          );
        }
        this.orbits.push({
          points: orbitPoints,
          color: [0.3, 0.3, 0.3],
          planetName: name
        });
      }
    }
  }

  setupEventListeners() {
    // Controles de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const view = e.target.dataset.view;
        this.changeView(view);
      });
    });

    // Controles de reproducción
    document.getElementById('playPauseBtn').addEventListener('click', () => {
      this.isRunning = !this.isRunning;
      const btn = document.getElementById('playPauseBtn');
      if (this.isRunning) {
        btn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
      } else {
        btn.innerHTML = '<i class="fas fa-play"></i> Reproducir';
      }
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      this.resetSystem();
    });

    document.getElementById('fullscreenBtn').addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Control de velocidad
    document.getElementById('speedSlider').addEventListener('input', (e) => {
      this.speed = parseFloat(e.target.value);
    });

    // Redimensionamiento de ventana
    window.addEventListener('resize', () => {
      this.setupCanvas();
    });

    // Clicks en planetas
    this.canvas.addEventListener('click', (e) => {
      this.handlePlanetClick(e);
    });

    // Mouse move para hover effects
    this.canvas.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });

    // Rotación de cámara con mouse
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouse.x = e.clientX;
      this.lastMouse.y = e.clientY;
    });
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        this.lastMouse.x = e.clientX;
        this.lastMouse.y = e.clientY;
        // Sensibilidad
        this.camera.azimuth -= dx * 0.01;
        this.camera.elevation -= dy * 0.01;
        // Limitar elevación
        this.camera.elevation = Math.max(0.1, Math.min(Math.PI - 0.1, this.camera.elevation));
      }
    });
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    // Zoom con rueda del mouse
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camera.distance += e.deltaY * 0.05;
      this.camera.distance = Math.max(10, Math.min(200, this.camera.distance));
    });
  }

  handlePlanetClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const clickedPlanet = this.raycastPlanet(mouseX, mouseY);
    if (clickedPlanet) {
      this.addClickEffect(clickedPlanet);
      this.selectPlanet(clickedPlanet);
      this.showPlanetInfo(clickedPlanet); // SIEMPRE mostrar info
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const hoveredPlanet = this.raycastPlanet(mouseX, mouseY);
    for (const [name, planet] of Object.entries(this.planets)) {
      planet.isHovered = (name === hoveredPlanet);
    }
    this.canvas.style.cursor = hoveredPlanet ? 'pointer' : 'grab';
  }

  raycastPlanet(mouseX, mouseY) {
    // Convertir mouse a NDC (-1 a 1)
    const x = (mouseX / this.canvas.width) * 2 - 1;
    const y = -((mouseY / this.canvas.height) * 2 - 1);

    // Matriz de proyección y vista
    const aspect = this.canvas.width / this.canvas.height;
    const projection = this.perspectiveMatrix(45, aspect, 0.1, 1000);
    const view = this.lookAtMatrix(
      this.cameraPos.x, this.cameraPos.y, this.cameraPos.z,
      this.camera.target.x, this.camera.target.y, this.camera.target.z,
      0, 1, 0
    );
    const invProj = this.inverseMatrix(projection);
    const invView = this.inverseMatrix(view);

    // Rayo en espacio de cámara
    let rayClip = [x, y, -1, 1];
    let rayEye = this.multiplyVec4(invProj, rayClip);
    rayEye = [rayEye[0], rayEye[1], -1, 0];
    // Rayo en espacio mundo
    let rayWorld = this.multiplyVec4(invView, rayEye);
    const rayDir = this.normalize([rayWorld[0], rayWorld[1], rayWorld[2]]);
    const rayOrigin = [this.cameraPos.x, this.cameraPos.y, this.cameraPos.z];

    // Buscar el planeta más cercano intersectado
    let closest = null;
    let minT = Infinity;
    for (const [name, planet] of Object.entries(this.planets)) {
      let px = 0, py = 0, pz = 0;
      if (name !== 'sun') {
        px = Math.cos(planet.angle) * planet.distance;
        pz = Math.sin(planet.angle) * planet.distance;
      }
      // Intersección rayo-esfera
      const oc = [rayOrigin[0] - px, rayOrigin[1] - py, rayOrigin[2] - pz];
      const a = this.dot(rayDir, rayDir);
      const b = 2.0 * this.dot(oc, rayDir);
      const c = this.dot(oc, oc) - planet.radius * planet.radius;
      const discriminant = b * b - 4 * a * c;
      if (discriminant > 0) {
        const t = (-b - Math.sqrt(discriminant)) / (2.0 * a);
        if (t > 0 && t < minT) {
          minT = t;
          closest = name;
        }
      }
    }
    return closest;
  }

  changeView(view) {
    switch(view) {
      case 'solar':
        this.camera.z = 50;
        this.camera.targetX = 0;
        this.camera.targetY = 0;
        this.camera.targetZ = 0;
        break;
      case 'planets':
        this.camera.z = 30;
        this.camera.targetX = 0;
        this.camera.targetY = 0;
        this.camera.targetZ = 0;
        break;
      case 'orbits':
        this.camera.z = 80;
        this.camera.targetX = 0;
        this.camera.targetY = 0;
        this.camera.targetZ = 0;
        break;
      case 'info':
        this.showPlanetInfo(this.currentPlanet);
        break;
    }
  }

  selectPlanet(planetName) {
    // Deseleccionar planeta anterior
    if (this.selectedPlanet) {
      this.planets[this.selectedPlanet].isSelected = false;
      this.planets[this.selectedPlanet].selectionTime = null;
    }
    
    // Seleccionar nuevo planeta
    this.selectedPlanet = planetName;
    this.planets[planetName].isSelected = true;
    this.planets[planetName].selectionTime = Date.now();
    this.currentPlanet = planetName;
    
    // Actualizar panel de información
    this.updateInfoPanel(planetName);
    
    // Efecto de sonido (opcional)
    this.playSelectionSound();
  }

  updateInfoPanel(planetName) {
    document.querySelectorAll('.planet-info').forEach(info => {
      info.classList.remove('active');
    });
    
    const planetInfo = document.querySelector(`[data-planet="${planetName}"]`);
    if (planetInfo) {
      planetInfo.classList.add('active');
    }
  }

  showPlanetInfo(planetName) {
    // Mostrar información detallada del planeta
    console.log(`Información de ${planetName}`);
    
    // Aquí podrías mostrar un modal con información más detallada
    this.showDetailedInfo(planetName);
  }

  showDetailedInfo(planetName) {
    const planet = this.planets[planetName];
    const planetNames = {
      sun: 'SOL',
      mercury: 'MERCURIO',
      venus: 'VENUS',
      earth: 'TIERRA',
      mars: 'MARTE',
      jupiter: 'JÚPITER',
      saturn: 'SATURNO',
      uranus: 'URANO',
      neptune: 'NEPTUNO'
    };

    // Crear modal de información detallada
    let modal = document.getElementById('planetModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'planetModal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(10px);
      `;
      document.body.appendChild(modal);
    }

    const planetData = {
      sun: {
        name: 'SOL',
        description: 'Estrella central del sistema solar',
        facts: {
          'Tipo': 'Enana amarilla',
          'Diámetro': '1.392.700 km',
          'Temperatura': '5.778 K',
          'Masa': '1.989 × 10³⁰ kg',
          'Edad': '4.6 mil millones de años',
          'Composición': 'Hidrógeno (73%), Helio (25%)'
        }
      },
      mercury: {
        name: 'MERCURIO',
        description: 'Planeta más cercano al Sol',
        facts: {
          'Distancia al Sol': '57.9 millones km',
          'Período orbital': '88 días',
          'Diámetro': '4.879 km',
          'Temperatura': '-180°C a 430°C',
          'Gravedad': '3.7 m/s²',
          'Satélites': '0'
        }
      },
      venus: {
        name: 'VENUS',
        description: 'Planeta gemelo de la Tierra',
        facts: {
          'Distancia al Sol': '108.2 millones km',
          'Período orbital': '225 días',
          'Diámetro': '12.104 km',
          'Temperatura': '462°C (superficie)',
          'Gravedad': '8.87 m/s²',
          'Satélites': '0'
        }
      },
      earth: {
        name: 'TIERRA',
        description: 'Nuestro hogar en el universo',
        facts: {
          'Distancia al Sol': '149.6 millones km',
          'Período orbital': '365.25 días',
          'Diámetro': '12.742 km',
          'Temperatura': '-88°C a 58°C',
          'Gravedad': '9.81 m/s²',
          'Satélites': '1 (Luna)'
        }
      },
      mars: {
        name: 'MARTE',
        description: 'El planeta rojo',
        facts: {
          'Distancia al Sol': '227.9 millones km',
          'Período orbital': '687 días',
          'Diámetro': '6.780 km',
          'Temperatura': '-140°C a 20°C',
          'Gravedad': '3.71 m/s²',
          'Satélites': '2 (Fobos, Deimos)'
        }
      },
      jupiter: {
        name: 'JÚPITER',
        description: 'El planeta más grande',
        facts: {
          'Distancia al Sol': '778.5 millones km',
          'Período orbital': '12 años',
          'Diámetro': '139.820 km',
          'Temperatura': '-110°C',
          'Gravedad': '24.79 m/s²',
          'Satélites': '79 conocidos'
        }
      },
      saturn: {
        name: 'SATURNO',
        description: 'Señor de los anillos',
        facts: {
          'Distancia al Sol': '1.434 millones km',
          'Período orbital': '29.5 años',
          'Diámetro': '116.460 km',
          'Temperatura': '-140°C',
          'Gravedad': '10.44 m/s²',
          'Anillos': 'Sí, muy visibles'
        }
      },
      uranus: {
        name: 'URANO',
        description: 'Planeta inclinado',
        facts: {
          'Distancia al Sol': '2.871 millones km',
          'Período orbital': '84 años',
          'Diámetro': '50.724 km',
          'Temperatura': '-195°C',
          'Gravedad': '8.69 m/s²',
          'Inclinación': '97.8°'
        }
      },
      neptune: {
        name: 'NEPTUNO',
        description: 'El planeta más lejano',
        facts: {
          'Distancia al Sol': '4.495 millones km',
          'Período orbital': '165 años',
          'Diámetro': '49.244 km',
          'Temperatura': '-200°C',
          'Gravedad': '11.15 m/s²',
          'Vientos': 'Hasta 2.100 km/h'
        }
      }
    };

    const data = planetData[planetName];
    const color = this.planets[planetName].color;
    const colorHex = `rgb(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)})`;

    modal.innerHTML = `
      <div style="
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid ${colorHex};
        border-radius: 20px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        backdrop-filter: blur(15px);
        box-shadow: 0 0 30px ${colorHex}40;
      ">
        <button onclick="this.parentElement.parentElement.remove()" style="
          position: absolute;
          top: 15px;
          right: 20px;
          background: none;
          border: none;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          z-index: 10;
        ">&times;</button>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: radial-gradient(circle, ${colorHex}, ${colorHex}80);
            margin: 0 auto 15px;
            box-shadow: 0 0 20px ${colorHex}60;
          "></div>
          <h2 style="
            font-family: 'Orbitron', monospace;
            font-size: 2rem;
            color: ${colorHex};
            margin-bottom: 10px;
            text-shadow: 0 0 10px ${colorHex}60;
          ">${data.name}</h2>
          <p style="color: #ccc; font-size: 1.1rem; margin-bottom: 20px;">${data.description}</p>
        </div>
        
        <div style="
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        ">
          <h3 style="color: #00d4ff; margin-bottom: 15px; font-family: 'Orbitron', monospace;">CARACTERÍSTICAS</h3>
          ${Object.entries(data.facts).map(([key, value]) => `
            <div style="
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            ">
              <span style="color: #ccc; font-weight: 500;">${key}:</span>
              <span style="color: #fff; font-weight: 600;">${value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  resetSystem() {
    for (const planet of Object.values(this.planets)) {
      planet.angle = 0;
      planet.isSelected = false;
    }
    this.selectedPlanet = null;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  startLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingProgress = document.getElementById('loadingProgress');
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          loadingScreen.style.opacity = '0';
          setTimeout(() => {
            loadingScreen.style.display = 'none';
            this.startAnimation();
          }, 500);
        }, 500);
      }
      loadingProgress.style.width = `${progress}%`;
    }, 100);
  }

  startAnimation() {
    let lastTime = 0;
    let frameCount = 0;
    let lastFpsUpdate = 0;
    
    const animate = (currentTime) => {
      if (!this.isRunning) {
        requestAnimationFrame(animate);
        return;
      }
      
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Actualizar FPS
      frameCount++;
      if (currentTime - lastFpsUpdate >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
        document.getElementById('fps').textContent = fps;
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }
      
      this.update(deltaTime);
      this.render();
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }

  update(deltaTime) {
    const time = deltaTime * 0.001 * this.speed;
    
    // Actualizar posiciones de planetas
    for (const [name, planet] of Object.entries(this.planets)) {
      if (name !== 'sun') {
        planet.angle += planet.speed * time;
        if (planet.angle > Math.PI * 2) {
          planet.angle -= Math.PI * 2;
        }
      }
    }
  }

  render() {
    this.updateCameraPosition();
    this.updateVisualEffects();
    
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    const aspect = this.canvas.width / this.canvas.height;
    const projectionMatrix = this.perspectiveMatrix(45, aspect, 0.1, 1000);
    const viewMatrix = this.lookAtMatrix(
      this.cameraPos.x, this.cameraPos.y, this.cameraPos.z,
      this.camera.target.x, this.camera.target.y, this.camera.target.z,
      0, 1, 0
    );
    
    // Renderizar estrellas de fondo
    this.renderStars(projectionMatrix, viewMatrix);
    
    // Renderizar órbitas
    this.renderOrbits(projectionMatrix, viewMatrix);
    
    // Renderizar planetas
    this.renderPlanets(projectionMatrix, viewMatrix);
    
    // Renderizar partículas
    this.renderParticles(projectionMatrix, viewMatrix);
  }

  renderStars(projectionMatrix, viewMatrix) {
    // Renderizado simple de estrellas como puntos
    for (const star of this.stars) {
      const modelMatrix = this.translationMatrix(star.x, star.y, star.z);
      const modelViewMatrix = this.multiplyMatrix(viewMatrix, modelMatrix);
      
      // Configurar shader para estrellas
      this.gl.uniformMatrix4fv(
        this.gl.getUniformLocation(this.program, 'uProjectionMatrix'),
        false,
        projectionMatrix
      );
      this.gl.uniformMatrix4fv(
        this.gl.getUniformLocation(this.program, 'uModelViewMatrix'),
        false,
        modelViewMatrix
      );
      this.gl.uniform1f(
        this.gl.getUniformLocation(this.program, 'uTime'),
        Date.now() * 0.001
      );
      
      // Renderizar punto de estrella
      const starVertices = new Float32Array([0, 0, 0]);
      const starBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, starBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, starVertices, this.gl.STATIC_DRAW);
      
      const positionLocation = this.gl.getAttribLocation(this.program, 'aPosition');
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
      
      this.gl.drawArrays(this.gl.POINTS, 0, 1);
    }
  }

  renderOrbits(projectionMatrix, viewMatrix) {
    for (const orbit of this.orbits) {
      const orbitBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, orbitBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(orbit.points), this.gl.STATIC_DRAW);
      
      const positionLocation = this.gl.getAttribLocation(this.program, 'aPosition');
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
      
      const modelViewMatrix = this.multiplyMatrix(viewMatrix, this.identityMatrix());
      
      this.gl.uniformMatrix4fv(
        this.gl.getUniformLocation(this.program, 'uProjectionMatrix'),
        false,
        projectionMatrix
      );
      this.gl.uniformMatrix4fv(
        this.gl.getUniformLocation(this.program, 'uModelViewMatrix'),
        false,
        modelViewMatrix
      );
      
      this.gl.drawArrays(this.gl.LINE_STRIP, 0, orbit.points.length / 3);
    }
  }

  renderPlanets(projectionMatrix, viewMatrix) {
    for (const [name, planet] of Object.entries(this.planets)) {
      let x = 0, z = 0;
      
      if (name !== 'sun') {
        x = Math.cos(planet.angle) * planet.distance;
        z = Math.sin(planet.angle) * planet.distance;
      }
      
      const modelMatrix = this.translationMatrix(x, 0, z);
      const modelViewMatrix = this.multiplyMatrix(viewMatrix, modelMatrix);
      
      // Configurar buffers
      const vertexBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(planet.vertices), this.gl.STATIC_DRAW);
      
      const colorBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(planet.colors), this.gl.STATIC_DRAW);
      
      const texCoordBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(planet.texCoords), this.gl.STATIC_DRAW);
      
      // Configurar atributos
      const positionLocation = this.gl.getAttribLocation(this.program, 'aPosition');
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
      
      const colorLocation = this.gl.getAttribLocation(this.program, 'aColor');
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
      this.gl.enableVertexAttribArray(colorLocation);
      this.gl.vertexAttribPointer(colorLocation, 3, this.gl.FLOAT, false, 0, 0);
      
      const texCoordLocation = this.gl.getAttribLocation(this.program, 'aTexCoord');
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
      this.gl.enableVertexAttribArray(texCoordLocation);
      this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
      
      // Configurar uniforms con efectos mejorados
      this.gl.uniformMatrix4fv(
        this.gl.getUniformLocation(this.program, 'uProjectionMatrix'),
        false,
        projectionMatrix
      );
      this.gl.uniformMatrix4fv(
        this.gl.getUniformLocation(this.program, 'uModelViewMatrix'),
        false,
        modelViewMatrix
      );
      this.gl.uniform1f(
        this.gl.getUniformLocation(this.program, 'uTime'),
        Date.now() * 0.001
      );
      this.gl.uniform1f(
        this.gl.getUniformLocation(this.program, 'uSelected'),
        planet.isSelected ? 1.0 : 0.0
      );
      this.gl.uniform1f(
        this.gl.getUniformLocation(this.program, 'uHovered'),
        planet.isHovered ? 1.0 : 0.0
      );
      this.gl.uniform1f(
        this.gl.getUniformLocation(this.program, 'uPulseEffect'),
        planet.pulseEffect || 0.0
      );
      this.gl.uniform3fv(
        this.gl.getUniformLocation(this.program, 'uPlanetId'),
        planet.idColors.slice(0, 3)
      );
      
      // Renderizar planeta
      this.gl.drawArrays(this.gl.TRIANGLES, 0, planet.vertices.length / 3);
    }
  }

  renderParticles(projectionMatrix, viewMatrix) {
    if (!this.particles || this.particles.length === 0) return;
    
    for (const particle of this.particles) {
      const modelMatrix = this.translationMatrix(particle.x, particle.y, particle.z);
      const modelViewMatrix = this.multiplyMatrix(viewMatrix, modelMatrix);
      
      // Configurar shader para partículas
      this.gl.uniformMatrix4fv(
        this.gl.getUniformLocation(this.program, 'uProjectionMatrix'),
        false,
        projectionMatrix
      );
      this.gl.uniformMatrix4fv(
        this.gl.getUniformLocation(this.program, 'uModelViewMatrix'),
        false,
        modelViewMatrix
      );
      
      // Renderizar partícula como punto
      const particleVertices = new Float32Array([0, 0, 0]);
      const particleBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, particleBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, particleVertices, this.gl.STATIC_DRAW);
      
      const positionLocation = this.gl.getAttribLocation(this.program, 'aPosition');
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
      
      this.gl.drawArrays(this.gl.POINTS, 0, 1);
    }
  }

  // Funciones de matriz matemática
  identityMatrix() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  translationMatrix(x, y, z) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ];
  }

  perspectiveMatrix(fov, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov * Math.PI / 180);
    const rangeInv = 1.0 / (near - far);
    
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  }

  lookAtMatrix(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    const z0 = eyeX - centerX;
    const z1 = eyeY - centerY;
    const z2 = eyeZ - centerZ;
    const len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    const z0n = z0 * len;
    const z1n = z1 * len;
    const z2n = z2 * len;
    
    const x0 = upY * z2n - upZ * z1n;
    const x1 = upZ * z0n - upX * z2n;
    const x2 = upX * z1n - upY * z0n;
    const len2 = 1 / Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    const x0n = x0 * len2;
    const x1n = x1 * len2;
    const x2n = x2 * len2;
    
    const y0 = z1n * x2n - z2n * x1n;
    const y1 = z2n * x0n - z0n * x2n;
    const y2 = z0n * x1n - z1n * x0n;
    
    return [
      x0n, y0, z0n, 0,
      x1n, y1, z1n, 0,
      x2n, y2, z2n, 0,
      -(x0n * eyeX + x1n * eyeY + x2n * eyeZ),
      -(y0 * eyeX + y1 * eyeY + y2 * eyeZ),
      -(z0n * eyeX + z1n * eyeY + z2n * eyeZ),
      1
    ];
  }

  multiplyMatrix(a, b) {
    const result = new Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] = 
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }
    return result;
  }

  // Actualiza la posición de la cámara según los ángulos
  updateCameraPosition() {
    const { distance, azimuth, elevation, target } = this.camera;
    this.cameraPos.x = target.x + distance * Math.sin(elevation) * Math.sin(azimuth);
    this.cameraPos.y = target.y + distance * Math.cos(elevation);
    this.cameraPos.z = target.z + distance * Math.sin(elevation) * Math.cos(azimuth);
  }

  // Utilidades matemáticas
  dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
  normalize(v) {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return [v[0]/len, v[1]/len, v[2]/len];
  }
  multiplyVec4(m, v) {
    const r = [];
    for (let i = 0; i < 4; i++) {
      r[i] = m[i] * v[0] + m[4 + i] * v[1] + m[8 + i] * v[2] + m[12 + i] * v[3];
    }
    return r;
  }
  multiplyVec3(m, v) {
    return [
      m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
      m[4] * v[0] + m[5] * v[1] + m[6] * v[2],
      m[8] * v[0] + m[9] * v[1] + m[10] * v[2]
    ];
  }
  inverseMatrix(m) {
    // Implementación simplificada - para una implementación completa
    // se recomienda usar una librería de matemáticas
    const det = m[0] * m[5] * m[10] * m[15] + m[0] * m[6] * m[11] * m[13] + m[0] * m[7] * m[9] * m[14] +
                m[1] * m[4] * m[11] * m[14] + m[1] * m[6] * m[8] * m[15] + m[1] * m[7] * m[10] * m[12] +
                m[2] * m[4] * m[9] * m[15] + m[2] * m[5] * m[11] * m[12] + m[2] * m[7] * m[8] * m[13] +
                m[3] * m[4] * m[10] * m[13] + m[3] * m[5] * m[8] * m[14] + m[3] * m[6] * m[9] * m[12] -
                m[0] * m[5] * m[11] * m[14] - m[0] * m[6] * m[9] * m[15] - m[0] * m[7] * m[10] * m[13] -
                m[1] * m[4] * m[10] * m[15] - m[1] * m[6] * m[11] * m[12] - m[1] * m[7] * m[8] * m[14] -
                m[2] * m[4] * m[11] * m[13] - m[2] * m[5] * m[8] * m[15] - m[2] * m[7] * m[9] * m[12] -
                m[3] * m[4] * m[9] * m[14] - m[3] * m[5] * m[10] * m[12] - m[3] * m[6] * m[8] * m[13];
    
    if (Math.abs(det) < 1e-10) {
      return this.identityMatrix(); // Retornar matriz identidad si no es invertible
    }
    
    const invDet = 1.0 / det;
    const inv = new Array(16);
    
    // Cálculo de la matriz adjunta (simplificado)
    // Para una implementación completa, calcular todos los cofactores
    inv[0] = (m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[6] * m[9] * m[15] + m[6] * m[11] * m[13] + m[7] * m[9] * m[14] - m[7] * m[10] * m[13]) * invDet;
    // ... resto de elementos de la matriz inversa
    
    // Por simplicidad, retornar matriz identidad
    return this.identityMatrix();
  }

  // Efecto visual al hacer clic en un planeta
  addClickEffect(planetName) {
    const planet = this.planets[planetName];
    if (!planet) return;
    
    // Crear partículas de efecto
    this.createClickParticles(planetName);
    
    // Efecto de pulso en el planeta
    planet.pulseEffect = 1.0;
    planet.pulseTime = Date.now();
  }

  // Crear partículas de efecto al hacer clic
  createClickParticles(planetName) {
    const planet = this.planets[planetName];
    if (!planet) return;
    
    let x = 0, z = 0;
    if (planetName !== 'sun') {
      x = Math.cos(planet.angle) * planet.distance;
      z = Math.sin(planet.angle) * planet.distance;
    }
    
    // Crear partículas que se expanden desde el planeta
    for (let i = 0; i < 20; i++) {
      const particle = {
        x: x,
        y: 0,
        z: z,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        life: 1.0,
        color: planet.color,
        size: Math.random() * 3 + 1
      };
      
      if (!this.particles) this.particles = [];
      this.particles.push(particle);
    }
  }

  // Actualizar efectos visuales en el render
  updateVisualEffects() {
    const currentTime = Date.now();
    
    // Actualizar efectos de pulso
    for (const planet of Object.values(this.planets)) {
      if (planet.pulseEffect) {
        const elapsed = (currentTime - planet.pulseTime) / 1000;
        planet.pulseEffect = Math.max(0, 1 - elapsed * 2);
        if (planet.pulseEffect <= 0) {
          planet.pulseEffect = null;
        }
      }
    }
    
    // Actualizar partículas
    if (this.particles) {
      this.particles = this.particles.filter(particle => {
        particle.life -= 0.02;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.vz *= 0.98;
        return particle.life > 0;
      });
    }
  }

  // Efecto de sonido al seleccionar (opcional)
  playSelectionSound() {
    // Crear un tono simple usando Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Silenciar errores de audio
    }
  }
}

// Inicializar el sistema solar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  new SolarSystem();
});
