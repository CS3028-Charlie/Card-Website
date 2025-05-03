// Creates material from image URL
// Returns a promise that resolves to a THREE.MeshBasicMaterial
function createMaterialWithImage(imageUrl) {
    const textureLoader = new THREE.TextureLoader();
    return new Promise((resolve) => {
        textureLoader.load(
            imageUrl,
            (texture) => {
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide
                });
                resolve(material);
            },
            undefined,
            () => {
                // Error loading texture, return white material
                resolve(new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    side: THREE.DoubleSide
                }));
            }
        );
    });
}

// Creates material from canvas element
// Handles scaling and white background filling
function createMaterialFromCanvas(canvasId) {
    const sourceCanvas = document.getElementById(canvasId);
    if (!sourceCanvas) return null;

    // Create temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 512;
    tempCanvas.height = 512;
    const ctx = tempCanvas.getContext('2d');

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Scale and draw the original canvas
    const scale = Math.min(
        tempCanvas.width / sourceCanvas.width,
        tempCanvas.height / sourceCanvas.height
    );
    const x = (tempCanvas.width - sourceCanvas.width * scale) / 2;
    const y = (tempCanvas.height - sourceCanvas.height * scale) / 2;
    ctx.drawImage(sourceCanvas, x, y, sourceCanvas.width * scale, sourceCanvas.height * scale);

    // Create texture
    const texture = new THREE.Texture(tempCanvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });
}

// Converts canvas to texture material
// Uses blob URL for efficient memory handling
function canvasToTexture(canvas) {
    return new Promise((resolve) => {
        // Convert canvas to blob
        canvas.toBlob((blob) => {
            // Create a temporary URL from the blob
            const tempUrl = URL.createObjectURL(blob);
            
            // Create texture loader
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                tempUrl,
                (texture) => {
                    // Configure texture
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.needsUpdate = true;

                    // Create material
                    const material = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.DoubleSide
                    });

                    // Clean up the temporary URL
                    URL.revokeObjectURL(tempUrl);
                    
                    resolve(material);
                },
                undefined,
                () => {
                    // Clean up on error
                    URL.revokeObjectURL(tempUrl);
                    resolve(new THREE.MeshBasicMaterial({ color: 0xffffff }));
                }
            );
        }, 'image/png');
    });
}

// Creates optimized texture from canvas
function createTextureFromCanvas(canvas) {
    // Create a new canvas with power-of-2 dimensions
    const powerOfTwoCanvas = document.createElement('canvas');
    powerOfTwoCanvas.width = 512;
    powerOfTwoCanvas.height = 512;
    const ctx = powerOfTwoCanvas.getContext('2d');

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);

    // Draw the original canvas content scaled to fit
    const scale = Math.min(512 / canvas.width, 512 / canvas.height);
    const x = (512 - canvas.width * scale) / 2;
    const y = (512 - canvas.height * scale) / 2;
    ctx.drawImage(canvas, x, y, canvas.width * scale, canvas.height * scale);

    // Create texture directly from the power-of-two canvas
    const texture = new THREE.Texture(powerOfTwoCanvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
    });
}

// Creates 3D card model with all pages
// Sets up geometry, materials, and spine
function createPrintableCard(scene) {
    const cardGroup = new THREE.Group();
    const width = 5;
    const height = 7;

    // Define pages
    const pages = [
        { canvasId: 'inner-left-canvas', position: { x: -2.5, z: 0.01 }, rotation: { y: 0 } },
        { canvasId: 'inner-right-canvas', position: { x: 2.5, z: 0.01 }, rotation: { y: 0 } },
        { canvasId: 'front-canvas', position: { x: -2.5, z: -0.01 }, rotation: { y: Math.PI }},
        { canvasId: 'back-canvas', position: { x: 2.5, z: -0.01 }, rotation: { y: Math.PI }}
    ];

    // Create pages
    pages.forEach(page => {
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = createMaterialFromCanvas(page.canvasId) || 
                        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        
        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(page.position.x, 0, page.position.z);
        if (page.rotation) {
            plane.rotation.set(0, page.rotation.y, 0);
        }
        cardGroup.add(plane);
    });

    // Add spine
    const spineGeometry = new THREE.BoxGeometry(0.2, height + 0.1, 0.1);
    const spineMaterial = new THREE.MeshBasicMaterial({ color: 0x39b552 });
    const spine = new THREE.Mesh(spineGeometry, spineMaterial);
    cardGroup.add(spine);

    scene.add(cardGroup);
    cardGroup.rotation.y = Math.PI;
    return cardGroup;
}

// Main rendering function
// Sets up Three.js scene, camera, lighting and animation
window.render3DPreview = function() {
    const container = document.getElementById('3DPreviewContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    try {
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);
        
        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 2, 15);
        camera.lookAt(0, 0, 0);
        
        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        // Create and animate card
        const cardGroup = createPrintableCard(scene);
        let rotationSpeed = 0.01;
        
        function animate() {
            requestAnimationFrame(animate);
            cardGroup.rotation.y += rotationSpeed;
            renderer.render(scene, camera);
        }
        animate();

        // Click to toggle rotation
        container.addEventListener('click', () => {
            rotationSpeed = rotationSpeed === 0 ? 0.01 : 0;
        });
        
    } catch (error) {
        console.error('Error in 3D preview:', error);
        container.innerHTML = '<div class="alert alert-danger">Unable to load 3D preview</div>';
    }
}

// Initialize preview when modal opens
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('preview3DModal');
    if (modal) {
        modal.addEventListener('shown.bs.modal', render3DPreview);
    }
});
