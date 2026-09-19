const DB_NAME = "twilight-share-inbox";
const STORE_NAME = "items";

function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putFiles(files) {
  const db = await database();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    files.forEach((file, index) => store.put({ id: `${Date.now()}-${index}-${file.name}`, file }));
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

async function getFiles() {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function clearFiles(ids) {
  const db = await database();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    ids.forEach(id => store.delete(id));
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "POST" || url.pathname !== "/share-target") return;
  event.respondWith((async () => {
    const data = await event.request.formData();
    const files = data.getAll("files").filter(item => item instanceof File && /^(image|video)\//.test(item.type));
    if (files.length) await putFiles(files);
    return Response.redirect(`${url.origin}/?share-inbox=1`, 303);
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "TWILIGHT_GET_SHARE_INBOX") {
    event.waitUntil(getFiles().then(items => event.source?.postMessage({ type: "TWILIGHT_SHARE_INBOX", items })));
  }
  if (event.data?.type === "TWILIGHT_CLEAR_SHARE_INBOX") {
    event.waitUntil(clearFiles(event.data.ids || []));
  }
});

self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
