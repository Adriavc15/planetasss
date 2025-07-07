# Sistema Solar 3D - Exploración Interactiva

Un sistema solar 3D completamente interactivo construido con WebGL y JavaScript vanilla. Explora los planetas del sistema solar con gráficos 3D realistas, información detallada y controles intuitivos.

## 🌟 Características

- **Renderizado 3D en tiempo real** usando WebGL
- **8 planetas del sistema solar** con órbitas realistas
- **Información detallada** de cada planeta
- **Controles interactivos** para pausar, reiniciar y ajustar velocidad
- **Interfaz moderna** con efectos visuales avanzados
- **Responsive design** para dispositivos móviles
- **Pantalla completa** para una experiencia inmersiva
- **Estadísticas en tiempo real** (FPS, información del sistema)
- **Colores identificables** - Paleta única para cada planeta
- **Selección interactiva** - Haz clic en planetas para información detallada
- **Efectos visuales** - Bordes brillantes en planetas seleccionados
- **Modal informativo** - Ventana emergente con datos científicos precisos

## 🚀 Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con animaciones y efectos
- **JavaScript ES6+** - Lógica de la aplicación
- **WebGL2** - Gráficos 3D de alto rendimiento
- **GLSL** - Shaders personalizados para efectos visuales

## 🎮 Controles

- **Navegación**: Botones en la parte superior para cambiar vistas
- **Reproducción**: Pausar/Reproducir la animación
- **Reinicio**: Volver a la posición inicial de todos los planetas
- **Velocidad**: Control deslizante para ajustar la velocidad de rotación
- **Pantalla completa**: Modo inmersivo
- **Información**: Panel lateral con datos de cada planeta

## 🌍 Planetas Incluidos

1. **Sol** - Estrella central con efectos de brillo
2. **Mercurio** - Planeta más cercano al Sol
3. **Venus** - Planeta gemelo de la Tierra
4. **Tierra** - Nuestro hogar con su satélite natural
5. **Marte** - El planeta rojo
6. **Júpiter** - El planeta más grande
7. **Saturno** - Señor de los anillos
8. **Urano** - Planeta inclinado
9. **Neptuno** - El planeta más lejano

## 📱 Compatibilidad

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Dispositivos móviles (iOS/Android)

## 🎨 Características Visuales

- **Efectos de iluminación** realistas
- **Animaciones suaves** y fluidas
- **Partículas de estrellas** de fondo
- **Órbitas visibles** para cada planeta
- **Efectos de brillo** para el Sol
- **Anillos de Saturno** animados
- **Interfaz con blur** y transparencias
- **Paleta de colores única** para cada planeta:
  - 🌞 **Sol**: Amarillo dorado brillante
  - ☿ **Mercurio**: Gris metálico
  - ♀ **Venus**: Naranja dorado
  - 🌍 **Tierra**: Azul oceánico
  - ♂ **Marte**: Rojo marciano
  - ♃ **Júpiter**: Marrón jupiteriano
  - ♄ **Saturno**: Dorado saturniano
  - ♅ **Urano**: Azul verdoso
  - ♆ **Neptuno**: Azul profundo
- **Efectos de selección** con bordes brillantes
- **Modal informativo** con datos científicos detallados

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/sistema-solar-3d.git
```

2. Navega al directorio:
```bash
cd sistema-solar-3d
```

3. Abre `index.html` en tu navegador web

## 📁 Estructura del Proyecto

```
sistema-solar-3d/
├── index.html          # Página principal
├── app.js             # Lógica del sistema solar
├── style.css          # Estilos y animaciones
├── README.md          # Documentación
└── images/            # Recursos gráficos (si los hay)
```

## 🔧 Personalización

### Cambiar colores de planetas
Edita el objeto `planetData` en `app.js`:

```javascript
const planetData = {
  earth: { 
    radius: 1.3, 
    distance: 16, 
    color: [0.2, 0.5, 0.9], // RGB values
    speed: 0.01 
  }
  // ... otros planetas
};
```

### Ajustar velocidad de animación
Modifica la variable `speed` en la clase `SolarSystem`:

```javascript
this.speed = 5; // Valor por defecto
```

### Agregar nuevos planetas
Añade nuevos objetos al `planetData` y sus correspondientes elementos HTML en el panel de información.

## 🎯 Características Técnicas

- **Rendimiento optimizado** con WebGL
- **Shaders personalizados** para efectos especiales
- **Matrices de transformación** para posicionamiento 3D
- **Sistema de coordenadas** astronómicamente preciso
- **Gestión de memoria** eficiente
- **Responsive design** adaptativo

## 🌟 Próximas Características

- [ ] Satélites naturales (Luna, Fobos, Deimos, etc.)
- [ ] Cinturón de asteroides
- [ ] Cometas y meteoritos
- [ ] Modo educativo con explicaciones
- [ ] Sonidos espaciales
- [ ] Exportación de capturas de pantalla
- [ ] Modo VR/AR

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request.

## 📞 Contacto

Si tienes preguntas o sugerencias, no dudes en contactar.

---

**¡Explora el universo desde tu navegador!** 🌌