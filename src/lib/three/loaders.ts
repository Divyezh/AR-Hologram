import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

const modelCache = new Map<string, GLTF>();
const loadingPromises = new Map<string, Promise<GLTF>>();

export async function loadGLTFModel(url: string): Promise<GLTF> {
  if (modelCache.has(url)) {
    return modelCache.get(url)!;
  }

  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)!;
  }

  const promise = new Promise<GLTF>((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        modelCache.set(url, gltf);
        loadingPromises.delete(url);
        resolve(gltf);
      },
      undefined,
      (error) => {
        loadingPromises.delete(url);
        console.error(`Failed to load 3D model from ${url}:`, error);
        reject(error);
      }
    );
  });

  loadingPromises.set(url, promise);
  return promise;
}

export function clearModelCache(): void {
  modelCache.clear();
  loadingPromises.clear();
}
