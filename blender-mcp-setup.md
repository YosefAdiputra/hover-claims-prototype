# Blender MCP Integration Setup

## Prerequisites

1. **Install Blender**
   ```bash
   # On macOS using Homebrew
   brew install --cask blender

   # Or download from https://www.blender.org/download/
   ```

2. **Install Blender MCP Server**
   ```bash
   # Clone the Blender MCP repository
   git clone https://github.com/PromptEngineer48/mcp-blender-server.git
   cd mcp-blender-server

   # Install dependencies
   npm install
   ```

3. **Configure MCP in Claude Desktop**

   Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "blender": {
         "command": "node",
         "args": ["/path/to/mcp-blender-server/index.js"],
         "env": {
           "BLENDER_PATH": "/Applications/Blender.app/Contents/MacOS/Blender"
         }
       }
     }
   }
   ```

## Usage with React App

Once configured, you can use Blender MCP to:

1. **Generate 3D Models**
   - Create house models with accurate geometry
   - Export as GLB/GLTF for web use
   - Generate UV-mapped textures

2. **Integration Options**
   - Use Three.js to render Blender models
   - Convert to SVG for 2D projections
   - Export as animated sequences

## Alternative: Three.js Integration

For immediate 3D improvements without Blender MCP:

```bash
npm install three @react-three/fiber @react-three/drei
```

Then create a proper 3D house component:

```jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Cylinder } from '@react-three/drei'

function House3D() {
  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} />

      {/* House base */}
      <Box position={[0, 0.5, 0]} args={[4, 1, 3]}>
        <meshStandardMaterial color="#fde68a" />
      </Box>

      {/* Roof */}
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[3, 2, 4]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Damage indicators */}
      {damages.map((d, i) => (
        <Sphere key={i} position={d.position} args={[0.1]}>
          <meshStandardMaterial color="red" emissive="red" />
        </Sphere>
      ))}

      <OrbitControls enablePan={false} />
    </Canvas>
  )
}
```

## Current SVG-Based Solution

Your current holographic SVG solution is actually quite sophisticated and works well for the prototype. To enhance it further without Blender:

1. Add more depth layers
2. Implement proper perspective transformations
3. Add shadow/lighting effects
4. Use CSS 3D transforms for better rotation

Would you like me to:
1. Help set up Three.js for true 3D rendering?
2. Continue enhancing the SVG-based holographic house?
3. Wait for you to install Blender MCP first?