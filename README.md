# 3D Puzzle App

A modern 3D puzzle game built with Capacitor and Three.js, featuring Rubik's cube-style puzzles with isometric 3D building models.

## Features

- **3D Puzzle Mechanics**: Rubik's cube-style puzzles with smooth animations
- **Touch & Mouse Controls**: Intuitive controls for both mobile and desktop
- **Multiple Levels**: Progressive difficulty with unlock system
- **Progress Tracking**: Save game progress, best times, and move counts
- **Cross-Platform**: Built with Capacitor for iOS and Android deployment
- **Modern UI**: Clean, responsive interface with smooth animations

## Controls

- **Cube Manipulation**: Swipe or drag on the cube to rotate faces
- **Scene Rotation**: Drag on the background to rotate the view
- **Zoom**: Pinch gestures or mouse wheel to zoom in/out
- **Menu**: Tap the menu button to access levels, settings, and statistics

## Tech Stack

- **Capacitor**: Cross-platform mobile development
- **Three.js**: 3D graphics and rendering
- **Vanilla JavaScript**: Minimal framework approach
- **Vite**: Fast development and build tool
- **GLB/GLTF**: 3D model format

## Project Structure

```
displacement/
├── src/
│   ├── js/
│   │   ├── game/
│   │   │   ├── GameEngine.js      # Main game engine
│   │   │   ├── RubiksCube.js      # Cube logic and animations
│   │   │   ├── InputManager.js    # Touch/mouse controls
│   │   │   └── LevelManager.js    # Level progression
│   │   ├── ui/
│   │   │   └── UIManager.js       # UI interactions
│   │   ├── utils/
│   │   │   └── StorageManager.js  # Local storage
│   │   └── main.js                # App entry point
│   ├── styles/
│   │   └── main.css               # Main stylesheet
│   └── index.html                 # Main HTML file
├── glb/
│   └── rubix.glb                  # 3D cube model
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration
├── capacitor.config.ts            # Capacitor configuration
└── README.md                      # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Capacitor CLI (for mobile builds)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd displacement
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Capacitor CLI globally**
   ```bash
   npm install -g @capacitor/cli
   ```

### Development

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Open in browser**
   - The app will automatically open at `http://localhost:3000`
   - Use browser dev tools to simulate mobile devices

### Building for Production

1. **Build the web app**
   ```bash
   npm run build
   ```

2. **Add mobile platforms**
   ```bash
   npm run cap:add
   ```

3. **Copy web assets to native projects**
   ```bash
   npm run cap:copy
   ```

4. **Sync changes**
   ```bash
   npm run cap:sync
   ```

### Mobile Development

#### iOS
```bash
npm run cap:open:ios
```

#### Android
```bash
npm run cap:open:android
```

## 3D Model Structure

The included `rubix.glb` model contains a Rubik's cube with the following piece naming convention:

- **Upper level**: a1, a2, a3, etc.
- **Middle level**: b1, b2, b3, etc.
- **Lower level**: c1, c2, c3, etc.
- **Center**: "center"

## Level System

The game includes a progressive level system:

1. **Tutorial Cube**: Learn basic controls
2. **Simple Scramble**: Basic puzzle solving
3. **Intermediate Challenge**: More complex patterns
4. **Advanced Puzzle**: Expert-level difficulty
5. **Expert Level**: Ultimate challenge

Each level tracks:
- Best move count
- Best completion time
- Last played timestamp
- Completion status

## Customization

### Adding New Levels

1. Create new 3D models in GLB format
2. Add level data to `LevelManager.js`
3. Update the level progression logic

### Modifying Controls

Edit `InputManager.js` to customize:
- Touch sensitivity
- Swipe detection thresholds
- Zoom limits
- Control mappings

### UI Customization

Modify `src/styles/main.css` to customize:
- Colors and themes
- Layout and spacing
- Animations and transitions
- Responsive breakpoints

## Performance Optimization

- **Model Optimization**: Use compressed textures and optimized geometry
- **LOD System**: Implement level-of-detail for complex models
- **Memory Management**: Properly dispose of Three.js objects
- **Mobile Optimization**: Reduce polygon count for mobile devices

## Troubleshooting

### Common Issues

1. **3D Model Not Loading**
   - Check file path in level configuration
   - Ensure GLB file is valid
   - Check browser console for errors

2. **Touch Controls Not Working**
   - Test on actual mobile device (not just browser simulation)
   - Check for conflicting touch event handlers
   - Verify Capacitor permissions

3. **Performance Issues**
   - Reduce model complexity
   - Lower texture resolution
   - Check for memory leaks

### Debug Mode

Access the app instance in browser console:
```javascript
window.puzzleApp
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both desktop and mobile
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review browser console for errors
- Test on different devices and browsers
- Ensure all dependencies are up to date
