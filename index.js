import { GoogleGenAI, Modality } from "@google/genai";

// API Key from environment variable
// Assuming process.env.API_KEY is available in this execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper function to convert Blob to base64 string
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]); // Extract base64 part
            } else {
                reject(new Error("Failed to convert blob to base64."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// SVG Icons (replacing Heroicons React components)
const getIconSVG = (name, className = 'w-5 h-5 md:w-6 md:h-6') => {
    const icons = {
        camera: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="${className}"><path d="M14.5 4.793a.75.75 0 011.107 1.047l-1.097 1.15H17.25A2.75 2.75 0 0120 10.75v5.5A2.75 2.75 0 0117.25 19H6.75A2.75 2.75 0 014 16.25v-5.5A2.75 2.75 0 016.75 8H9.397L8.3 6.91A.75.75 0 019.403 5.793l1.157 1.217 1.157-1.217a.75.75 0 011.107 1.047zM12 15a3 3 0 100-6 3 3 0 000 6z" /></svg>`,
        photo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="${className}"><path fill-rule="evenodd" d="M1.5 6A2.25 2.25 0 013.75 3.75h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" /></svg>`,
        play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="${className}"><path fill-rule="evenodd" d="M4.5 5.653c0-1.084 1.17-1.637 2.036-1.006l11.395 7.12a1.5 1.5 0 010 2.684l-11.395 7.12C5.67 20.985 4.5 20.432 4.5 19.349V5.653z" clip-rule="evenodd" /></svg>`,
        arrowPath: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="${className}"><path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903-.76a.75.75 0 01.76.76l-.76 1.902A9 9 0 012.25 12c0 5.653 4.39 10.244 10.059 10.455.515.021 1.026-.062 1.524-.249.03-.011.056-.026.077-.045a.286.286 0 00.088-.09l-.75-.75A.75.75 0 1113.848 20l1.75 1.75H13a.75.75 0 010-1.5h1.75l-.234-.234a.75.75 0 01.011-1.059c1.654-1.674 2.697-3.903 2.697-6.316a.75.75 0 011.5 0c0 2.766-1.295 5.37-3.567 7.073l-.234.234h1.75a.75.75 0 010 1.5H13a.75.75 0 010-1.5h1.75l-.234-.234c-2.272-1.703-3.567-4.307-3.567-7.073a.75.75 0 011.5 0h.059zM12 2.25a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM12 3a9 9 0 018.663 5.438l.608-.243a.75.75 0 01.378 1.144L20.8 11.25a.75.75 0 01-1.144.378l-.609-.243A7.5 7.5 0 0012 4.5a.75.75 0 010-1.5z" clip-rule="evenodd" /></svg>`,
        arrowDownTray: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="${className}"><path fill-rule="evenodd" d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.75 12a.75.75 0 01.75.75v5.25a.75.75 0 00.75.75h6.75a.75.75 0 00.75-.75v-5.25a.75.75 0 011.5 0v5.25A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75v-5.25a.75.75 0 01.75-.75H6.75z" clip-rule="evenodd" /></svg>`,
    };
    return icons[name] || '';
};

// Define Prompt interface (for reference, not strict type enforcement in JS)
// interface Prompt {
//     id: string;
//     label: string;
//     icon: string; // SVG string
//     promptText: string;
// }

// Prompt definitions
const prompts = [
    { id: '1', label: 'Vintage', icon: getIconSVG('photo'), promptText: 'a vintage style, sepia tone photo' },
    { id: '2', label: 'Fantasy', icon: getIconSVG('photo'), promptText: 'a fantasy art style, vibrant colors' },
    { id: '3', label: 'Cartoon', icon: getIconSVG('photo'), promptText: 'a cartoon style, bold lines and bright colors' },
    { id: '4', label: 'Cinematic', icon: getIconSVG('photo'), promptText: 'a cinematic shot, dramatic lighting and focus' },
];

// Global state variables
let selectedPrompt = null;
let isCameraActive = false;
let capturedImage = null; // base64 string
let generatedImage = null; // base64 string
let isLoading = false;
let error = null;

// DOM element references
const videoRef = document.createElement('video');
videoRef.autoplay = true;
videoRef.playsInline = true;

const canvasRef = document.createElement('canvas');
canvasRef.style.display = 'none'; // Hidden by default

let mediaStreamRef = null;

const root = document.getElementById('root');

// --- Helper Functions for State Management and UI Updates ---
const updateState = (newState, reRender = true) => {
    Object.keys(newState).forEach(key => {
        if (key in window) { // Check if it's a global state variable
            window[key] = newState[key];
        } else {
            // Potentially log an error if trying to update non-existent global state
            console.warn(`Attempted to update non-existent global state key: ${key}`);
        }
    });
    if (reRender) {
        renderApp();
    }
};

const stopCamera = () => {
    if (mediaStreamRef) {
        mediaStreamRef.getTracks().forEach(track => track.stop());
        mediaStreamRef = null;
    }
    videoRef.srcObject = null;
};

const startCamera = async () => {
    updateState({ error: null, isCameraActive: true }, false); // Don't re-render yet, wait for video element to be ready
    await new Promise(resolve => setTimeout(resolve, 50)); // Allow DOM to update for video element to be present
    renderApp(); // Now render with isCameraActive true
};

// --- Camera & Image Handling ---
const initCamera = async () => {
    if (!isCameraActive || !videoRef) return; // videoRef should already be in DOM by this point

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        mediaStreamRef = stream;
        videoRef.srcObject = stream;
        await videoRef.play();
    } catch (err) {
        console.error("Error accessing camera:", err);
        updateState({ isCameraActive: false });
        if (err instanceof DOMException) {
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                updateState({ error: "Camera access denied. Please allow camera permissions in your browser settings." });
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                updateState({ error: "No camera found. Please ensure a camera is connected and enabled." });
            } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                updateState({ error: "Camera already in use or inaccessible. Please close other apps using the camera." });
            } else {
                updateState({ error: `Failed to initialize camera: ${err.message}. Please ensure your browser is up to date and try again.` });
            }
        } else {
            updateState({ error: "Failed to initialize camera display. Please ensure your browser is up to date and try again." });
        }
    }
};

const takePhoto = () => {
    if (videoRef && canvasRef) {
        updateState({ error: null });
        const video = videoRef;
        const canvas = canvasRef;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.scale(-1, 1); // Mirror horizontally
            context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height); // Adjust x for mirrored image
            context.scale(-1, 1); // Reset scale for future drawing if any

            const imageDataUrl = canvas.toDataURL('image/jpeg');
            updateState({
                capturedImage: imageDataUrl,
                isCameraActive: false,
                generatedImage: null, // Clear previously generated image
            });
            stopCamera(); // Stop camera after taking photo
        }
    } else {
        updateState({ error: "Camera feed not ready to take photo." });
    }
};

const processImage = async () => {
    if (!selectedPrompt || !capturedImage) {
        updateState({ error: "Please select a prompt and capture an image first." });
        return;
    }

    updateState({
        isLoading: true,
        error: null,
        generatedImage: null, // Clear previous generated image while loading
    });

    try {
        const base64ImageBytes = capturedImage.split(',')[1];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // General Image Generation and Editing Tasks
            contents: {
                parts: [
                    { text: selectedPrompt.promptText },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64ImageBytes,
                        },
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64Image = part.inlineData.data;
                updateState({ generatedImage: `data:image/jpeg;base64,${base64Image}` });
                break;
            }
        }

    } catch (err) {
        console.error("Error generating image:", err);
        updateState({ error: `Failed to generate AI image: ${err.message || "Unknown error"}` });
    } finally {
        updateState({ isLoading: false });
    }
};

const handleDownloadImage = () => {
    if (generatedImage && selectedPrompt) {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `AInstagram_${selectedPrompt.label.replace(/\s/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        updateState({ error: "No AI-generated image available for download." });
    }
};

const resetAll = () => {
    stopCamera();
    updateState({
        selectedPrompt: null,
        isCameraActive: false,
        capturedImage: null,
        generatedImage: null,
        isLoading: false,
        error: null,
    });
};

// --- Render Function ---
const renderApp = () => {
    if (!root) return; // Ensure root element exists
    root.innerHTML = ''; // Clear existing content

    const appContainer = document.createElement('div');
    appContainer.className = "flex flex-col min-h-screen bg-slate-900 text-zinc-50 font-sans overflow-x-hidden";

    // Header
    const header = document.createElement('header');
    header.className = "fixed top-0 left-0 right-0 z-50 bg-slate-900 py-4 px-4 shadow-lg";
    header.innerHTML = `
        <h1 class="text-4xl font-parkinsans text-zinc-50 text-center">AInstagram</h1>
        <p class="text-xl font-parkinsans text-zinc-400 text-center">Just Imagine Yourself.</p>
    `;
    appContainer.appendChild(header);

    // Main Content
    const main = document.createElement('main');
    main.className = "flex-1 flex flex-col items-center px-4 pt-28 pb-8 mt-6";

    const mainContentBox = document.createElement('div');
    mainContentBox.className = `bg-slate-800 rounded-xl shadow-lg w-full max-w-4xl p-4 flex flex-col items-center
                                ${isCameraActive || capturedImage ? 'h-[calc(100vh - 200px)]' : 'min-h-[300px]'}`;

    if (error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = "bg-red-700 p-3 rounded-lg text-sm text-center mb-4 max-w-prose";
        errorDiv.textContent = error;
        mainContentBox.appendChild(errorDiv);
    }

    if (!selectedPrompt) {
        const h2 = document.createElement('h2');
        h2.className = "text-2xl font-bold mb-6 text-zinc-50";
        h2.textContent = "Select an Imagination Prompt";
        mainContentBox.appendChild(h2);

        const promptGrid = document.createElement('div');
        promptGrid.className = "grid grid-cols-2 gap-4 w-full max-w-md";
        prompts.forEach(prompt => {
            const button = document.createElement('button');
            button.className = "flex flex-col items-center justify-center p-4 h-12 md:h-16 bg-slate-700 text-zinc-50 rounded-xl shadow-md hover:bg-slate-600 transition-colors duration-200 text-xs md:text-sm font-medium";
            button.setAttribute('aria-label', `Select prompt: ${prompt.label}`);
            button.innerHTML = `${prompt.icon} <span class="mt-1">${prompt.label}</span>`;
            button.addEventListener('click', () => updateState({ selectedPrompt: prompt }));
            promptGrid.appendChild(button);
        });
        mainContentBox.appendChild(promptGrid);
    } else if (selectedPrompt && !isCameraActive && !capturedImage) {
        const container = document.createElement('div');
        container.className = "flex flex-col items-center justify-center h-full w-full text-zinc-300";

        const h2 = document.createElement('h2');
        h2.className = "text-2xl font-bold mb-6 text-zinc-50";
        h2.textContent = `Selected Prompt: ${selectedPrompt.label}`;
        container.appendChild(h2);

        const promptGrid = document.createElement('div');
        promptGrid.className = "grid grid-cols-2 gap-4 w-full max-w-md";
        prompts.forEach(prompt => {
            const button = document.createElement('button');
            button.className = `flex flex-col items-center justify-center p-4 h-12 md:h-16 rounded-xl shadow-md transition-colors duration-200 text-xs md:text-sm font-medium
                                ${selectedPrompt.id === prompt.id ? 'bg-orange-600 text-zinc-50' : 'bg-slate-700 text-zinc-50 hover:bg-slate-600'}`;
            button.setAttribute('aria-label', `Select prompt: ${prompt.label}`);
            button.innerHTML = `${prompt.icon} <span class="mt-1">${prompt.label}</span>`;
            button.addEventListener('click', () => updateState({ selectedPrompt: prompt }));
            promptGrid.appendChild(button);
        });
        container.appendChild(promptGrid);
        mainContentBox.appendChild(container);

    } else if (isCameraActive) {
        const cameraContainer = document.createElement('div');
        cameraContainer.className = "relative w-full md:w-1/2 h-full flex items-center justify-center bg-black rounded-lg overflow-hidden mx-auto";
        videoRef.className = "w-full h-full object-contain scale-x-[-1] rounded-lg";
        cameraContainer.appendChild(videoRef);
        cameraContainer.appendChild(canvasRef); // Add canvas to DOM, still hidden

        const takePhotoButton = document.createElement('button');
        takePhotoButton.className = "absolute bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-full bg-orange-600 text-zinc-50 shadow-lg hover:bg-orange-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50";
        takePhotoButton.setAttribute('aria-label', 'Take Photo');
        takePhotoButton.innerHTML = getIconSVG('camera', 'w-8 h-8');
        takePhotoButton.addEventListener('click', takePhoto);
        cameraContainer.appendChild(takePhotoButton);
        mainContentBox.appendChild(cameraContainer);

        // Start camera stream when cameraContainer is in DOM
        initCamera();

    } else if (capturedImage && !generatedImage && !isLoading && !isCameraActive) {
        const container = document.createElement('div');
        container.className = "flex flex-col items-center justify-center h-full w-full md:w-1/2 mx-auto";
        container.innerHTML = `
            <div class="relative w-full h-full flex items-center justify-center">
                <img src="${capturedImage}" alt="Captured" class="w-full h-full object-contain rounded-lg shadow-md" />
                <div class="absolute top-2 left-2 bg-slate-900/70 text-zinc-50 text-xs px-2 py-1 rounded-md">Original</div>
            </div>
        `;
        mainContentBox.appendChild(container);
    } else if (capturedImage && isLoading && !isCameraActive) {
        const container = document.createElement('div');
        container.className = "flex flex-col md:flex-row items-center justify-center w-full h-full space-y-4 md:space-y-0 md:space-x-4";
        container.innerHTML = `
            <div class="relative flex-1 flex items-center justify-center h-1/2 md:h-full w-full md:w-1/2 min-h-[150px] md:min-h-0">
                <img src="${capturedImage}" alt="Original" class="w-full h-full object-contain rounded-lg shadow-md" />
                <div class="absolute top-2 left-2 bg-slate-900/70 text-zinc-50 text-xs px-2 py-1 rounded-md">Original</div>
            </div>
            <div class="relative flex-1 flex flex-col items-center justify-center h-1/2 md:h-full w-full md:w-1/2 min-h-[150px] md:min-h-0 bg-slate-700 rounded-lg shadow-md text-zinc-400">
                ${getIconSVG('arrowPath', 'w-12 h-12 animate-spin text-zinc-300 mb-2')}
                <p>Generating AI Image...</p>
                <div class="absolute top-2 left-2 bg-slate-900/70 text-zinc-50 text-xs px-2 py-1 rounded-md">AI Generated</div>
            </div>
        `;
        mainContentBox.appendChild(container);
    } else if (capturedImage && generatedImage && !isLoading && !isCameraActive) {
        const container = document.createElement('div');
        container.className = "flex flex-col md:flex-row items-center justify-center w-full h-full space-y-4 md:space-y-0 md:space-x-4";
        container.innerHTML = `
            <div class="relative flex-1 flex items-center justify-center h-1/2 md:h-full w-full md:w-1/2 min-h-[150px] md:min-h-0">
                <img src="${capturedImage}" alt="Original" class="w-full h-full object-contain rounded-lg shadow-md" />
                <div class="absolute top-2 left-2 bg-slate-900/70 text-zinc-50 text-xs px-2 py-1 rounded-md">Original</div>
            </div>
            <div class="relative flex-1 flex items-center justify-center h-1/2 md:h-full w-full md:w-1/2 min-h-[150px] md:min-h-0">
                <img src="${generatedImage}" alt="AI Generated" class="w-full h-full object-contain rounded-lg shadow-md" />
                <div class="absolute top-2 left-2 bg-slate-900/70 text-zinc-50 text-xs px-2 py-1 rounded-md">AI Generated</div>
            </div>
        `;
        const downloadButtonContainer = container.querySelector('.relative:last-child');
        const downloadButton = document.createElement('button');
        downloadButton.className = "absolute top-2 right-2 p-2 bg-slate-900/70 text-zinc-50 rounded-full shadow-md hover:bg-slate-700/80 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500 focus:ring-opacity-50";
        downloadButton.setAttribute('aria-label', 'Download AI Generated Image');
        downloadButton.innerHTML = getIconSVG('arrowDownTray', 'w-5 h-5');
        downloadButton.addEventListener('click', handleDownloadImage);
        downloadButtonContainer.appendChild(downloadButton);

        mainContentBox.appendChild(container);
    }

    main.appendChild(mainContentBox);
    appContainer.appendChild(main);

    // Fixed Bottom Action Bar
    if (selectedPrompt || capturedImage || generatedImage || isLoading || isCameraActive) {
        const footer = document.createElement('footer');
        footer.className = "fixed bottom-4 left-0 right-0 z-40 flex flex-col items-center px-4";

        const promptDisplay = document.createElement('div');
        promptDisplay.className = "w-full max-w-lg mb-3 text-center text-zinc-300 text-base md:text-lg font-semibold";
        promptDisplay.textContent = selectedPrompt ? `Selected Prompt: ${selectedPrompt.label}` : '';
        footer.appendChild(promptDisplay);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = "flex justify-center space-x-4 w-full max-w-lg";

        // Take Photo / Retake Photo Button
        if (selectedPrompt && !capturedImage && !isCameraActive) {
            const button = document.createElement('button');
            button.className = "flex-1 flex items-center justify-center h-12 md:h-16 bg-orange-600 text-zinc-50 text-base rounded-full shadow-lg hover:bg-orange-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50";
            button.disabled = isLoading;
            button.setAttribute('aria-label', 'Take Photo');
            button.innerHTML = `${getIconSVG('camera', 'w-5 h-5 mr-2')} Take Photo`;
            button.addEventListener('click', startCamera);
            buttonContainer.appendChild(button);
        } else if (selectedPrompt && capturedImage && !isCameraActive) {
            const button = document.createElement('button');
            button.className = "flex-1 flex items-center justify-center h-12 md:h-16 bg-zinc-600 text-zinc-50 text-base rounded-full shadow-lg hover:bg-zinc-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-zinc-500 focus:ring-opacity-50";
            button.disabled = isLoading;
            button.setAttribute('aria-label', 'Retake Photo');
            button.innerHTML = `${getIconSVG('camera', 'w-5 h-5 mr-2')} Retake Photo`;
            button.addEventListener('click', startCamera);
            buttonContainer.appendChild(button);
        }

        // AI-generate Button
        if (selectedPrompt && capturedImage && !generatedImage && !isLoading && !isCameraActive) {
            const button = document.createElement('button');
            button.className = "flex-1 flex items-center justify-center h-12 md:h-16 bg-orange-600 text-zinc-50 text-base rounded-full shadow-lg hover:bg-orange-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50";
            button.disabled = isLoading;
            button.setAttribute('aria-label', 'AI-generate Image');
            if (isLoading) {
                button.innerHTML = `${getIconSVG('arrowPath', 'w-5 h-5 mr-2 animate-spin')} Generating...`;
            } else {
                button.innerHTML = `${getIconSVG('play', 'w-5 h-5 mr-2')} AI-generate`;
            }
            button.addEventListener('click', processImage);
            buttonContainer.appendChild(button);
        }

        // Start Over Button
        if (selectedPrompt && (isCameraActive || capturedImage || generatedImage || isLoading)) {
            const button = document.createElement('button');
            button.className = "flex-1 flex items-center justify-center h-12 md:h-16 bg-slate-700 text-zinc-50 text-base rounded-full shadow-lg hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500 focus:ring-opacity-50";
            button.setAttribute('aria-label', 'Start Over');
            button.innerHTML = `${getIconSVG('arrowPath', 'w-5 h-5 mr-2')} Start Over`;
            button.addEventListener('click', resetAll);
            buttonContainer.appendChild(button);
        }
        footer.appendChild(buttonContainer);
        appContainer.appendChild(footer);
    }

    root.appendChild(appContainer);
};

// Initial render when the script loads
document.addEventListener('DOMContentLoaded', renderApp);
