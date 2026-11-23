
import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";


// ----------------------------------
// PROFESSIONAL 3D INDUSTRIAL MOTOR
// ----------------------------------

const container = document.getElementById("machine-3d");
let statusLights = [];

if (container) {

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111c2e);

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );

    camera.position.set(5, 3.5, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // LIGHTING
    scene.add(new THREE.AmbientLight(0xffffff, 2.0));

    const hemisphereLight = new THREE.HemisphereLight(
        0xffffff,
        0x243449,
        1.5
    );

    scene.add(hemisphereLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 4);
    mainLight.position.set(4, 6, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const frontLight = new THREE.PointLight(0x60bfff, 25);
    frontLight.position.set(3, 2, 5);
    scene.add(frontLight);

    const fillLight = new THREE.PointLight(0x168cff, 20);
    fillLight.position.set(-4, 1, -3);
    scene.add(fillLight);

    // MATERIALS
    const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x168ac7,
    metalness: 0.55,
    roughness: 0.28
    });

    const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x52677d,
    metalness: 0.65,
    roughness: 0.3
    });

    const shaftMaterial = new THREE.MeshStandardMaterial({
        color: 0x9ba9b7,
        metalness: 0.95,
        roughness: 0.2
    });

    // MACHINE GROUP
    const motor = new THREE.Group();
    scene.add(motor);

    // MAIN CYLINDRICAL BODY
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.15, 2.8, 48),
        bodyMaterial
    );

    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    motor.add(body);

    // COOLING FINS
    for (let i = 0; i < 11; i++) {

        const fin = new THREE.Mesh(
            new THREE.CylinderGeometry(1.19, 1.19, 0.09, 48),
            darkMetal
        );

        fin.rotation.z = Math.PI / 2;
        fin.position.x = -1.15 + i * 0.23;

        motor.add(fin);
    }

    // FRONT AND REAR COVERS
    for (const x of [-1.43, 1.43]) {

        const cover = new THREE.Mesh(
            new THREE.CylinderGeometry(1.08, 1.08, 0.18, 48),
            darkMetal
        );

        cover.rotation.z = Math.PI / 2;
        cover.position.x = x;

        motor.add(cover);
    }

    // ROTATING SHAFT
    const shaftGroup = new THREE.Group();
    motor.add(shaftGroup);

    const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.19, 1.35, 32),
        shaftMaterial
    );

    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = 0.68;
    shaftGroup.add(shaft);

    // SHAFT END
    const shaftEnd = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.12, 32),
        darkMetal
    );

    shaftEnd.rotation.z = Math.PI / 2;
    shaftEnd.position.x = 1.36;
    shaftGroup.add(shaftEnd);

    // MOUNTING BASE
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.22, 2.1),
        darkMetal
    );

    base.position.y = -1.35;
    motor.add(base);

    // MOUNTING FEET
    for (const x of [-1.15, 1.15]) {
        for (const z of [-0.7, 0.7]) {

            const foot = new THREE.Mesh(
                new THREE.BoxGeometry(0.55, 0.3, 0.42),
                darkMetal
            );

            foot.position.set(x, -1.12, z);
            motor.add(foot);
        }
    }

    // STATUS LIGHTS


    for (let i = 0; i < 3; i++) {

        const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.09, 20, 20),
            new THREE.MeshStandardMaterial({
                color: i === 0 ? 0x00ff88 : 0x243449,
                emissive: i === 0 ? 0x00aa55 : 0x000000,
                emissiveIntensity: 2
            })
        );

        light.position.set(-0.8 + i * 0.8, 1.35, 0);
        motor.add(light);

        statusLights.push(light);
    }

    motor.rotation.z = -0.12;
    motor.rotation.y = -0.25;

    motor.scale.set(1.2, 1.2, 1.2);

    // RESPONSIVE VIEW
    function resizeMachine() {

        const width = container.clientWidth;
        const height = container.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }

    const resizeObserver = new ResizeObserver(resizeMachine);
    resizeObserver.observe(container);

    resizeMachine();

    // ANIMATION
    function animate() {

        requestAnimationFrame(animate);

        shaftGroup.rotation.x += 0.08;

        renderer.render(scene, camera);
    }

    animate();
}


// ----------------------------------
// 2. CONNECT TO FASTAPI
// ----------------------------------

const form = document.getElementById("prediction-form");

if (form) {
    form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = document.getElementById("predict-btn");
    const result = document.getElementById("result");
    const errorMessage = document.getElementById("error-message");

    errorMessage.textContent = "";
    button.disabled = true;
    button.textContent = "ANALYZING...";

    const inputData = {
        machine_type: document.getElementById("machine_type").value,
        air_temperature: Number(document.getElementById("air_temperature").value),
        process_temperature: Number(document.getElementById("process_temperature").value),
        rotational_speed: Number(document.getElementById("rotational_speed").value),
        torque: Number(document.getElementById("torque").value),
        tool_wear: Number(document.getElementById("tool_wear").value)
    };

    try {

        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(inputData)
        });

        if (!response.ok) {
            throw new Error("API request failed. Check your input.");
        }

        const data = await response.json();

// Update 3D machine status lights
if (statusLights.length > 0) {

    const isFailure = data.prediction === 1;

    statusLights.forEach((light, index) => {

        const color = isFailure ? 0xff3333 : 0x00ff88;

        light.material.color.setHex(color);

        light.material.emissive.setHex(
            isFailure ? 0xaa0000 : 0x00aa55
        );
    });
}

        document.getElementById("failure-score").textContent =
            (data.failure_probability * 100).toFixed(2) + "%";

        document.getElementById("threshold").textContent =
            (data.threshold * 100).toFixed(2) + "%";

        if (data.prediction === 1) {

            result.className = "result-box failure";

            result.innerHTML = `
                <div class="result-icon">⚠️</div>
                <h3>FAILURE RISK DETECTED</h3>
                <p>Machine requires further inspection.</p>
            `;

        } else {

            result.className = "result-box normal";

            result.innerHTML = `
                <div class="result-icon">✓</div>
                <h3>MACHINE NORMAL</h3>
                <p>No failure risk detected at the selected threshold.</p>
            `;
        }

    } catch (error) {

        errorMessage.textContent = error.message;

    } finally {

        button.disabled = false;
        button.textContent = "ANALYZE MACHINE →";
    }
});
}

// CHECK BACKEND HEALTH

async function checkSystemHealth() {

    const appStatus = document.getElementById("app-status");
    const apiStatus = document.getElementById("api-status");

    try {

        const response = await fetch("/health");

        if (!response.ok) {
            throw new Error("API unavailable");
        }

        const data = await response.json();

        appStatus.textContent = "ONLINE";
        document.getElementById("application-status").textContent = "ACTIVE";
        apiStatus.textContent = "CONNECTED";

        document.getElementById("model-status").textContent =
        data.model === "loaded" ? "LOADED" : "NOT LOADED";

    } catch (error) {
        document.getElementById("application-status").textContent = "OFFLINE";

        appStatus.textContent = "OFFLINE";
        apiStatus.textContent = "DISCONNECTED";

        document.getElementById("model-status").textContent =
            "UNKNOWN";
    }
}

checkSystemHealth();